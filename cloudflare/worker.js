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
    const res = await fetch(target, {
      method: request.method,
      headers: { accept: request.headers.get('accept') || '*/*', 'accept-language': request.headers.get('accept-language') || '' },
      redirect: 'follow',
    });
    const out = new Response(res.body, res);
    out.headers.set('x-mozlyt-domain', host);
    return out;
  },
};
