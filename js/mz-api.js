/* MOZLYT backend connector (Supabase). Public keys only: the anon key is safe to ship in a web page.
   What each person may see or change is enforced by database security rules, not by this file. */
(function () {
  var URL_ = 'https://ziaoopnwhmmrtnmeotia.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYW9vcG53aG1tcnRubWVvdGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTA0MDAsImV4cCI6MjEwNzQ4NjQwMH0.YVeqd4OzvIRnQQN3zPrbh4K_46RWKXQTULz41uAR0Ms';
  var SKEY = 'mz-session';
  var SITE = 'https://mozlyt.com/';

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var mem = null; // fallback if storage is blocked
  function getSession() { var s = store(SKEY); return s || mem; }
  function setSession(s) { mem = s; store(SKEY, s); }

  function errText(j, status) {
    if (!j) return 'Something went wrong (' + status + '). Please try again.';
    var m = j.msg || j.message || j.error_description || j.error || '';
    if (/invalid login/i.test(m)) return 'Wrong email or password.';
    if (/already registered|already been registered/i.test(m)) return 'That email already has an account. Try logging in.';
    if (/email not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox (and spam) for our message.';
    if (/rate limit|too many/i.test(m)) return 'Too many tries. Please wait a few minutes and try again.';
    if (/password/i.test(m) && /6|short|weak/i.test(m)) return 'Choose a longer password (at least 8 characters).';
    return m || ('Something went wrong (' + status + ').');
  }

  function call(path, opts, token) {
    opts = opts || {};
    var h = { apikey: KEY, 'Content-Type': 'application/json' };
    h.Authorization = 'Bearer ' + (token || KEY);
    if (opts.prefer) h.Prefer = opts.prefer;
    return fetch(URL_ + path, { method: opts.method || 'GET', headers: h, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) })
      .then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { }
          if (!r.ok) { var err = new Error(errText(j, r.status)); err.status = r.status; err.body = j; throw err; }
          return j;
        });
      }, function () { throw new Error('No internet connection. Please check your network and try again.'); });
  }

  var refreshing = null;
  function freshToken() {
    var s = getSession();
    if (!s) return Promise.resolve(null);
    if (s.expires_at && s.expires_at - 60 > Date.now() / 1000) return Promise.resolve(s.access_token);
    if (refreshing) return refreshing;
    refreshing = call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: s.refresh_token } })
      .then(function (j) { saveTokens(j); return j.access_token; })
      .catch(function () { setSession(null); return null; })
      .then(function (t) { refreshing = null; return t; });
    return refreshing;
  }
  function saveTokens(j) {
    var exp = j.expires_at || (Math.floor(Date.now() / 1000) + (j.expires_in || 3600));
    setSession({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: exp, user: j.user || (getSession() || {}).user || null });
  }
  function decode(tok) { try { return JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return null; } }

  var MZ = {
    siteUrl: SITE,
    /* ---------- accounts ---------- */
    user: function () { var s = getSession(); return s && s.user ? s.user : null; },
    loggedIn: function () { return !!getSession(); },
    signUp: function (email, password, data) {
      return call('/auth/v1/signup?redirect_to=' + encodeURIComponent(SITE + 'seller.html'), { method: 'POST', body: { email: email, password: password, data: data || {} } })
        .then(function (j) { if (j && j.access_token) { saveTokens(j); return { confirmed: true }; } return { confirmed: false }; });
    },
    signIn: function (email, password) {
      return call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: email, password: password } })
        .then(function (j) { saveTokens(j); return j.user; });
    },
    signOut: function () {
      var s = getSession(); setSession(null);
      if (s) call('/auth/v1/logout', { method: 'POST' }, s.access_token).catch(function () { });
      return Promise.resolve();
    },
    recover: function (email) {
      return call('/auth/v1/recover?redirect_to=' + encodeURIComponent(SITE + 'seller.html'), { method: 'POST', body: { email: email } });
    },
    updatePassword: function (password) {
      return freshToken().then(function (t) { if (!t) throw new Error('Your link has expired. Request a new one.'); return call('/auth/v1/user', { method: 'PUT', body: { password: password } }, t); });
    },
    /* the confirmation / reset links bring tokens back in the address; pick them up */
    takeHash: function () {
      var h = location.hash || ''; if (h.charAt(1) === '' || h.indexOf('access_token') < 0) { if (/error_description=/.test(h)) { var m = /error_description=([^&]+)/.exec(h); history.replaceState(null, '', location.pathname + location.search); return { error: decodeURIComponent(m[1].replace(/\+/g, ' ')) }; } return null; }
      var p = new URLSearchParams(h.slice(1));
      var tok = p.get('access_token'); if (!tok) return null;
      var c = decode(tok) || {};
      setSession({ access_token: tok, refresh_token: p.get('refresh_token'), expires_at: c.exp || (Math.floor(Date.now() / 1000) + 3600), user: { id: c.sub, email: c.email } });
      history.replaceState(null, '', location.pathname + location.search);
      return { type: p.get('type') || 'signin' };
    },
    /* ---------- data ---------- */
    q: function (table, query, opts) { // query: 'select=*&order=created_at.desc'
      opts = opts || {};
      return freshToken().then(function (t) { return call('/rest/v1/' + table + (query ? '?' + query : ''), { method: opts.method || 'GET', body: opts.body, prefer: opts.prefer }, t); });
    },
    insert: function (table, row, returning) { return MZ.q(table, '', { method: 'POST', body: row, prefer: returning ? 'return=representation' : 'return=minimal' }); },
    update: function (table, match, patch) { return MZ.q(table, match, { method: 'PATCH', body: patch, prefer: 'return=representation' }); },
    upsert: function (table, rows, conflict) { return MZ.q(table, 'on_conflict=' + conflict, { method: 'POST', body: rows, prefer: 'resolution=merge-duplicates,return=minimal' }); },
    remove: function (table, match) { return MZ.q(table, match, { method: 'DELETE', prefer: 'return=minimal' }); },
    upload: function (bucket, path, file) {
      return freshToken().then(function (t) {
        if (!t) throw new Error('Please log in again.');
        return fetch(URL_ + '/storage/v1/object/' + bucket + '/' + path, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + t, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' }, body: file })
          .then(function (r) { if (!r.ok) return r.text().then(function (x) { var m = ''; try { m = JSON.parse(x).message } catch (e) { } throw new Error(m || 'Upload failed. Use a photo or PDF under 8 MB.'); }); return path; }, function () { throw new Error('No internet connection. Please check your network and try again.'); });
      });
    },
    publicUrl: function (bucket, path) { return URL_ + '/storage/v1/object/public/' + bucket + '/' + path; },
    signUrl: function (bucket, path) {
      return freshToken().then(function (t) {
        return fetch(URL_ + '/storage/v1/object/sign/' + bucket + '/' + path, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 300 }) })
          .then(function (r) { return r.json() }).then(function (j) { if (!j.signedURL) throw new Error('Could not open the file'); return URL_ + '/storage/v1' + j.signedURL; });
      });
    },
    fn: function (name, body) {
      return freshToken().then(function (t) {
        return fetch(URL_ + '/functions/v1/' + name, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + (t || KEY), 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
          .then(function (r) { return r.json().catch(function () { return {}; }); });
      });
    },
    rpc: function (name, args) { return freshToken().then(function (t) { return call('/rest/v1/rpc/' + name, { method: 'POST', body: args || {} }, t); }); },
    /* ---------- helpers ---------- */
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    money: function (n) { return n == null || n === '' ? 'Price on request' : 'GH₵' + Number(n).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); },
    phoneIntl: function (p) { p = String(p || '').replace(/[^\d]/g, ''); if (p.indexOf('233') === 0) return p; if (p.charAt(0) === '0') return '233' + p.slice(1); return p; },
    when: function (iso) { try { return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  };
  window.MZ = MZ;

  /* ---------- ad tracking (Meta and TikTok pixels) ---------- */
  var PX = { meta: false, tt: false };
  var TT_EVENT = { ViewContent: 'ViewContent', AddToCart: 'AddToCart', Purchase: 'PlaceAnOrder', Lead: 'SubmitForm' };
  MZ.pixels = function (meta, tiktok) {
    try {
      if (meta && /^[0-9]{8,20}$/.test(meta) && !PX.meta) {
        PX.meta = true;
        (function (f, b, e, v) { if (f.fbq) return; var n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []; var t = b.createElement(e); t.async = true; t.src = v; var s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', meta); window.fbq('track', 'PageView');
      }
      if (tiktok && /^[A-Za-z0-9]{8,32}$/.test(tiktok) && !PX.tt) {
        PX.tt = true;
        (function (w, d, t) { w.TiktokAnalyticsObject = t; var q = w[t] = w[t] || []; q.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']; q.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }; for (var i = 0; i < q.methods.length; i++) q.setAndDefer(q, q.methods[i]); q.instance = function (t) { for (var e = q._i[t] || [], n = 0; n < q.methods.length; n++) q.setAndDefer(e, q.methods[n]); return e; }; q.load = function (e, n) { var i = 'https://analytics.tiktok.com/i18n/pixel/events.js'; q._i = q._i || {}; q._i[e] = []; q._i[e]._u = i; q._t = q._t || {}; q._t[e] = +new Date(); q._o = q._o || {}; q._o[e] = n || {}; var o = d.createElement('script'); o.type = 'text/javascript'; o.async = true; o.src = i + '?sdkid=' + e + '&lib=' + t; var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a); }; q.load(tiktok); q.page(); })(window, document, 'ttq');
      }
    } catch (e) { }
  };
  MZ.track = function (name, d) {
    d = d || {};
    try {
      if (PX.meta && window.fbq) window.fbq('track', name, d.value != null ? { value: d.value, currency: 'GHS', content_name: d.name } : {});
      if (PX.tt && window.ttq) window.ttq.track(TT_EVENT[name] || name, d.value != null ? { value: d.value, currency: 'GHS', content_name: d.name } : {});
    } catch (e) { }
  };
  /* MOZLYT's own pixels, set by the admin, load on the main site pages */
  MZ.sitePixels = function () {
    return MZ.q('site_settings', 'select=key,value').then(function (rows) {
      var m = {}; (rows || []).forEach(function (r) { m[r.key] = r.value; });
      MZ.pixels(m.meta_pixel, m.tiktok_pixel);
    }).catch(function () { });
  };
  if (!/\/(seller|admin|store)\.html$/.test(location.pathname)) {
    var go = function () { MZ.sitePixels(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
})();
