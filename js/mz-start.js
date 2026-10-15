/* "Get started" chooser: any element with data-start opens it */
(function(){
  var m=location.pathname.match(/^\/([a-z]{2})\//),cc=m?m[1]:null;
  if(!cc){try{cc=localStorage.getItem('mz-cc')}catch(e){}}
  cc=(cc||'gh').toLowerCase();var CC=cc.toUpperCase();
  var css='.mzs-b{position:fixed;inset:0;background:rgba(16,35,63,.55);display:none;align-items:flex-end;justify-content:center;z-index:99999;padding:0}.mzs-b.on{display:flex}'+
  '.mzs-m{background:#fff;color:#10233f;width:100%;max-width:520px;border-radius:20px 20px 0 0;padding:22px 18px 26px;font-family:inherit;max-height:92vh;overflow:auto}'+
  '@media(min-width:640px){.mzs-b{align-items:center;padding:20px}.mzs-m{border-radius:20px}}'+
  '.mzs-m h2{margin:0 0 4px;font-size:24px;line-height:1.2}.mzs-m p{margin:0 0 14px;color:#4a5b73;font-size:15px}'+
  '.mzs-c{display:flex;gap:12px;align-items:center;padding:14px;border:1.5px solid #dde4ed;border-radius:14px;margin-bottom:10px;text-decoration:none;color:inherit}.mzs-c:hover{border-color:#1f9d6b;background:#f6fbf8}'+
  '.mzs-c b{display:block;font-size:17px}.mzs-c span{display:block;font-size:14px;color:#4a5b73;margin-top:2px}.mzs-c i{font-style:normal;font-size:22px;flex:none;width:38px;height:38px;border-radius:10px;background:#e3f6ee;display:flex;align-items:center;justify-content:center}'+
  '.mzs-x{display:block;margin:6px auto 0;background:none;border:0;font:inherit;font-weight:700;color:#4a5b73;padding:10px;cursor:pointer}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var items=[
    ['&#128134;','I need a service','Book a massage, fitness or beauty service','/'+cc+'/#services'],
    ['&#127891;','Take a skill','Learn on your own training dashboard. The business basics are free','/seller.html?kind=trainee&item=basic'],
    ['&#128717;','Take a shop','Open your own online shop with a 7-day free trial','/seller.html?kind=shop'],
    ['&#129309;','Work with us','Offer your service to customers as a MOZLYT provider','/provider.html']
  ];
  var b=document.createElement('div');b.className='mzs-b';b.setAttribute('role','dialog');b.setAttribute('aria-modal','true');b.setAttribute('aria-label','Get started with MOZLYT '+CC);
  b.innerHTML='<div class="mzs-m"><h2>What would you like to do?</h2><p>Choose one to get started with MOZLYT '+CC+'.</p>'+items.map(function(x){return '<a class="mzs-c" href="'+x[3]+'"><i>'+x[0]+'</i><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div></a>'}).join('')+'<button class="mzs-x" type="button">Close</button></div>';
  function add(){document.body.appendChild(b)}
  if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
  function open(e){if(e)e.preventDefault();b.classList.add('on');var f=b.querySelector('a');if(f)f.focus()}
  function close(){b.classList.remove('on')}
  b.addEventListener('click',function(e){if(e.target===b||e.target.className==='mzs-x')close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-start]');if(t)open(e)});
})();
