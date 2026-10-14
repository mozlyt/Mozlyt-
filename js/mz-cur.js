/* Shows prices in the visitor's country currency (approximate). The amount charged stays in Ghana cedis (GH₵), shown in brackets. */
(function () {
  var CUR = {dz:'DZD',ao:'AOA',bj:'XOF',bw:'BWP',bf:'XOF',bi:'BIF',cv:'CVE',cm:'XAF',cf:'XAF',td:'XAF',km:'KMF',cg:'XAF',cd:'CDF',ci:'XOF',dj:'DJF',eg:'EGP',gq:'XAF',er:'ERN',sz:'SZL',et:'ETB',ga:'XAF',gm:'GMD',gn:'GNF',gw:'XOF',ke:'KES',ls:'LSL',lr:'LRD',ly:'LYD',mg:'MGA',mw:'MWK',ml:'XOF',mr:'MRU',mu:'MUR',ma:'MAD',mz:'MZN',na:'NAD',ne:'XOF',ng:'NGN',rw:'RWF',st:'STN',sn:'XOF',sc:'SCR',sl:'SLE',so:'SOS',za:'ZAR',ss:'SSP',sd:'SDG',tz:'TZS',tg:'XOF',tn:'TND',ug:'UGX',zm:'ZMW',zw:'ZWG'};
  var cc = null, code = null, rate = null, busy = false, RE = /GH₵\s?([\d][\d,]*(?:\.\d+)?)/g;
  try {
    var m = /^\/([a-z]{2})(\/|$)/.exec(location.pathname);
    cc = m && CUR[m[1]] ? m[1] : localStorage.getItem('mz-cc');
  } catch (e) { }
  if (!cc || !CUR[cc]) return;
  code = CUR[cc];
  function fmt(ghs) {
    var v = ghs * rate;
    var step = v >= 100000 ? 1000 : v >= 10000 ? 100 : v >= 1000 ? 10 : v >= 100 ? 1 : 0.5;
    v = Math.max(step, Math.round(v / step) * step);
    try { return '≈ ' + new Intl.NumberFormat('en-' + cc.toUpperCase(), { style: 'currency', currency: code, maximumFractionDigits: v < 100 ? 2 : 0 }).format(v); }
    catch (e) { try { return '≈ ' + new Intl.NumberFormat('en', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(v); } catch (e2) { } return '≈ ' + code + ' ' + Math.round(v); }
  }
  function walk(root) {
    if (!rate || busy) return; busy = true;
    try {
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
      while ((n = w.nextNode())) {
        var p = n.parentNode && n.parentNode.nodeName;
        if (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA' || p === 'OPTION') continue;
        if (n.nodeValue.indexOf('GH₵') > -1 && n.nodeValue.indexOf('≈') < 0) list.push(n);
      }
      list.forEach(function (t) {
        t.nodeValue = t.nodeValue.replace(RE, function (all, num) {
          var g = parseFloat(num.replace(/,/g, '')); if (isNaN(g)) return all;
          return fmt(g) + ' (' + all.replace(/\s/g, '') + ')';
        });
      });
    } finally { busy = false; }
  }
  function start() {
    walk(document.body);
    new MutationObserver(function () { walk(document.body); }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function ready(r) { rate = r; if (document.body) start(); else document.addEventListener('DOMContentLoaded', start); }
  var key = 'mz-rate-' + code, cached = null;
  try { cached = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { }
  if (cached && cached.r > 0) ready(cached.r);
  if (!cached || Date.now() - cached.t > 6 * 3600 * 1000) {
    fetch('https://open.er-api.com/v6/latest/GHS').then(function (r) { return r.json(); }).then(function (d) {
      var r = d && d.rates && d.rates[code];
      if (r > 0) { try { localStorage.setItem(key, JSON.stringify({ r: r, t: Date.now() })); } catch (e) { } if (!rate) ready(r); }
    }).catch(function () { });
  }
})();
