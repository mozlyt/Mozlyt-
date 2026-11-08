/* MOZLYT customer account panel for a shop page.
   Adds a slide-in panel (sign in, create account, my orders with tracking, my details, help on WhatsApp)
   to a page that already has its own look. It never changes the page itself or how people buy.
   Use: MZAccount.init({slug:'mozlyt-gh', name:'MOZLYT', whatsapp:'233538729743', button:'#mzAcct'}) */
(function () {
  var cfg = null, ACC = null, AT = 'orders', AM = 'in', built = false, BK = null, BF = 'all', HS = 'menu', CREF = '', chatT = null;
  var ST = { 'new': 'Received', confirmed: 'Confirmed', paid: 'Paid', delivered: 'Delivered', cancelled: 'Cancelled' };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return MZ.esc(s); }
  function wa(t) { return cfg.whatsapp ? 'https://wa.me/' + MZ.phoneIntl(cfg.whatsapp) + '?text=' + encodeURIComponent(t) : ''; }
  function first(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
  function busy(b, on, label) { if (!b) return; b.disabled = on; if (on && label) { b.dataset.l = b.textContent; b.textContent = label; } else if (!on && b.dataset.l) { b.textContent = b.dataset.l; delete b.dataset.l; } }
  function note(t, ty) { var n = $('#mzaNote'); if (n) n.innerHTML = t ? '<div class="mza-msg ' + (ty || 'err') + '">' + esc(t) + '</div>' : ''; }
  function toast(t) { var d = document.createElement('div'); d.className = 'mza-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2200); }

  function css() {
    if ($('#mza-css')) return;
    var s = document.createElement('style'); s.id = 'mza-css';
    s.textContent = '.mza{position:fixed;inset:0;z-index:300;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#0E2A47}.mza[hidden]{display:none}' +
      '.mza-bg{position:absolute;inset:0;background:rgba(9,26,46,.5)}.mza-p{position:absolute;right:0;top:0;bottom:0;width:min(440px,100%);background:#fff;padding:18px;overflow-y:auto;box-shadow:-10px 0 40px rgba(0,0,0,.2)}' +
      '.mza-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 12px}.mza-top h3{margin:0;font:700 20px Georgia,serif}' +
      '.mza button,.mza a{font-family:inherit}.mza-x{border:1px solid #DCE4DE;background:#fff;border-radius:10px;padding:9px 14px;font-weight:600;font-size:14px;cursor:pointer;color:#0E2A47}' +
      '.mza-tabs button{font-size:13px!important;padding:9px 2px!important}.mza-chat{height:300px;overflow-y:auto;border:1px solid #DCE4DE;border-radius:12px;padding:10px;margin:8px 0;display:flex;flex-direction:column;gap:8px;background:#F5F7F4}.mza-b{max-width:82%;padding:9px 12px;border-radius:14px;font-size:14.5px;line-height:1.4;word-break:break-word}.mza-b small{display:block;margin-top:3px;font-size:11.5px;opacity:.7}.mza-b.u{align-self:flex-end;background:#1F9D6B;color:#fff}.mza-b.a{align-self:flex-start;background:#fff;border:1px solid #DCE4DE;color:#0E2A47}' +
      '.mza-sub{margin:0 0 12px;color:#4b5a6a;font-size:14.5px;line-height:1.5}' +
      '.mza label{display:grid;gap:5px;font-weight:600;font-size:14px;margin:0 0 12px}.mza input{padding:12px;border:1.5px solid #cfd8d2;border-radius:10px;font-size:16px;width:100%;box-sizing:border-box;color:#0E2A47;background:#fff}.mza input:disabled{background:#f1f4f2;color:#5b6b62}' +
      '.mza input:focus{outline:none;border-color:#1F9D6B;box-shadow:0 0 0 3px rgba(31,157,107,.15)}' +
      '.mza-btn{display:flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;padding:13px 16px;border:0;border-radius:10px;background:#1F9D6B;color:#fff;font-weight:700;font-size:16px;cursor:pointer;text-decoration:none}.mza-btn:hover{background:#157650}.mza-btn:disabled{opacity:.6}' +
      '.mza-btn.wa{background:#E8F5EE;color:#14663f;border:1.5px solid #9fd3b6}.mza-btn.sm{width:auto;padding:9px 14px;font-size:14px}.mza-btn.ghost{background:#fff;color:#0E2A47;border:1.5px solid #cfd8d2}' +
      '.mza-link{background:none;border:0;color:#14663f;font-weight:600;font-size:14px;text-decoration:underline;cursor:pointer;padding:6px 0}' +
      '.mza-soc{margin-top:16px}.mza-soc .or{display:flex;align-items:center;gap:10px;color:#6b7a8c;font-size:13px;margin-bottom:10px}.mza-soc .or:before,.mza-soc .or:after{content:"";flex:1;border-top:1px solid #DCE4DE}.mza-sb{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;background:#fff;border:1.5px solid #DCE4DE;border-radius:12px;padding:12px;margin-bottom:8px;font:600 15px inherit;font-family:inherit;color:#0E2A47;cursor:pointer;min-height:48px}.mza-sb:hover{border-color:#157650}.mza-p{display:flex;flex-direction:column}#mzaBody{flex:1;display:flex;flex-direction:column}#mzaPane{flex:1}.mza-nav{position:sticky;bottom:-18px;margin:14px -18px -18px!important;padding:8px 12px calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #DCE4DE;z-index:2;margin-top:auto!important}.mza-nav button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 2px;font-size:12px;min-height:62px}.mza-nav svg{width:22px;height:22px}.mza-tabs{display:flex;gap:6px;margin:0 0 12px}.mza-tabs button{flex:1;padding:9px 6px;border:1.5px solid #DCE4DE;background:#fff;color:#0E2A47;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer}.mza-tabs button.on{background:#0E2A47;color:#fff;border-color:#0E2A47}' +
      '.mza-card{background:#fff;border:1px solid #DCE4DE;border-radius:12px;padding:12px 14px;margin:0 0 10px;display:grid;gap:7px}.mza-card .m{color:#4b5a6a;font-size:13.5px}.mza-card .h{display:flex;justify-content:space-between;gap:8px;align-items:center}' +
      '.mza-tag{display:inline-block;padding:3px 10px;border-radius:99px;background:#E8F5EE;color:#14663f;font-weight:700;font-size:12.5px}.mza-tag.bad{background:#FDE8E8;color:#a32121}.mza-tag.warn{background:#FFF4D6;color:#7a5a00}' +
      '.mza-trk{display:flex;align-items:center;gap:0;margin:4px 0 2px}.mza-trk i{flex:1;height:4px;background:#e1e8e3;border-radius:4px}.mza-trk i.on{background:#1F9D6B}.mza-trk b{width:14px;height:14px;border-radius:50%;background:#e1e8e3;flex:none}.mza-trk b.on{background:#1F9D6B}' +
      '.mza-trkl{display:flex;justify-content:space-between;font-size:12.5px;color:#4b5a6a}.mza-trkl .on{color:#14663f;font-weight:700}' +
      '.mza-msg{padding:11px 13px;border-radius:10px;font-size:14.5px;margin:0 0 12px}.mza-msg.ok{background:#E8F5EE;color:#14663f}.mza-msg.err{background:#FDE8E8;color:#8a1c1c}' +
      '.mza-empty{text-align:center;color:#4b5a6a;padding:26px 10px}.mza-eye{position:relative;display:block}.mza-eye button{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:none;color:#14663f;font-weight:700;font-size:13px;padding:8px;cursor:pointer}' +
      '.mza-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#0E2A47;color:#fff;padding:11px 18px;border-radius:99px;font-size:14.5px;z-index:400}';
    document.head.appendChild(s);
  }
  function build() {
    if (built) return; built = true; css();
    var d = document.createElement('div'); d.className = 'mza'; d.id = 'mza'; d.hidden = true; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="mza-bg" id="mzaBg"></div><div class="mza-p"><div class="mza-top"><h3 id="mzaTitle">Your account</h3><button class="mza-x" id="mzaClose" type="button">Close</button></div><div id="mzaBody"></div><a id="mzaHelp" class="mza-btn wa" target="_blank" rel="noopener" hidden style="margin-top:16px">Need help? Chat with us on WhatsApp</a></div>';
    document.body.appendChild(d);
    $('#mzaBg').onclick = $('#mzaClose').onclick = close;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
  function close() { var d = $('#mza'); if (d) d.hidden = true; }
  function eye(root) {
    $$('input[type=password]', root).forEach(function (i) {
      if (i.dataset.eye) return; i.dataset.eye = '1'; var w = document.createElement('span'); w.className = 'mza-eye'; i.parentNode.insertBefore(w, i); w.appendChild(i); i.style.paddingRight = '64px';
      var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Show'; b.onclick = function () { var h = i.type === 'password'; i.type = h ? 'text' : 'password'; b.textContent = h ? 'Hide' : 'Show'; }; w.appendChild(b);
    });
  }

  function open() {
    build(); var h = $('#mzaHelp'), l = wa('Hello ' + cfg.name + ', I need help.'); h.hidden = !l; h.style.display = ''; if (l) h.href = l;
    $('#mza').hidden = false;
    if (MZ.loggedIn()) { $('#mzaBody').innerHTML = '<div class="mza-empty">Loading...</div>'; fetchAcc().then(show); } else show();
  }
  function fetchAcc() {
    if (!MZ.loggedIn()) { ACC = null; return Promise.resolve(null); }
    return MZ.rpc('get_my_account', { p_slug: cfg.slug }).then(function (a) { ACC = a; return a; }, function () { ACC = null; return null; });
  }
  function show() { if (!MZ.loggedIn() || !ACC) authView(); else if (!ACC.joined) joinView(); else mainView(); }

  function authView() {
    authView0();
    if (AM === 'forgot') return;
    var b = $('#mzaBody'), d = document.createElement('div'); d.className = 'mza-soc';
    var G = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.2 1-3.8 1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.2H2.1a11 11 0 0 0 0 9.6z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.1 7.2L5.7 10c.9-2.6 3.4-4.6 6.3-4.6z"/></svg>';
    var F = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>';
    var A = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.1-.8a4.6 4.6 0 0 0-3.9 2.4c-1.7 2.9-.4 7.2 1.2 9.5.8 1.2 1.7 2.4 3 2.4s1.7-.8 3.1-.8 1.9.8 3.1.8 2.1-1.2 2.9-2.3c.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1.1.1 2.1-.5 2.8-1.4z"/></svg>';
    var txt = AM === 'up' ? 'Sign up with ' : 'Continue with ';
    d.innerHTML = '<div class="or">or</div>' + [['google', 'Google', G], ['facebook', 'Facebook', F], ['apple', 'Apple', A]].map(function (x) { return '<button type="button" class="mza-sb" data-p="' + x[0] + '">' + x[2] + '<span>' + txt + x[1] + '</span></button>'; }).join('') + '<div id="mzaSocN" class="mza-sub" style="margin-top:6px"></div>';
    b.appendChild(d);
    $$('.mza-sb', d).forEach(function (x) { x.onclick = function () { $('#mzaSocN').textContent = 'Opening ' + x.dataset.p + '...'; MZ.oauth(x.dataset.p); }; });
  }
  function authView0() {
    var b = $('#mzaBody'); $('#mzaTitle').textContent = AM === 'up' ? 'Create your account' : AM === 'forgot' ? 'Reset password' : 'Sign in';
    if (AM === 'forgot') {
      b.innerHTML = '<p class="mza-sub">Enter your email and we will send you a link to set a new password. After that, come back here and sign in.</p><form id="mzaF"><label>Email<input id="mzaE" type="email" required autocomplete="email"></label><button class="mza-btn" type="submit">Send the link</button></form><div id="mzaNote" style="margin-top:10px"></div><button class="mza-link" type="button" id="mzaBack">Back to sign in</button>';
      $('#mzaBack').onclick = function () { AM = 'in'; authView(); };
      $('#mzaF').onsubmit = function (e) { e.preventDefault(); var bt = $('button[type=submit]', this); busy(bt, true, 'Sending...'); MZ.recover($('#mzaE').value.trim()).then(function () { note('If that email has an account, a link is on its way. Check your inbox and spam.', 'ok'); }, function (er) { note(er.message); }).then(function () { busy(bt, false); }); };
      return;
    }
    if (AM === 'up') {
      b.innerHTML = '<p class="mza-sub">Free. Keep your orders in one place, track them, and keep your delivery address ready for next time.</p><form id="mzaF"><label>Your name<input id="mzaN" required maxlength="80" autocomplete="name"></label><label>Phone / WhatsApp<input id="mzaP" type="tel" required maxlength="20" autocomplete="tel"></label><label>Email<input id="mzaE" type="email" required autocomplete="email"></label><label>Password (8 or more characters)<input id="mzaW" type="password" required minlength="8" autocomplete="new-password"></label><button class="mza-btn" type="submit">Create my account</button></form><div id="mzaNote" style="margin-top:10px"></div><button class="mza-link" type="button" id="mzaSw">I already have an account</button>';
      eye(b); $('#mzaSw').onclick = function () { AM = 'in'; authView(); };
      $('#mzaF').onsubmit = function (e) {
        e.preventDefault(); var bt = $('button[type=submit]', this), nm = $('#mzaN').value.trim(), ph = $('#mzaP').value.trim(); busy(bt, true, 'Creating...');
        MZ.signUp($('#mzaE').value.trim(), $('#mzaW').value, { kind: 'customer', full_name: nm, phone: ph }, 'store.html').then(function (r) {
          if (!r || !r.confirmed) { note('That email already has an account. Please sign in instead.'); AM = 'in'; setTimeout(authView, 1800); return; }
          return MZ.rpc('join_shop', { p_slug: cfg.slug, p_name: nm, p_phone: ph }).then(fetchAcc).then(show);
        }).catch(function (er) { note(er.message); }).then(function () { busy(bt, false); });
      };
      return;
    }
    b.innerHTML = '<form id="mzaF"><label>Email<input id="mzaE" type="email" required autocomplete="email"></label><label>Password<input id="mzaW" type="password" required autocomplete="current-password"></label><button class="mza-btn" type="submit">Sign in</button></form><div id="mzaNote" style="margin-top:10px"></div><div style="display:flex;justify-content:space-between;flex-wrap:wrap"><button class="mza-link" type="button" id="mzaSw">Create a free account</button><button class="mza-link" type="button" id="mzaFg">Forgot password?</button></div>';
    eye(b); $('#mzaSw').onclick = function () { AM = 'up'; authView(); }; $('#mzaFg').onclick = function () { AM = 'forgot'; authView(); };
    $('#mzaF').onsubmit = function (e) { e.preventDefault(); var bt = $('button[type=submit]', this); busy(bt, true, 'Signing in...'); MZ.signIn($('#mzaE').value.trim(), $('#mzaW').value).then(fetchAcc).then(show).catch(function (er) { note(er.message); }).then(function () { busy(bt, false); }); };
  }
  function joinView() {
    var u = MZ.user() || {}; $('#mzaTitle').textContent = 'Welcome';
    $('#mzaBody').innerHTML = '<p class="mza-sub">You are signed in as <b>' + esc(u.email || ACC.email || '') + '</b>. Add your details to start keeping your orders here.</p><form id="mzaF"><label>Your name<input id="mzaN" required maxlength="80" autocomplete="name"></label><label>Phone / WhatsApp<input id="mzaP" type="tel" required maxlength="20" autocomplete="tel"></label><button class="mza-btn" type="submit">Save</button></form><div id="mzaNote" style="margin-top:10px"></div><button class="mza-link" type="button" id="mzaOut">Not you? Sign out</button>';
    $('#mzaOut').onclick = out;
    $('#mzaF').onsubmit = function (e) { e.preventDefault(); var bt = $('button[type=submit]', this); busy(bt, true, 'Saving...'); MZ.rpc('join_shop', { p_slug: cfg.slug, p_name: $('#mzaN').value.trim(), p_phone: $('#mzaP').value.trim() }).then(fetchAcc).then(show).catch(function (er) { note(er.message); }).then(function () { busy(bt, false); }); };
  }
  function out() { MZ.signOut().then(function () { ACC = null; AM = 'in'; authView(); }); }
  function tracker(st) {
    if (st === 'cancelled') return '';
    var n = st === 'delivered' ? 3 : (st === 'confirmed' || st === 'paid') ? 2 : 1, L = ['Received', 'Confirmed', 'Delivered'], bar = '', lab = '';
    for (var i = 1; i <= 3; i++) { bar += (i > 1 ? '<i class="' + (i <= n ? 'on' : '') + '"></i>' : '') + '<b class="' + (i <= n ? 'on' : '') + '"></b>'; lab += '<span class="' + (i === n ? 'on' : '') + '">' + L[i - 1] + '</span>'; }
    return '<div class="mza-trk">' + bar + '</div><div class="mza-trkl">' + lab + '</div>';
  }
  function mainView() {
    var a = ACC, b = $('#mzaBody'); $('#mzaTitle').textContent = 'Hi, ' + (first(a.name) || 'there');
    var NI = {"orders": "<path d=\"M5 8h14l-1 12H6z\"/><path d=\"M9 8V6a3 3 0 0 1 6 0v2\"/>", "book": "<rect x=\"4\" y=\"5\" width=\"16\" height=\"15\" rx=\"2.5\"/><path d=\"M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4\"/>", "cart": "<path d=\"M3 4h2l2 11h10l2-8H7\"/><circle cx=\"9\" cy=\"19\" r=\"1.3\"/><circle cx=\"16\" cy=\"19\" r=\"1.3\"/>", "me": "<circle cx=\"12\" cy=\"8\" r=\"3.6\"/><path d=\"M4.5 20c.8-3.8 3.8-5.8 7.5-5.8s6.7 2 7.5 5.8\"/>", "help": "<path d=\"M4 5h16v11H9l-5 4z\"/>"}.valueOf(); b.innerHTML = '<div id="mzaPane"></div><div class="mza-tabs mza-nav">' + [['orders', 'Orders'], ['book', 'Bookings'], ['cart', 'Cart'], ['me', 'Details'], ['help', 'Help']].map(function (t) { return '<button type="button" data-a="' + t[0] + '" aria-label="My ' + t[1].toLowerCase() + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + NI[t[0]] + '</svg>' + t[1] + '</button>'; }).join('') + '</div>';
    $$('.mza-tabs button', b).forEach(function (x) { x.classList.toggle('on', x.dataset.a === AT); x.onclick = function () { AT = x.dataset.a; HS = 'menu'; CREF = ''; mainView(); }; });
    clearInterval(chatT);
    var hh = $('#mzaHelp'); if (hh) hh.style.display = 'none';
    var p = $('#mzaPane');
    if (AT === 'cart') {
      var CL = []; try { CL = JSON.parse(localStorage.getItem('mz-gh-list') || '[]'); } catch (e) { }
      p.innerHTML = CL.length ? '<p class="mza-sub">Products waiting to be checked out.</p>' + CL.map(function (n, i) { return '<div class="mza-card"><b>' + esc(n) + '</b></div>'; }).join('') + '<a class="mza-btn" style="display:block;text-align:center;text-decoration:none;margin-top:10px" href="/gh/shop.html#cart">Go to checkout</a>' : '<div class="mza-empty"><b>Your cart is empty</b><br>Products you add to your list in the shop wait here until you check out.</div>';
      return;
    }
    if (AT === 'orders') {
      p.innerHTML = (a.orders || []).map(function (o) {
        return '<div class="mza-card"><div class="h"><b>Order #' + o.id + '</b><span class="mza-tag' + (o.status === 'cancelled' ? ' bad' : o.status === 'new' ? ' warn' : '') + '">' + esc(ST[o.status] || o.status || 'Received') + '</span></div>' +
          '<div class="m">' + MZ.when(o.created_at) + (o.paid ? ' &middot; Paid online' : '') + '</div>' + tracker(o.status) +
          '<div>' + (o.items || []).map(function (i) { return esc((i.qty || 1) + ' x ' + i.name); }).join(', ') + '</div>' + (o.total != null ? '<div><b>' + MZ.money(o.total) + '</b></div>' : '') +
          '<div><a class="mza-btn sm ghost" style="display:inline-flex" target="_blank" rel="noopener" href="' + esc(wa('Hello ' + cfg.name + ', I have a question about my order #' + o.id + '.')) + '">Ask about this order</a></div></div>';
      }).join('') || '<div class="mza-empty">No orders here yet. Orders you place with us will show up here so you can follow them.</div>';
    } else if (AT === 'book') {
      bookView(p);
    } else if (AT === 'me') {
      var ad = (a.addresses || []).slice(0, 5); if (!ad.length) ad = [''];
      p.innerHTML = '<form id="mzaF"><label>Name<input id="mzaN" required maxlength="80" value="' + esc(a.name) + '"></label><label>Phone / WhatsApp<input id="mzaP" type="tel" required maxlength="20" value="' + esc(a.phone) + '"></label><label>Email<input value="' + esc(a.email || '') + '" disabled></label><div id="mzaAd"></div><label style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4"><input type="checkbox" id="mzaMk" style="width:auto;margin-top:3px"'+(a.marketing_ok?' checked':'')+'><span>Send me offers and updates from this shop</span></label><button class="mza-link" type="button" id="mzaAdd">+ Add another address</button><button class="mza-btn" type="submit">Save my details</button></form><div id="mzaNote" style="margin-top:10px"></div><button class="mza-link" type="button" id="mzaOut">Sign out</button>';
      var draw = function () { $('#mzaAd').innerHTML = ad.map(function (x, i) { return '<label>Delivery address ' + (i + 1) + '<input class="mzaad" maxlength="200" placeholder="e.g. East Legon, near the mall" value="' + esc(x) + '"></label>'; }).join(''); $('#mzaAdd').hidden = ad.length >= 5; $$('.mzaad').forEach(function (inp, i) { inp.oninput = function () { ad[i] = inp.value; }; }); }; draw();
      $('#mzaMk').onchange = function () { var v = this.checked; MZ.rpc('set_my_marketing', { p_slug: cfg.slug, p_ok: v }).then(function () { if (ACC) ACC.marketing_ok = v; toast(v ? 'You will get offers from this shop' : 'You will not get offers any more'); }, function (er) { toast(er.message); }); }; $('#mzaAdd').onclick = function () { ad.push(''); draw(); var l = $$('.mzaad'); l[l.length - 1].focus(); }; $('#mzaOut').onclick = out;
      $('#mzaF').onsubmit = function (e) { e.preventDefault(); var bt = $('button[type=submit]', this); busy(bt, true, 'Saving...');
        MZ.rpc('save_my_account', { p_slug: cfg.slug, p_name: $('#mzaN').value.trim(), p_phone: $('#mzaP').value.trim(), p_addresses: ad.filter(function (x) { return String(x).trim(); }) }).then(fetchAcc).then(function () { toast('Saved'); mainView(); }).catch(function (er) { note(er.message); }).then(function () { busy(bt, false); }); };
    } else {
      helpView(p);
    }
  }
  var BST = { pending: ['Pending', ' warn'], confirmed: ['Confirmed', ''], travel: ['Provider on the way', ''], arrived: ['Provider arrived', ''], finished: ['Service done', ''], completed: ['Completed', ''], cancelled: ['Cancelled', ' bad'] };
  var BSTEP = { pending: 0, confirmed: 1, travel: 2, arrived: 3, finished: 4, completed: 4, cancelled: -1 };
  function bookView(p) {
    p.innerHTML = '<p class="mza-sub">Your service requests and appointments. Product orders are under My orders.</p><div class="mza-tabs" id="mzaBF"></div><div id="mzaBL"><div class="mza-empty">Loading...</div></div>';
    var draw = function () {
      var F = [['all', 'All'], ['pending', 'Pending'], ['confirmed', 'Confirmed'], ['completed', 'Completed']];
      $('#mzaBF').innerHTML = F.map(function (f) { return '<button type="button" data-f="' + f[0] + '" class="' + (BF === f[0] ? 'on' : '') + '">' + f[1] + '</button>'; }).join('');
      $$('#mzaBF button').forEach(function (b) { b.onclick = function () { BF = b.dataset.f; draw(); }; });
      var list = (BK || []).filter(function (b) { return BF === 'all' || (BF === 'pending' && b.state === 'pending') || (BF === 'confirmed' && ['confirmed', 'travel', 'arrived', 'finished'].indexOf(b.state) > -1) || (BF === 'completed' && b.state === 'completed'); });
      $('#mzaBL').innerHTML = list.map(function (b) {
        var st = BST[b.state] || BST.pending, n = BSTEP[b.state], L = ['Requested', 'Confirmed', 'On the way', 'Arrived', 'Done'], bar = '', lab = '';
        if (n >= 0) for (var i = 0; i < 5; i++) { bar += (i ? '<i class="' + (i <= n ? 'on' : '') + '"></i>' : '') + '<b class="' + (i <= n ? 'on' : '') + '"></b>'; lab += '<span class="' + (i === n ? 'on' : '') + '">' + L[i] + '</span>'; }
        return '<div class="mza-card"><div class="h"><b>' + esc(b.service) + '</b><span class="mza-tag' + st[1] + '">' + esc(st[0]) + '</span></div>' +
          '<div class="m">Booking #' + b.id + ' &middot; ' + (b.date ? esc(b.date) : 'Date flexible') + ', ' + esc(b.slot || 'any time') + '<br>' + esc([b.place, b.area].filter(Boolean).join(', ')) + '</div>' +
          (n >= 0 ? '<div class="mza-trk">' + bar + '</div><div class="mza-trkl" style="font-size:11px">' + lab + '</div>' : '') +
          '<div>' + (b.providers && b.providers.length ? 'Provider' + (b.providers.length > 1 ? 's' : '') + ': <b>' + esc(b.providers.join(', ')) + '</b><br>' : '') + (b.price != null ? 'Price: <b>' + MZ.money(b.price) + '</b>' : '<span class="m">Price: MOZLYT will confirm the price with you</span>') + '</div>' +
          '<div style="margin-top:8px"><button type="button" class="mza-btn sm ghost" data-ask="' + b.id + '">Contact support about this booking</button></div></div>';
      }).join('') || '<div class="mza-empty"><svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#8a97a8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:0 auto 8px"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01"/></svg><b>' + (BK && BK.length ? 'Nothing in this list' : 'No bookings yet') + '</b><br>Your service requests and appointments will appear here. Once you book a service, you can follow its progress.<br><a class="mza-btn" style="margin-top:12px;display:inline-flex" href="/gh/services.html">Explore services</a></div>';
      $$('#mzaBL [data-ask]').forEach(function (b) { b.onclick = function () { AT = 'help'; HS = 'chat'; CREF = 'Booking #' + b.dataset.ask; mainView(); }; });
    };
    if (BK) draw();
    MZ.rpc('my_bookings', {}).then(function (r) { BK = r || []; draw(); }, function () { BK = BK || []; draw(); });
  }
  function helpView(p) {
    if (HS === 'chat') { chatView(p); return; }
    var l = wa('Hello ' + cfg.name + ', I need help.');
    var IC = { chat: '<path d="M4 5h16v11H9l-5 4z"/>', wa: '<path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19z"/>', sms: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>' };
    var row = function (k, id, href, t, d) { var tag = href ? 'a' : 'button', at = href ? ' href="' + esc(href) + '"' + (/^https/.test(href) ? ' target="_blank" rel="noopener"' : '') : ' type="button"';
      return '<' + tag + ' class="mza-hr"' + at + (id ? ' id="' + id + '"' : '') + '><span class="ic"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg></span><span class="tx"><b>' + t + '</b><span>' + d + '</span></span><span class="ch">&rsaquo;</span></' + tag + '>'; };
    p.innerHTML = '<style>.mza-hr{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:1px solid #DCE4DE;border-radius:14px;padding:12px;margin-bottom:10px;color:#0E2A47;text-decoration:none;font:inherit;cursor:pointer;min-height:64px}.mza-hr .ic{flex:none;width:44px;height:44px;border-radius:12px;background:#E6F5EE;color:#157650;display:flex;align-items:center;justify-content:center}.mza-hr .tx{flex:1}.mza-hr b{display:block;font-size:16px}.mza-hr .tx span{display:block;font-size:13px;color:#4a5b73}.mza-hr .ch{font-size:26px;color:#8a97a8}</style>' +
      '<div class="mza-card"><b>How can we help you?</b><div class="m">Choose how you would like to contact the MOZLYT support team.</div></div>' +
      row('chat', 'mzaLC', '', 'Live chat<span id="mzaUn"></span>', 'Chat with support directly on MOZLYT.') +
      (l ? row('wa', '', l, 'WhatsApp support', 'Continue the conversation on WhatsApp.') : '') +
      row('sms', '', 'sms:+233538729743', 'Text message (SMS)', 'Send a normal text from your phone.') +
      row('mail', '', 'mailto:Info@mozlyt.com', 'Email', 'Info@mozlyt.com');
    $('#mzaLC').onclick = function () { HS = 'chat'; mainView(); };
    MZ.rpc('my_support_unread', {}).then(function (n) { if (n > 0 && $('#mzaUn')) $('#mzaUn').textContent = ' - ' + n + ' new'; }, function () { });
  }
  function chatView(p) {
    p.innerHTML = '<button class="mza-link" type="button" id="mzaCB">&larr; Back</button><div class="mza-chat" id="mzaCM"><div class="mza-empty">Loading...</div></div>' + (CREF ? '<div class="mza-sub" style="margin:6px 0">About: <b>' + esc(CREF) + '</b></div>' : '') + '<form id="mzaCF" style="display:flex;gap:8px"><input id="mzaCI" maxlength="1000" placeholder="Write your message" required style="flex:1"><button class="mza-btn" type="submit" style="width:auto;padding:10px 16px">Send</button></form><div id="mzaNote" style="margin-top:8px"></div><div class="mza-sub" style="margin-top:8px">We usually reply within a few hours. For something urgent, use WhatsApp.</div>';
    $('#mzaCB').onclick = function () { HS = 'menu'; CREF = ''; mainView(); };
    var load = function () { MZ.rpc('my_support_messages', {}).then(function (r) {
      var box = $('#mzaCM'); if (!box) return; var atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 40;
      box.innerHTML = (r || []).map(function (m) { return '<div class="mza-b ' + (m.from_admin ? 'a' : 'u') + '"><div>' + esc(m.body) + '</div><small>' + (m.ref ? esc(m.ref) + ' &middot; ' : '') + MZ.when(m.created_at) + '</small></div>'; }).join('') || '<div class="mza-empty">Say hello. A MOZLYT team member will reply here.</div>';
      if (atEnd || !box.dataset.s) { box.scrollTop = box.scrollHeight; box.dataset.s = '1'; } }, function () { }); };
    load(); clearInterval(chatT); chatT = setInterval(function () { if ($('#mzaCM') && !$('#mza').hidden) load(); else clearInterval(chatT); }, 8000);
    $('#mzaCF').onsubmit = function (e) { e.preventDefault(); var i = $('#mzaCI'), bt = $('button[type=submit]', this), v = i.value.trim(); if (!v) return; busy(bt, true, 'Sending...');
      MZ.rpc('send_support_message', { p_body: v, p_ref: CREF || null }).then(function () { i.value = ''; CREF = ''; note(''); load(); }, function (er) { note(er.message); }).then(function () { busy(bt, false); }); };
  }
  window.MZAccount = {
    open: function () { if (cfg) open(); },
    openAuth: function (m) { if (!cfg) return; AM = m === 'up' ? 'up' : 'in'; open(); },
    openChat: function () { if (!cfg) return; AT = 'help'; HS = 'chat'; CREF = ''; open(); },
    init: function (o) {
      cfg = { slug: o.slug, name: o.name || 'us', whatsapp: o.whatsapp || '' };
      var b = o.button && $(o.button); if (b) b.addEventListener('click', function (e) { e.preventDefault(); open(); });
      if (/access_token=|error_description=/.test(location.hash)) { var gt = function () { if (window.MZ && MZ.takeHash) { var r = MZ.takeHash(); open(); if (r && r.error) setTimeout(function () { var n = $('#mzaBody'); if (n) { var e = document.createElement('div'); e.className = 'mza-sub'; e.style.color = '#B3261E'; e.textContent = r.error; n.insertBefore(e, n.firstChild); } }, 600); } else setTimeout(gt, 100); }; gt(); }
      if (location.hash === '#chat') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } var gc = function () { if (window.MZ) window.MZAccount.openChat(); else setTimeout(gc, 100); }; gc(); }
      if (location.hash === '#account') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } var go = function () { if (window.MZ) open(); else setTimeout(go, 100); }; go(); }
    }
  };
})();
