/* MOZLYT country lock: a country site whose franchise is approved and paid, but not yet unlocked by MOZLYT,
   shows everything but takes no orders, bookings or sign-ups, and shows no prices. */
(function(){
  var m=location.pathname.match(/^\/([a-z]{2})\//);if(!m)return;var cc=m[1];
  var K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW9vcG53aG1tcnRubWVvdGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTA0MDAsImV4cCI6MjEwNzQ4NjQwMH0.YVeqd4OzvIRnQQN3zPrbh4K_46RWKXQTULz41uAR0Ms';
  fetch('https://ziaoopnwhmmrtnmeotia.supabase.co/rest/v1/rpc/public_stats',{method:'POST',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:'{}'})
  .then(function(r){return r.json()}).then(function(d){
    if(d&&d.paused_countries&&d.paused_countries.indexOf(cc)>-1){soon();return}
    if(!d||!d.live_countries||d.live_countries.indexOf(cc)<0)return;
    if(!d.open_countries||d.open_countries.indexOf(cc)>-1)return;
    lock();
  }).catch(function(){});
  // a switched-off country: the whole site becomes the same Coming soon page the unopened countries show
  function soon(){
    var nm=cc.toUpperCase();try{nm=new Intl.DisplayNames(['en'],{type:'region'}).of(cc.toUpperCase())||nm}catch(x){}
    var keep=function(e){var t=e.tagName;return t==='SCRIPT'||t==='STYLE'||t==='LINK'||t==='META'||t==='TEMPLATE'||e.id==='mzHeader'||e.classList.contains('mz-header')||e.classList.contains('mz-footer')||e.classList.contains('wa-float')};
    [].slice.call(document.body.children).forEach(function(e){if(!keep(e))e.style.display='none'});
    var b=document.createElement('div');b.id='mz-soon';b.style.cssText='max-width:560px;margin:0 auto;padding:90px 20px;text-align:center';
    b.innerHTML='<div style="font-size:13px;letter-spacing:2px;font-weight:700;color:#C98E14">COMING SOON</div><h1 style="font-family:Georgia,serif;font-size:38px;margin:12px 0">MOZLYT '+nm.replace(/[<>&]/g,'')+'</h1><p style="color:#9fb0c3;font-size:18px;line-height:1.55">We are not open in '+nm.replace(/[<>&]/g,'')+' yet. Check back soon.</p><p><a href="/" style="display:inline-block;margin-top:10px;padding:13px 22px;background:linear-gradient(135deg,#1F9D6B,#14606f);color:#fff;border-radius:10px;font-weight:700;text-decoration:none">Back to MOZLYT</a></p>';
    var h=document.getElementById('mzHeader')||document.querySelector('header');if(h&&h.parentNode)h.parentNode.insertBefore(b,h.nextSibling);else document.body.insertBefore(b,document.body.firstChild);
  }
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
