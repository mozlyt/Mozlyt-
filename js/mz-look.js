/* Shop theme picker for sellers and franchises: MZLook.mount('#host', {franchise:false})
   A theme changes the page colours and how the products are arranged. */
(function () {
  var TH = {
    classic: { n: 'Classic', d: 'Light page, three products across', bar: '#0E2A47', bg: '#f6f8f5', cd: '#fff', ln: '#dce4de', ac: '#1F9D6B', cols: 3 },
    big: { n: 'Big photos', d: 'Two larger products across', bar: '#0E2A47', bg: '#f6f8f5', cd: '#fff', ln: '#dce4de', ac: '#1F9D6B', cols: 2 },
    list: { n: 'List', d: 'One product per row, photo on the left', bar: '#0E2A47', bg: '#f6f8f5', cd: '#fff', ln: '#dce4de', ac: '#1F9D6B', cols: 1 },
    rugged: { n: 'Rugged', d: 'Charcoal and orange, strong and bold', bar: '#111214', bg: '#1a1b1d', cd: '#232427', ln: '#3a3b3f', ac: '#ea580c', cols: 2 },
    white: { n: 'Clean white', d: 'White behind the bar and footer, products as they are', bar: '#fff', bg: '#f6f8f5', cd: '#fff', ln: '#dce4de', ac: '#1F9D6B', cols: 3 },
    lux: { n: 'Premium black', d: 'Black and gold, for a high-end look', bar: '#000', bg: '#0b0b0c', cd: '#151517', ln: '#2c2c30', ac: '#d4a84b', cols: 2 },
    snow: { n: 'Premium white', d: 'Clean white with black, sharp and minimal', bar: '#fff', bg: '#fff', cd: '#fff', ln: '#e3e3e3', ac: '#111', cols: 2 }
  };
  var CSS = '.lk-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:12px 0}' +
    '.lk-t{border:2px solid rgba(128,128,128,.35);border-radius:14px;padding:8px;background:transparent;color:inherit;cursor:pointer;text-align:left;font:inherit}' +
    '.lk-t.on{border-color:#1F9D6B;box-shadow:0 0 0 2px rgba(31,157,107,.25)}.lk-t b{display:block;margin:8px 2px 0;font-size:14.5px}.lk-t span.d{display:block;margin:2px 2px 2px;font-size:12.5px;opacity:.7;line-height:1.35}' +
    '.lk-p{border-radius:8px;overflow:hidden;border:1px solid rgba(128,128,128,.3)}.lk-p i{display:block;height:14px}.lk-p div{padding:6px;display:grid;gap:4px}.lk-p div u{display:block;height:26px;border-radius:3px;border:1px solid}';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
  function prev(t) {
    var cells = '', n = t.cols === 1 ? 3 : t.cols === 2 ? 4 : 6;
    for (var i = 0; i < n; i++) cells += '<u style="background:' + t.cd + ';border-color:' + t.ln + (t.cols === 1 ? ';height:14px;border-left:14px solid ' + t.ac : '') + '"></u>';
    return '<div class="lk-p"><i style="background:' + t.bar + ';border-bottom:3px solid ' + t.ac + '"></i><div style="background:' + t.bg + ';grid-template-columns:repeat(' + t.cols + ',1fr)">' + cells + '</div></div>';
  }
  function mount(sel, opt) {
    var host = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!host) return;
    opt = opt || {};
    var ids = opt.franchise ? ['white', 'lux', 'snow', 'rugged', 'big', 'classic'] : ['classic', 'big', 'list', 'rugged'];
    if (!document.getElementById('lk-css')) { var st = document.createElement('style'); st.id = 'lk-css'; st.textContent = CSS; document.head.appendChild(st) }
    var cur = null, msg = '';
    function draw() {
      host.innerHTML = '<h3 style="margin:0 0 4px">Shop theme</h3><p class="sub" style="margin:0">A theme changes the background and how your products are arranged. ' + (opt.franchise ? 'Franchise shops also have premium black and white looks.' : '') + ' Choosing one sets its colours. You can still change the colours afterwards.</p><div class="lk-g">' +
        ids.map(function (id) { var t = TH[id]; return '<button type="button" class="lk-t' + (cur === id ? ' on' : '') + '" data-lk="' + id + '" aria-pressed="' + (cur === id) + '">' + prev(t) + '<b>' + esc(t.n) + '</b><span class="d">' + esc(t.d) + '</span></button>' }).join('') +
        '</div><div class="sub" id="lkMsg" style="font-size:13.5px">' + esc(msg) + '</div>';
    }
    function load(n) {
      if (!(window.MZ && MZ.user && MZ.user())) { if (n < 12) setTimeout(function () { load(n + 1) }, 700); else { cur = opt.franchise ? 'white' : 'classic'; draw() } return }
      MZ.q('profiles', 'select=shop_theme,store_slug&id=eq.' + MZ.user().id).then(function (r) {
        var t = r && r[0] && r[0].shop_theme, lk = t && t.look;
        cur = ids.indexOf(lk) > -1 ? lk : (opt.franchise ? 'white' : 'classic'); host._slug = r && r[0] && r[0].store_slug; draw();
      }, function () { cur = opt.franchise ? 'white' : 'classic'; draw() });
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-lk]'); if (!b) return;
      var id = b.dataset.lk, prevCur = cur; cur = id; msg = 'Saving...'; draw();
      MZ.rpc('set_my_shop_theme', { p_theme: { look: id === 'classic' ? '' : id } }).then(function () {
        msg = 'Saved. Open your shop to see it.'; draw(); if (window.__scReload) window.__scReload(); if (opt.onChange) opt.onChange(id);
      }, function (er) { cur = prevCur; msg = er.message || 'Could not save.'; draw() });
    });
    draw(); load(0);
  }
  window.MZLook = { mount: mount };
})();
