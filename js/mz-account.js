/* MOZLYT customer account panel for a shop page.
   Adds a slide-in panel (sign in, create account, my orders with tracking, my details, help on WhatsApp)
   to a page that already has its own look. It never changes the page itself or how people buy.
   Use: MZAccount.init({slug:'mozlyt-gh', name:'MOZLYT', whatsapp:'233538729743', button:'#mzAcct'}) */
(function () {
  var cfg = null, ACC = null, AT = 'orders', AM = 'in', built = false;
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
      '.mza-sub{margin:0 0 12px;color:#4b5a6a;font-size:14.5px;line-height:1.5}' +
      '.mza label{display:grid;gap:5px;font-weight:600;font-size:14px;margin:0 0 12px}.mza input{padding:12px;border:1.5px solid #cfd8d2;border-radius:10px;font-size:16px;width:100%;box-sizing:border-box;color:#0E2A47;background:#fff}.mza input:disabled{background:#f1f4f2;color:#5b6b62}' +
      '.mza input:focus{outline:none;border-color:#1F9D6B;box-shadow:0 0 0 3px rgba(31,157,107,.15)}' +
      '.mza-btn{display:flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;padding:13px 16px;border:0;border-radius:10px;background:#1F9D6B;color:#fff;font-weight:700;font-size:16px;cursor:pointer;text-decoration:none}.mza-btn:hover{background:#157650}.mza-btn:disabled{opacity:.6}' +
      '.mza-btn.wa{background:#E8F5EE;color:#14663f;border:1.5px solid #9fd3b6}.mza-btn.sm{width:auto;padding:9px 14px;font-size:14px}.mza-btn.ghost{background:#fff;color:#0E2A47;border:1.5px solid #cfd8d2}' +
      '.mza-link{background:none;border:0;color:#14663f;font-weight:600;font-size:14px;text-decoration:underline;cursor:pointer;padding:6px 0}' +
      '.mza-tabs{display:flex;gap:6px;margin:0 0 12px}.mza-tabs button{flex:1;padding:9px 6px;border:1.5px solid #DCE4DE;background:#fff;color:#0E2A47;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer}.mza-tabs button.on{background:#0E2A47;color:#fff;border-color:#0E2A47}' +
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
    build(); var h = $('#mzaHelp'), l = wa('Hello ' + cfg.name + ', I need help.'); h.hidden = !l; if (l) h.href = l;
    $('#mza').hidden = false;
    if (MZ.loggedIn()) { $('#mzaBody').innerHTML = '<div class="mza-empty">Loading...</div>'; fetchAcc().then(show); } else show();
  }
  function fetchAcc() {
    if (!MZ.loggedIn()) { ACC = null; return Promise.resolve(null); }
    return MZ.rpc('get_my_account', { p_slug: cfg.slug }).then(function (a) { ACC = a; return a; }, function () { ACC = null; return null; });
  }
  function show() { if (!MZ.loggedIn() || !ACC) authView(); else if (!ACC.joined) joinView(); else mainView(); }

  function authView() {
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
    b.innerHTML = '<div class="mza-tabs"><button type="button" data-a="orders">My orders</button><button type="button" data-a="me">My details</button><button type="button" data-a="help">Help</button></div><div id="mzaPane"></div>';
    $$('.mza-tabs button', b).forEach(function (x) { x.classList.toggle('on', x.dataset.a === AT); x.onclick = function () { AT = x.dataset.a; mainView(); }; });
    var p = $('#mzaPane');
    if (AT === 'orders') {
      p.innerHTML = (a.orders || []).map(function (o) {
        return '<div class="mza-card"><div class="h"><b>Order #' + o.id + '</b><span class="mza-tag' + (o.status === 'cancelled' ? ' bad' : o.status === 'new' ? ' warn' : '') + '">' + esc(ST[o.status] || o.status || 'Received') + '</span></div>' +
          '<div class="m">' + MZ.when(o.created_at) + (o.paid ? ' &middot; Paid online' : '') + '</div>' + tracker(o.status) +
          '<div>' + (o.items || []).map(function (i) { return esc((i.qty || 1) + ' x ' + i.name); }).join(', ') + '</div>' + (o.total != null ? '<div><b>' + MZ.money(o.total) + '</b></div>' : '') +
          '<div><a class="mza-btn sm ghost" style="display:inline-flex" target="_blank" rel="noopener" href="' + esc(wa('Hello ' + cfg.name + ', I have a question about my order #' + o.id + '.')) + '">Ask about this order</a></div></div>';
      }).join('') || '<div class="mza-empty">No orders here yet. Orders you place with us will show up here so you can follow them.</div>';
    } else if (AT === 'me') {
      var ad = (a.addresses || []).slice(0, 5); if (!ad.length) ad = [''];
      p.innerHTML = '<form id="mzaF"><label>Name<input id="mzaN" required maxlength="80" value="' + esc(a.name) + '"></label><label>Phone / WhatsApp<input id="mzaP" type="tel" required maxlength="20" value="' + esc(a.phone) + '"></label><label>Email<input value="' + esc(a.email || '') + '" disabled></label><div id="mzaAd"></div><label style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4"><input type="checkbox" id="mzaMk" style="width:auto;margin-top:3px"'+(a.marketing_ok?' checked':'')+'><span>Send me offers and updates from this shop</span></label><button class="mza-link" type="button" id="mzaAdd">+ Add another address</button><button class="mza-btn" type="submit">Save my details</button></form><div id="mzaNote" style="margin-top:10px"></div><button class="mza-link" type="button" id="mzaOut">Sign out</button>';
      var draw = function () { $('#mzaAd').innerHTML = ad.map(function (x, i) { return '<label>Delivery address ' + (i + 1) + '<input class="mzaad" maxlength="200" placeholder="e.g. East Legon, near the mall" value="' + esc(x) + '"></label>'; }).join(''); $('#mzaAdd').hidden = ad.length >= 5; $$('.mzaad').forEach(function (inp, i) { inp.oninput = function () { ad[i] = inp.value; }; }); }; draw();
      $('#mzaMk').onchange = function () { var v = this.checked; MZ.rpc('set_my_marketing', { p_slug: cfg.slug, p_ok: v }).then(function () { if (ACC) ACC.marketing_ok = v; toast(v ? 'You will get offers from this shop' : 'You will not get offers any more'); }, function (er) { toast(er.message); }); }; $('#mzaAdd').onclick = function () { ad.push(''); draw(); var l = $$('.mzaad'); l[l.length - 1].focus(); }; $('#mzaOut').onclick = out;
      $('#mzaF').onsubmit = function (e) { e.preventDefault(); var bt = $('button[type=submit]', this); busy(bt, true, 'Saving...');
        MZ.rpc('save_my_account', { p_slug: cfg.slug, p_name: $('#mzaN').value.trim(), p_phone: $('#mzaP').value.trim(), p_addresses: ad.filter(function (x) { return String(x).trim(); }) }).then(fetchAcc).then(function () { toast('Saved'); mainView(); }).catch(function (er) { note(er.message); }).then(function () { busy(bt, false); }); };
    } else {
      var l = wa('Hello ' + cfg.name + ', I need help.');
      p.innerHTML = '<div class="mza-card"><b>Talk to ' + esc(cfg.name) + '</b><div class="m">Questions about an order, delivery or a product? Message us directly on WhatsApp.</div>' + (l ? '<a class="mza-btn" target="_blank" rel="noopener" href="' + esc(l) + '">Chat on WhatsApp</a>' : '') + '</div>';
    }
  }
  window.MZAccount = {
    open: function () { if (cfg) open(); },
    init: function (o) {
      cfg = { slug: o.slug, name: o.name || 'us', whatsapp: o.whatsapp || '' };
      var b = o.button && $(o.button); if (b) b.addEventListener('click', function (e) { e.preventDefault(); open(); });
      if (location.hash === '#account') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } var go = function () { if (window.MZ) open(); else setTimeout(go, 100); }; go(); }
    }
  };
})();
