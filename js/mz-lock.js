/* MOZLYT country lock: a country site whose franchise is approved and paid, but not yet unlocked by MOZLYT,
   shows everything but takes no orders, bookings or sign-ups, and shows no prices. */
(function(){
  var m=location.pathname.match(/^\/([a-z]{2})\//);if(!m)return;var cc=m[1];
  var K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW9vcG53aG1tcnRubWVvdGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTA0MDAsImV4cCI6MjEwNzQ4NjQwMH0.YVeqd4OzvIRnQQN3zPrbh4K_46RWKXQTULz41uAR0Ms';
  fetch('https://ziaoopnwhmmrtnmeotia.supabase.co/rest/v1/rpc/public_stats',{method:'POST',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:'{}'})
  .then(function(r){return r.json()}).then(function(d){
    if(!d||!d.live_countries||d.live_countries.indexOf(cc)<0)return;
    if(!d.open_countries||d.open_countries.indexOf(cc)>-1)return;
    lock();
  }).catch(function(){});
  var MSG='This MOZLYT branch opens soon. You can look around now. Prices, bookings, orders and sign-ups start as soon as the branch is ready.';
  function toast(){var t=document.getElementById('mzLockT');if(!t){t=document.createElement('div');t.id='mzLockT';document.body.appendChild(t)}t.textContent=MSG;t.className='show';clearTimeout(t._h);t._h=setTimeout(function(){t.className=''},4500)}
  function lock(){
    document.documentElement.classList.add('mz-locked');
    var st=document.createElement('style');
    st.textContent='html.mz-locked .price,html.mz-locked .pr{visibility:hidden}#mzLockB{background:#F2B134;color:#0E2A47;text-align:center;font:600 14px/1.45 Inter,system-ui,sans-serif;padding:10px 16px}#mzLockT{position:fixed;left:16px;right:16px;bottom:90px;z-index:9999;background:#0E2A47;color:#fff;border-radius:14px;padding:14px 16px;font:500 15px/1.45 Inter,system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.3);opacity:0;transform:translateY(10px);transition:.25s;pointer-events:none;max-width:520px;margin:0 auto}#mzLockT.show{opacity:1;transform:none}';
    document.head.appendChild(st);
    var b=document.createElement('div');b.id='mzLockB';b.textContent='Opening soon. Prices, bookings and sign-ups start when this MOZLYT branch is ready.';
    var h=document.getElementById('mzHeader')||document.querySelector('header');if(h&&h.parentNode)h.parentNode.insertBefore(b,h.nextSibling);else document.body.insertBefore(b,document.body.firstChild);
    var SEL='[data-svc],button.add,#lsend,#shipYes,[data-start],#bookForm button,#bookForm [type=submit],a[href*="seller.html"],#skBtn,#shopBtn';
    document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest(SEL);if(!x)return;e.preventDefault();e.stopImmediatePropagation();toast()},true);
    document.addEventListener('submit',function(e){if(e.target&&e.target.id==='bookForm'){e.preventDefault();e.stopImmediatePropagation();toast()}},true);
  }
})();
