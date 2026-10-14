/* Keeps a visitor inside their country version of MOZLYT: adds the country badge to the logo and points the menu to the country pages. */
(function () {
  try {
    var cc = localStorage.getItem('mz-cc');
    if (!cc || !/^[a-z]{2}$/.test(cc)) return;
    var pages = ['shop', 'what-we-do', 'about', 'career', 'blog', 'massage-in-accra', 'delivery-returns', 'privacy', 'terms'];
    var logo = document.querySelector('.mz-logo');
    if (logo && !logo.querySelector('.mz-cc')) {
      var b = document.createElement('span');
      b.className = 'mz-cc'; b.textContent = cc.toUpperCase();
      b.style.cssText = 'display:inline-block;margin-left:6px;padding:1px 7px;border-radius:99px;background:#F2B134;color:#0E2A47;font:700 12px system-ui,sans-serif;vertical-align:middle';
      logo.appendChild(b);
    }
    var links = document.querySelectorAll('.mz-header a[href], .mz-footer a[href], footer a[href]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href') || '';
      var m = /^([a-z-]+)\.html(#.*)?$/.exec(h);
      if (!m) continue;
      if (m[1] === 'index') links[i].setAttribute('href', '/' + cc + '/' + (m[2] || ''));
      else if (pages.indexOf(m[1]) > -1) links[i].setAttribute('href', '/' + cc + '/' + m[1] + '.html' + (m[2] || ''));
    }
  } catch (e) { }
})();
