/* Product gallery: up to 6 photos plus an optional YouTube or Vimeo video.
   MZGallery.render(box, { photos: [url, ...], video: 'https://youtube.com/...', alt: 'name', src: function(url){return url} }) */
(function () {
  var CSS = '.mzg{width:100%}.mzg-s{position:relative;background:#eef3ef;display:grid;place-items:center;min-height:200px}.mzg-s img{width:100%;max-height:60vh;object-fit:contain;display:block}' +
    '.mzg-s iframe{width:100%;aspect-ratio:16/9;border:0;display:block;background:#000}.mzg-t{display:flex;gap:8px;overflow-x:auto;padding:8px 10px;background:#fff;-webkit-overflow-scrolling:touch}' +
    '.mzg-t button{flex:none;width:58px;height:58px;border:2px solid #d5ded7;border-radius:10px;padding:0;background:#eef3ef;overflow:hidden;cursor:pointer;position:relative}.mzg-t button.on{border-color:#1F9D6B}' +
    '.mzg-t img{width:100%;height:100%;object-fit:cover;display:block}.mzg-t .vd{display:grid;place-items:center;background:#10233f;color:#fff;font-size:20px}' +
    '.mzg-n{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:0;background:rgba(16,35,63,.6);color:#fff;font-size:22px;cursor:pointer;z-index:2}.mzg-n.p{left:8px}.mzg-n.x{right:8px}';
  function embed(u) {
    u = String(u || '');
    var m = u.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);
    if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0&autoplay=1';
    m = u.match(/vimeo\.com\/(?:video\/)?(\d{5,12})/);
    if (m) return 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1';
    return '';
  }
  function isFile(u) { return /^https:\/\/[^\s"'<>]+\.(mp4|webm|mov|m4v)(\?[^\s"'<>]*)?$/i.test(String(u || '')) }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
  function render(box, o) {
    if (!document.getElementById('mzg-css')) { var st = document.createElement('style'); st.id = 'mzg-css'; st.textContent = CSS; document.head.appendChild(st) }
    var src = o.src || function (u) { return u };
    var ph = (o.photos || []).filter(Boolean).slice(0, 6), vid = embed(o.video), vf = !vid && isFile(o.video) ? String(o.video) : '', items = ph.map(function (u) { return { t: 'i', u: u } });
    if (vid) items.push({ t: 'v', u: vid }); else if (vf) items.push({ t: 'f', u: vf });
    box.innerHTML = '';
    if (!items.length) { box.innerHTML = '<span style="color:#5b6b62;padding:40px;display:block;text-align:center">Photo coming soon</span>'; return }
    var w = document.createElement('div'); w.className = 'mzg';
    var stage = document.createElement('div'); stage.className = 'mzg-s'; w.appendChild(stage);
    var strip = document.createElement('div'), cur = 0;
    function show(i) {
      cur = (i + items.length) % items.length; var it = items[cur];
      stage.querySelectorAll('.mzg-n').forEach(function (b) { b.remove() });
      stage.innerHTML = it.t === 'f' ? '<video controls autoplay playsinline preload="metadata" style="width:100%;max-height:60vh;background:#000;display:block" src="' + esc(it.u) + '"></video>' : it.t === 'v' ? '<iframe src="' + esc(it.u) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Product video"></iframe>' :
        '<img alt="' + esc(o.alt || '') + '" src="' + esc(src(it.u)) + '" data-o="' + esc(it.u) + '" onerror="if(this.dataset.o&&this.src.indexOf(this.dataset.o)<0){this.src=this.dataset.o}">';
      if (items.length > 1) {
        var p = document.createElement('button'), n = document.createElement('button');
        p.type = n.type = 'button'; p.className = 'mzg-n p'; n.className = 'mzg-n x'; p.textContent = '‹'; n.textContent = '›'; p.setAttribute('aria-label', 'Previous'); n.setAttribute('aria-label', 'Next');
        p.onclick = function () { show(cur - 1) }; n.onclick = function () { show(cur + 1) }; stage.appendChild(p); stage.appendChild(n);
      }
      strip.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('on', j === cur) });
    }
    if (items.length > 1) {
      strip.className = 'mzg-t';
      items.forEach(function (it, i) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', it.t !== 'i' ? 'Play video' : 'Photo ' + (i + 1));
        b.innerHTML = it.t !== 'i' ? '<span class="vd">▶</span>' : '<img alt="" loading="lazy" src="' + esc(src(it.u)) + '" data-o="' + esc(it.u) + '" onerror="if(this.dataset.o&&this.src.indexOf(this.dataset.o)<0){this.src=this.dataset.o}">';
        b.onclick = function () { show(i) }; strip.appendChild(b);
      });
      w.appendChild(strip);
    }
    box.appendChild(w); show(0);
  }
  window.MZGallery = { render: render, embed: embed };
})();
