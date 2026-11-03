// MOZLYT custom-domain Worker.
// Cloudflare sends every seller domain (www.amawellness.com and so on) here.
// It shows that seller's store by serving the MOZLYT store page. The page itself
// reads the domain name in the browser and looks up which store it belongs to.
const ORIGIN = 'https://mozlyt.com';
const SB = 'https://ziaoopnwhmmrtnmeotia.supabase.co';
const SBKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW9vcG53aG1tcnRubWVvdGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTA0MDAsImV4cCI6MjEwNzQ4NjQwMH0.YVeqd4OzvIRnQQN3zPrbh4K_46RWKXQTULz41uAR0Ms'; // public anon key, the same one the website uses
const ASSET = /\.(js|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|json|webmanifest|txt|xml)$/i;


const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ask the database (and keep the answer for 5 minutes so visitors do not wait for it)
async function sb(fn, body, ctx) {
  const key = new Request('https://mozlyt-cache.internal/' + fn + '/' + encodeURIComponent(JSON.stringify(body)));
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return hit.json();
  const r = await fetch(SB + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: SBKEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) return null;
  const txt = await r.text();
  const put = cache.put(key, new Response(txt, { headers: { 'content-type': 'application/json', 'cache-control': 'max-age=300' } }));
  if (ctx && ctx.waitUntil) ctx.waitUntil(put);
  return JSON.parse(txt);
}

// what Google shows for the shop: a real title and description, written into the page before it is sent
async function shopSeo(host, origin, ctx) {
  try {
    let slug = await sb('resolve_domain', { p_host: host.replace(/^www\./, '') }, ctx);
    if (!slug) slug = await sb('resolve_domain', { p_host: host }, ctx);
    if (!slug) return null;
    const s = await sb('get_store', { p_slug: slug }, ctx);
    if (!s || s.inactive) return null;
    const name = String(s.store_name || 'Shop');
    const ps = (s.products || []).filter((p) => !p.sold_out);
    const cats = [...new Set(ps.map((p) => p.category).filter(Boolean))];
    const fit = cats.some((c) => /fitness|gym|sport/i.test(c));
    const kind = fit ? 'fitness shop' : 'online shop';
    const title = name + ' | ' + (fit ? 'Fitness Shop in Ghana' : 'Online Shop in Ghana');
    const items = ps.slice(0, 5).map((p) => p.name).join(', ');
    const desc = (name + ' is an online ' + kind + ' in Ghana' + (cats.length ? ': ' + cats.join(', ').toLowerCase() : '') + '. ' +
      (items ? 'Shop ' + items + (ps.length > 5 ? ' and more' : '') + '. ' : '') + 'Order on WhatsApp or pay online.').slice(0, 300);
    const img = (ps.find((p) => p.photo) || {}).photo || '';
    const ld = { '@context': 'https://schema.org', '@type': 'Store', name, url: origin + '/', description: desc, image: img || undefined, areaServed: 'Ghana' };
    return { title, desc, img, ld, name };
  } catch (e) { return null; }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // MOZLYT's own addresses are never rewritten
    if (host === 'mozlyt.com' || host.endsWith('.mozlyt.com')) return fetch(request);

    // certificate checks (Let's Encrypt / Cloudflare) must reach Cloudflare untouched, never be redirected
    if (url.pathname.startsWith('/.well-known/')) return fetch(request);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    // each shop domain gets its own robots.txt and sitemap (never MOZLYT's own)
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\n\nSitemap: ' + url.origin + '/sitemap.xml\n', { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    }
    if (url.pathname === '/sitemap.xml') {
      const today = new Date().toISOString().slice(0, 10);
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>' + url.origin + '/</loc><lastmod>' + today + '</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n';
      return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
    }

    let path = url.pathname;
    if (path === '/' || path === '' || path === '/store.html' || path === '/index.html') {
      path = '/store.html';
    } else if (!ASSET.test(path) && !path.startsWith('/img/') && !path.startsWith('/js/') && !path.startsWith('/css/') && !path.startsWith('/fonts/')) {
      return Response.redirect(url.origin + '/', 302);
    }

    // keep the store link working if someone adds ?s=... themselves, otherwise the page uses the domain
    const target = ORIGIN + path + (path === '/store.html' ? url.search : '');
    // keep copies at Cloudflare so most visits never travel to the origin: a few minutes for pages and code, a day for pictures
    const isHtml = path === '/store.html';
    const isCode = /\.(js|css|json|webmanifest)$/i.test(path);
    const ttl = path === '/sw.js' ? 0 : isHtml ? 120 : isCode ? 300 : 86400;
    const res = await fetch(target, {
      method: request.method,
      headers: { accept: request.headers.get('accept') || '*/*', 'accept-language': request.headers.get('accept-language') || '' },
      redirect: 'follow',
      cf: ttl ? { cacheEverything: true, cacheTtl: ttl, cacheTtlByStatus: { '200-299': ttl, '404': 10, '500-599': 0 } } : { cacheEverything: false },
    });
    let body = res;
    if (isHtml && res.ok && request.method === 'GET') {
      const seo = await shopSeo(host, url.origin, ctx);
      if (seo) {
        const tags = '<meta name="description" content="' + esc(seo.desc) + '">' +
          '<link rel="canonical" href="' + esc(url.origin + '/') + '">' +
          '<meta property="og:title" content="' + esc(seo.title) + '"><meta property="og:description" content="' + esc(seo.desc) + '">' +
          '<meta property="og:type" content="website"><meta property="og:url" content="' + esc(url.origin + '/') + '">' +
          (seo.img ? '<meta property="og:image" content="' + esc(seo.img) + '">' : '') +
          '<script type="application/ld+json" id="seo-ld">' + JSON.stringify(seo.ld).replace(/</g, '\\u003c') + '</script>';
        body = new HTMLRewriter()
          .on('title', { element(e) { e.setInnerContent(seo.title); } })
          .on('meta[name="robots"]', { element(e) { e.setAttribute('content', 'index,follow'); } })
          .on('meta[name="description"]', { element(e) { e.remove(); } })
          .on('head', { element(e) { e.append(tags, { html: true }); } })
          .transform(res);
      }
    }
    const out = new Response(body.body, body);
    out.headers.set('x-mozlyt-domain', host);
    if (res.ok && ttl) out.headers.set('cache-control', 'public, max-age=' + Math.min(ttl, 300) + ', stale-while-revalidate=86400');
    return out;
  },
};
