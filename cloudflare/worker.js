// MOZLYT custom-domain Worker.
// Cloudflare sends every seller domain (www.amawellness.com and so on) here.
// It shows that seller's store by serving the MOZLYT store page. The page itself
// reads the domain name in the browser and looks up which store it belongs to.
const ORIGIN = 'https://mozlyt.com';
const ASSET = /\.(js|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|json|webmanifest|txt|xml)$/i;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // MOZLYT's own addresses are never rewritten
    if (host === 'mozlyt.com' || host.endsWith('.mozlyt.com')) return fetch(request);

    // certificate checks (Let's Encrypt / Cloudflare) must reach Cloudflare untouched, never be redirected
    if (url.pathname.startsWith('/.well-known/')) return fetch(request);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
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
    const out = new Response(res.body, res);
    out.headers.set('x-mozlyt-domain', host);
    if (res.ok && ttl) out.headers.set('cache-control', 'public, max-age=' + Math.min(ttl, 300) + ', stale-while-revalidate=86400');
    return out;
  },
};
