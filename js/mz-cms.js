/* Wording managed in MOZLYT HQ > Public setup > Website editing.
   The text written in each page is the fallback; what HQ has published replaces it.
   Add ?preview=1 to any page to see the unpublished draft (signed-in HQ admins only). */
(function () {
  if (!window.fetch) return;
  var URL_ = 'https://ziaoopnwhmmrtnmeotia.supabase.co', KEY = null;
  var preview = /[?&]preview=1(&|$)/.test(location.search), CK = 'mz-site-v1';
  function apply(c) {
    if (!c || typeof c !== 'object') return;
    document.querySelectorAll('[data-mz]').forEach(function (el) {
      var v = c[el.getAttribute('data-mz')];
      if (typeof v === 'string' && v.trim() && el.textContent !== v) el.textContent = v;
    });
  }
  if (!preview) { try { apply(JSON.parse(localStorage.getItem(CK) || 'null')); } catch (e) {} }
  function go(key) {
    var token = key, fn = 'public_site_content';
    if (preview) {
      try { var s = JSON.parse(localStorage.getItem('mz-session') || 'null'); token = s && s.access_token; } catch (e) { token = null; }
      var bar = document.createElement('div');
      bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99;background:#F2B134;color:#0E2A47;font:600 14px/1.4 system-ui,sans-serif;padding:12px 16px;text-align:center';
      bar.textContent = token ? 'Preview of your unpublished draft. Visitors do not see this until you publish in HQ.' : 'Sign in to MOZLYT HQ in this browser to preview your draft.';
      document.body.appendChild(bar); if (!token) return; fn = 'site_content_draft';
    }
    fetch(URL_ + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: key, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (c) { if (!c) return; apply(c); if (!preview) try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} })
      .catch(function () {});
  }
  function boot() { var k = window.MZ && MZ.key; if (k) return go(k); setTimeout(function () { var k2 = window.MZ && MZ.key; if (k2) go(k2); }, 400); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
