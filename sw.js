/* MOZLYT service worker: lets the site open fast and work on weak connections.
   Photos, scripts and styles open instantly from the saved copy and refresh quietly in the background.
   Pages ask the internet first (so you always see the latest), but fall back to the saved copy if it is slow or offline. */
var CACHE='mozlyt-v113';
var FILES=['index.html','shop.html','career.html','what-we-do.html','about.html','blog.html','js/mz-api.js','img/logo.png','img/favicon.png','img/icon-192.png','img/icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function save(r,res){if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(r,copy)})}return res}
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url);if(u.origin!==location.origin)return; /* leave WhatsApp, Supabase, Paystack etc. alone */
  var isAsset=/\.(jpg|jpeg|png|webp|svg|gif|ico|woff2?|css)$/i.test(u.pathname)||/\/js\/[^/]+\.js$/.test(u.pathname);
  if(isAsset){
    /* saved copy first, refresh in the background */
    e.respondWith(caches.match(r).then(function(m){
      var net=fetch(r).then(function(res){return save(r,res)}).catch(function(){return m});
      return m||net;
    }));
    return;
  }
  /* pages: internet first, but do not wait more than 3 seconds if a saved copy exists */
  e.respondWith(caches.match(r).then(function(m){
    var net=fetch(r).then(function(res){return save(r,res)});
    if(!m)return net.catch(function(){return caches.match('index.html')});
    return Promise.race([net,new Promise(function(ok){setTimeout(function(){ok(m)},3000)})]).catch(function(){return m});
  }));
});
