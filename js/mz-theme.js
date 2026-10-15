/* Franchise colours for the whole platform. The franchise picks them on its dashboard; every page of its country uses them. */
(function(){
var URL_='https://ziaoopnwhmmrtnmeotia.supabase.co';
function hx(h){h=h.replace('#','');return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]}
function toH(a){return'#'+a.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return(v<16?'0':'')+v.toString(16)}).join('')}
function mix(a,b,p){var x=hx(a),y=hx(b);return toH([x[0]+(y[0]-x[0])*p,x[1]+(y[1]-x[1])*p,x[2]+(y[2]-x[2])*p])}
function lum(h){var c=hx(h);return(.299*c[0]+.587*c[1]+.114*c[2])/255}
function ok(t){return!!t&&/^#[0-9a-fA-F]{6}$/.test(t.accent||'')&&/^#[0-9a-fA-F]{6}$/.test(t.bg||'')}
function css(t){var a=t.accent,a2=mix(a,'#000000',.38),bg=t.bg,c1=mix(bg,'#ffffff',.07),c2=mix(bg,'#000000',.25),ln=mix(bg,'#ffffff',.15),al=mix(a,'#ffffff',.35),bt=lum(a)>.62?'#05070a':'#ffffff',bg2=mix(bg,'#000000',.45),grad='linear-gradient(135deg,'+a+','+a2+')',card='linear-gradient(145deg,'+c1+','+c2+')';
return 'html,body,#dtabs{background:'+bg+'!important}'
+':root{--green:'+a+';--green-d:'+al+'}'
+'.mz-hd,header,.mz-bar,.mz-header,.mz-header .mz-bar,.trust,.chips{background:'+bg+'!important;border-color:'+ln+'!important}'
+'footer,.mz-footer,.mz-ft{background:radial-gradient(700px 300px at 85% 0,'+mix(a,bg,.82)+',transparent 60%),linear-gradient(135deg,'+bg2+','+bg+')!important}'
+'.top,.hero,.dark,.band,.buy,[class*="hero"]{background:radial-gradient(900px 420px at 85% -10%,'+mix(a,bg,.78)+',transparent 60%),radial-gradient(700px 400px at 5% 110%,'+mix(a,bg,.9)+',transparent 60%),linear-gradient(135deg,'+bg2+' 0%,'+bg+' 60%,'+mix(bg,a,.12)+' 100%)!important}'
+'.card,.card2,.row,.tr,.pc,.item,.box,.panel,.tile,.step,.steps,.faq,details,.path,.post,.it,.stat,.st,.net,.per,.mgroup,.svc div,.screen,.cart,.feat,.bp,.pbox,.sub-box .ok,.mv .v,.mv .m{background:'+card+'!important;border-color:'+ln+'!important}'
+'.tbl{background:'+bg+'!important;border-color:'+ln+'!important}.tbl th{background:'+c1+'!important}.tbl th,.tbl td{border-color:'+ln+'!important}'
+'.chip{background:'+c1+'!important;border-color:'+ln+'!important}.chip:hover{border-color:'+a+'!important}'
+'.btn.primary,.btn:not(.ghost):not(.o):not(.w):not(.k):not(.secondary):not(.gold),.mz-btn.mz-primary,.mz-btn:not(.mz-gold),.b2:not(.ghost):not(.red),#dtabs button.on,.tabs button.on,.add.done{background:'+grad+'!important;border-color:'+a+'!important;color:'+bt+'!important;box-shadow:0 6px 18px '+mix(a,bg,.6)+'!important}'
+'.b2.ghost,.b2.red,.btn.ghost,.btn.o,.btn.w,.btn.k,.btn.secondary{background:linear-gradient('+c1+','+c2+')!important;border-color:'+ln+'!important;color:#fff!important;box-shadow:none!important}.b2.red{color:#ff8f82!important}'
+'.add{background:linear-gradient('+c1+','+c2+')!important;color:'+al+'!important;border-color:'+ln+'!important}'
+'.tabs button{background:'+card+'!important;border-color:'+ln+'!important}.tabs button.on{color:'+bt+'!important}'
+'@media(min-width:901px){#dashView>#dtabs{background:linear-gradient(160deg,'+c1+','+c2+')!important;border-color:'+ln+'!important}}'
+'a,.linkbtn,.row-h a,.cc a,.cc em{color:'+al+'}.mz-nav a,.mz-header a,footer a,.mz-footer a{color:#fff}.mz-footer a,footer a{color:#c4cfdb}'
+'.tag,.ic{background:'+mix(a,bg,.78)+'!important;color:'+al+'!important}'
+'.eyb{color:'+al+'!important}'
+'input,select,textarea,.search{background:'+mix(bg,'#000000',.3)+'!important;border-color:'+ln+'!important}.search input{background:transparent!important}'
+'.listbar{background:'+c1+'!important;border-color:'+ln+'!important}'+'.hero#top{background:#0E2A47 image-set(url(/img/photos/hero-desk.webp) type("image/webp"),url(/img/photos/hero-desk.jpg) type("image/jpeg")) no-repeat 78% 16%/cover!important}.hero#top h1{background:none!important;-webkit-text-fill-color:#fff!important;color:#fff!important;font-family:inherit!important;font-weight:inherit!important}.hero#top .btn,.hero#top a.btn{box-shadow:none}'}

function lightCss(t){var a=t.accent,a2=mix(a,'#000000',.38),bg=t.bg,ink='#10233f',mute='#4a5b73',band=mix(a,'#000000',.84),ln=mix(bg,'#000000',.14),c1=mix(bg,'#ffffff',.65),c2=mix(bg,'#ffffff',.3),bt=lum(a)>.62?'#05070a':'#ffffff',ad=mix(a,'#000000',.25),grad='linear-gradient(135deg,'+a+','+a2+')',card='linear-gradient(145deg,'+c1+','+c2+')';
var L='.card,.card2,.row,.tr,.pc,.item,.box,.panel,.tile,.step,.steps,.faq,details,.path,.post,.it,.stat,.st,.net,.per,.mgroup,.svc div,.screen,.cart,.feat,.bp,.pbox,.sub-box .ok,.mv .v,.mv .m,.tbl,.chip,.search,.listbar';
var T='html body,html body h1,html body h2,html body h3,html body h4,html body h5,html body h6,html body b,html body strong,html body p,html body li,html body label,html body td,html body th,html body .logo,html body .mz-logo,html body .price,html body .row-h h2';
var B='.top,.hero,.dark,.band,.buy,[class*="hero"],footer,.mz-footer,.mz-ft';
return 'html,body,#dtabs{background:'+bg+'!important;color:'+ink+'}'
+':root{--green:'+a+';--green-d:'+ad+'}'
+T+'{color:'+ink+'!important}'
+'html body .sub,html body .m,html body small,html body .note,html body .stat span,html body .tbl th{color:'+mute+'!important}'
+'html body a,html body .linkbtn,html body .row-h a{color:'+ad+'}'
+'.mz-hd,header,.mz-bar,.mz-header,.mz-header .mz-bar,.trust,.chips{background:'+bg+'!important;border-color:'+ln+'!important}html body .mz-header .mz-nav a:not(.mz-btn),html body .mz-header .mz-logo,html body .mz-header a.mz-logo{color:'+ink+'!important}html body .mz-header .mz-logo span{color:'+ad+'!important}'
+L+'{background:'+card+'!important;border-color:'+ln+'!important;color:'+ink+'!important}'
+'.tbl th{background:'+c1+'!important}.tbl th,.tbl td{border-color:'+ln+'!important}'
+B+'{background:radial-gradient(900px 420px at 85% -10%,'+mix(a,band,.35)+',transparent 60%),linear-gradient(135deg,'+mix(band,'#000000',.5)+' 0%,'+band+' 100%)!important}'
+B.split(',').map(function(x){return x+',  '+x+' h1,'+x+' h2,'+x+' h3,'+x+' h4,'+x+' p,'+x+' li,'+x+' b,'+x+' strong,'+x+' span,'+x+' small,'+x+' label'}).join(',')+'{color:#e8edf3!important}'
+'.top h1,.hero h1{background:linear-gradient(180deg,#fff 30%,#b6c1cf 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}'
+'footer a,.mz-footer a,.mz-ft a{color:#c4cfdb!important}'
+'.btn.primary,.btn:not(.ghost):not(.o):not(.w):not(.k):not(.secondary):not(.gold),.mz-btn.mz-primary,.mz-btn:not(.mz-gold),.b2:not(.ghost):not(.red),#dtabs button.on,.tabs button.on,.add.done,html body a.btn,html body a.mz-btn.mz-primary{background:'+grad+'!important;border:1px solid '+a+'!important;color:'+bt+'!important;box-shadow:0 6px 16px '+mix(a,bg,.55)+'!important}'
+'.b2.ghost,.b2.red,.btn.ghost,.btn.o,.btn.w,.btn.k,.btn.secondary,.add{background:#fff!important;border:1px solid '+ln+'!important;color:'+ink+'!important;box-shadow:none!important}.b2.red{color:#9b2c20!important}.add{color:'+ad+'!important}'
+'.tabs button{background:#fff!important;border-color:'+ln+'!important;color:'+ink+'!important}.tabs button.on{color:'+bt+'!important}'
+'@media(min-width:901px){#dashView>#dtabs{background:linear-gradient(160deg,'+c1+','+c2+')!important;border-color:'+ln+'!important}#dtabs button{color:'+ink+'!important}#dtabs button.on{color:'+bt+'!important}}'
+'.tag,.ic{background:'+mix(a,'#ffffff',.82)+'!important;color:'+ad+'!important}.eyb{color:'+mix(a,'#ffffff',.5)+'!important}'
+'input,select,textarea,.search{background:#fff!important;color:'+ink+'!important;border:1px solid '+ln+'!important}.search input{background:transparent!important;border:0!important}'
+'.pic,.ph,.pimg{background:'+c2+'!important}'+'.hero#top{background:#0E2A47 image-set(url(/img/photos/hero-desk.webp) type("image/webp"),url(/img/photos/hero-desk.jpg) type("image/jpeg")) no-repeat 78% 16%/cover!important}.hero#top h1{background:none!important;-webkit-text-fill-color:#fff!important;color:#fff!important;font-family:inherit!important;font-weight:inherit!important}.hero#top .btn,.hero#top a.btn{box-shadow:none}'}
function apply(t){var st=document.getElementById('mz-theme-css');if(!t||!ok(t)){if(st)st.textContent='';return}if(!st){st=document.createElement('style');st.id='mz-theme-css';document.head.appendChild(st)}st.textContent=lum(t.bg)>.5?lightCss(t):css(t)}
window.MZTheme={css:function(t){return lum(t.bg)>.5?lightCss(t):css(t)},apply:apply,ok:ok,lum:lum};
/* public pages: use the colours of the franchise of this country */
if(window.MZ_NO_COUNTRY_THEME)return;
var m=location.pathname.match(/^\/([a-z]{2})\//),cc=m?m[1]:null;
if(!cc){try{cc=localStorage.getItem('mz-cc')}catch(e){}}
cc=(cc||'gh').toLowerCase();
var key='mz-th-'+cc;
try{var c=JSON.parse(localStorage.getItem(key)||'null');if(ok(c))apply(c)}catch(e){}
function go(){
 var K=window.MZ&&window.MZ.key;
 fetch(URL_+'/rest/v1/rpc/public_country_theme',{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY,Authorization:'Bearer '+KEY},body:JSON.stringify({p_cc:cc})}).then(function(r){return r.json()}).then(function(t){
  if(ok(t)){apply(t);try{localStorage.setItem(key,JSON.stringify(t))}catch(e){}}else{apply(null);try{localStorage.removeItem(key)}catch(e){}}
 }).catch(function(){});
}
var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW9vcG53aG1tcnRubWVvdGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTA0MDAsImV4cCI6MjEwNzQ4NjQwMH0.YVeqd4OzvIRnQQN3zPrbh4K_46RWKXQTULz41uAR0Ms';
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
