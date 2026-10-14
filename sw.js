/* MOZLYT service worker: lets the site open fast and work on weak connections.
   Pages are fetched fresh when online, and the saved copy is used when offline. */
var CACHE='mozlyt-v25';
var FILES=['index.html','shop.html','career.html','what-we-do.html','about.html','blog.html','img/logo.png','img/favicon.png','img/mensah.jpg','img/icon-192.png','img/icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url);if(u.origin!==location.origin)return; /* leave WhatsApp, Google Sheets, etc. alone */
  e.respondWith(fetch(r).then(function(res){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(r,copy)});return res}).catch(function(){return caches.match(r).then(function(m){return m||caches.match('index.html')})}));
});
