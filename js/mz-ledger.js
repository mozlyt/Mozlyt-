/* MOZLYT payment records: a clear statement of every payment in and every payment out.
   MZLedger.mount('#pane', { rpc: 'admin_ledger', title: 'Payment records', note: '...' }) */
(function () {
  var CSS = '.lg{--in:#15803d;--out:#b91c1c;--bd:rgba(128,128,128,.28);--soft:rgba(128,128,128,.09)}' +
    '.lg-top{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:12px}.lg-top h3{margin:0;font-size:22px}' +
    '.lg-tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.lg-tools select,.lg-tools input{padding:10px 12px;border:1px solid var(--bd);border-radius:10px;background:transparent;color:inherit;font-size:14px;max-width:100%}' +
    '.lg-b{padding:10px 14px;border-radius:10px;border:1px solid var(--bd);background:transparent;color:inherit;font-weight:600;font-size:14px;cursor:pointer}.lg-b:hover{background:var(--soft)}' +
    '.lg-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px}' +
    '.lg-c{border:1px solid var(--bd);border-radius:16px;padding:16px 18px;background:var(--soft);position:relative;overflow:hidden}.lg-c:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--k,#888)}' +
    '.lg-c span{display:block;font-size:13px;opacity:.75}.lg-c b{display:block;font-size:26px;margin:4px 0 2px;font-family:Georgia,serif}.lg-c small{opacity:.7}' +
    '.lg h4{margin:20px 0 8px;font-size:16px}' +
    '.lg-t{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--bd);border-radius:14px;overflow:hidden;font-size:14px}' +
    '.lg-t th{background:var(--soft);font-size:12px;text-transform:uppercase;letter-spacing:.04em;text-align:left;padding:11px 12px;opacity:.85;white-space:nowrap}' +
    '.lg-t td{padding:11px 12px;border-top:1px solid var(--bd);vertical-align:top}.lg-t tbody tr:nth-child(even){background:var(--soft)}' +
    '.lg-t .n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.lg-t th.n{text-align:right}' +
    '.lg-in{color:var(--in);font-weight:700}.lg-out{color:var(--out);font-weight:700}' +
    '.lg-t tfoot td{font-weight:800;background:var(--soft);border-top:2px solid var(--bd)}' +
    '.lg-d{display:block;font-weight:600}.lg-m{display:block;font-size:12.5px;opacity:.7;margin-top:2px;word-break:break-all}' +
    '.lg-s{display:inline-block;padding:3px 9px;border-radius:99px;font-size:12px;font-weight:700}.lg-s.ok{background:rgba(21,128,61,.15);color:var(--in)}.lg-s.wait{background:rgba(217,119,6,.16);color:#b45309}.lg-s.no{background:rgba(185,28,28,.14);color:var(--out)}' +
    '.lg-t tr.dim td{opacity:.55}.lg-empty{padding:28px;text-align:center;opacity:.7;border:1px dashed var(--bd);border-radius:14px}' +
    '.lg-note{font-size:13.5px;opacity:.75;margin:0 0 12px}' +
    '@media(max-width:760px){.lg-t.st thead{display:none}.lg-t.st,.lg-t.st tbody,.lg-t.st tr,.lg-t.st td{display:block;width:100%}.lg-t.st tr{padding:10px 12px;border-top:1px solid var(--bd)}.lg-t.st td{border:0;padding:3px 0;text-align:left!important;display:flex;justify-content:space-between;gap:10px}.lg-t.st td:before{content:attr(data-l);opacity:.65;font-size:12px;text-transform:uppercase;letter-spacing:.03em;flex:none}.lg-t.st td.dt,.lg-t.st td.dd{display:block}.lg-t.st td.dt:before,.lg-t.st td.dd:before{content:none}.lg-t.st td:empty{display:none}.lg-t.st,.lg-t.st tr,.lg-t.st tbody{box-sizing:border-box}.lg-t.st td{box-sizing:border-box;min-width:0}.lg-t.st td.dt{font-weight:700;opacity:.8;font-size:13px}.lg-wrap{overflow-x:auto;border-radius:14px}.lg-wrap .lg-t{min-width:480px}}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
  function num(n) { return Number(n || 0) }
  function fmt(n) { try { return MZ.money(n) } catch (e) { return Number(n).toFixed(2) } }
  function dt(t) { try { return new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch (e) { return String(t) } }
  function counted(r) { return r.status === 'paid' || r.status === 'confirmed' }
  function stat(r) {
    if (counted(r)) return ['ok', r.dir === 'in' ? 'Received' : 'Paid out'];
    if (r.status === 'rejected' || r.status === 'failed' || r.status === 'cancelled') return ['no', 'Not completed'];
    return ['wait', 'Waiting'];
  }
  function monthKey(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) }
  function monthName(k) { var p = k.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' }) }

  function mount(sel, opt) {
    var host = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!host) return;
    if (!document.getElementById('lg-css')) { var st = document.createElement('style'); st.id = 'lg-css'; st.textContent = CSS; document.head.appendChild(st) }
    var S = { rows: null, per: 'all', dir: '', cat: '', q: '' };
    host.classList.add('lg');
    host.innerHTML = '<div class="lg-empty">Loading payment records...</div>';

    function inPeriod(r) {
      if (S.per === 'all') return true;
      var d = new Date(r.at), now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (S.per === 'today') return d >= t0;
      if (S.per === '7') return d >= new Date(t0.getTime() - 6 * 864e5);
      if (S.per === '30') return d >= new Date(t0.getTime() - 29 * 864e5);
      return monthKey(r.at) === S.per;
    }
    function view() {
      var all = S.rows || [], months = {};
      all.forEach(function (r) { months[monthKey(r.at)] = 1 });
      var mk = Object.keys(months).sort().reverse(), cats = {};
      all.forEach(function (r) { cats[r.cat] = 1 });
      var rows = all.filter(function (r) {
        if (!inPeriod(r)) return false;
        if (S.dir && r.dir !== S.dir) return false;
        if (S.cat && r.cat !== S.cat) return false;
        if (S.q) { var h = (r.party + ' ' + r.descr + ' ' + r.ref + ' ' + r.cat).toLowerCase(); if (h.indexOf(S.q.toLowerCase()) < 0) return false }
        return true;
      });
      // running balance, oldest first, only completed payments move it
      var asc = rows.slice().sort(function (a, b) { return new Date(a.at) - new Date(b.at) }), bal = 0;
      asc.forEach(function (r) { if (counted(r)) bal += (r.dir === 'in' ? 1 : -1) * num(r.amount); r._bal = bal });
      var tin = 0, tout = 0, wait = 0, n = 0, by = {};
      rows.forEach(function (r) {
        if (counted(r)) {
          n++; var a = num(r.amount);
          if (r.dir === 'in') tin += a; else tout += a;
          var b = by[r.cat] || (by[r.cat] = { i: 0, o: 0, n: 0 }); b.n++; if (r.dir === 'in') b.i += a; else b.o += a;
        } else if (stat(r)[0] === 'wait') wait += num(r.amount) * (r.dir === 'in' ? 1 : 0);
      });
      var net = tin - tout;
      var h = '<div class="lg-top"><h3>' + esc(opt.title || 'Payment records') + '</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="lg-b" data-lg="csv" type="button">Download for Excel</button><button class="lg-b" data-lg="print" type="button">Print or save as PDF</button></div></div>';
      if (opt.note) h += '<p class="lg-note">' + esc(opt.note) + '</p>';
      h += '<div class="lg-tools"><select data-lg="per"><option value="all">All time</option><option value="today">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>' +
        mk.map(function (k) { return '<option value="' + k + '">' + monthName(k) + '</option>' }).join('') + '</select>' +
        '<select data-lg="dir"><option value="">Money in and out</option><option value="in">Money in only</option><option value="out">Money out only</option></select>' +
        '<select data-lg="cat"><option value="">All types</option>' + Object.keys(cats).sort().map(function (c) { return '<option>' + esc(c) + '</option>' }).join('') + '</select>' +
        '<input data-lg="q" type="search" placeholder="Search name or reference" value="' + esc(S.q) + '"></div>';
      h += '<div class="lg-cards"><div class="lg-c" style="--k:var(--in)"><span>Money in</span><b style="color:var(--in)">' + fmt(tin) + '</b><small>received</small></div>' +
        '<div class="lg-c" style="--k:var(--out)"><span>Money out</span><b style="color:var(--out)">' + fmt(tout) + '</b><small>paid to franchises and sellers</small></div>' +
        '<div class="lg-c" style="--k:#0E2A47"><span>Left with MOZLYT</span><b>' + fmt(net) + '</b><small>money in minus money out</small></div>' +
        '<div class="lg-c" style="--k:#d97706"><span>Still waiting</span><b>' + fmt(wait) + '</b><small>not counted yet &middot; ' + n + ' payments counted</small></div></div>';
      var bk = Object.keys(by).sort();
      if (bk.length) {
        h += '<h4>By type</h4><div class="lg-wrap"><table class="lg-t"><thead><tr><th>Type</th><th class="n">Payments</th><th class="n">Money in</th><th class="n">Money out</th><th class="n">Balance</th></tr></thead><tbody>' +
          bk.map(function (c) { var b = by[c]; return '<tr><td>' + esc(c) + '</td><td class="n">' + b.n + '</td><td class="n lg-in">' + (b.i ? fmt(b.i) : '') + '</td><td class="n lg-out">' + (b.o ? fmt(b.o) : '') + '</td><td class="n">' + fmt(b.i - b.o) + '</td></tr>' }).join('') +
          '</tbody><tfoot><tr><td>Total</td><td class="n">' + n + '</td><td class="n lg-in">' + fmt(tin) + '</td><td class="n lg-out">' + fmt(tout) + '</td><td class="n">' + fmt(net) + '</td></tr></tfoot></table></div>';
      }
      h += '<h4>Every payment</h4>';
      if (!rows.length) h += '<div class="lg-empty">No payments match. Change the period or the filters above.</div>';
      else h += '<table class="lg-t st"><thead><tr><th>Date</th><th>Details</th><th class="n">Money in</th><th class="n">Money out</th><th class="n">Balance</th><th>Status</th></tr></thead><tbody>' +
        rows.map(function (r) {
          var s = stat(r), a = fmt(r.amount);
          return '<tr class="' + (counted(r) ? '' : 'dim') + '"><td class="dt">' + esc(dt(r.at)) + '</td><td class="dd" data-l="Details"><span class="lg-d">' + esc(r.party) + ' &middot; ' + esc(r.cat) + '</span><span class="lg-m">' + esc(r.descr) + (r.ref ? ' &middot; ' + esc(r.ref) : '') + '</span></td>' +
            '<td class="n" data-l="Money in">' + (r.dir === 'in' ? '<span class="lg-in">+ ' + a + '</span>' : '') + '</td><td class="n" data-l="Money out">' + (r.dir === 'out' ? '<span class="lg-out">&minus; ' + a + '</span>' : '') + '</td>' +
            '<td class="n" data-l="Balance">' + (counted(r) ? fmt(r._bal) : '') + '</td><td data-l="Status"><span class="lg-s ' + s[0] + '">' + s[1] + '</span></td></tr>'
        }).join('') + '</tbody></table>';
      host.innerHTML = h;
      host.querySelector('[data-lg=per]').value = S.per; host.querySelector('[data-lg=dir]').value = S.dir; host.querySelector('[data-lg=cat]').value = S.cat;
      host._rows = rows; host._tot = { tin: tin, tout: tout, net: net };
    }
    host.addEventListener('change', function (e) { var k = e.target && e.target.dataset && e.target.dataset.lg; if (!k || !(k in S)) return; S[k] = e.target.value; view() });
    var qt; host.addEventListener('input', function (e) { if (e.target && e.target.dataset && e.target.dataset.lg === 'q') { S.q = e.target.value; clearTimeout(qt); qt = setTimeout(function () { view(); var i = host.querySelector('[data-lg=q]'); if (i) { i.focus(); i.setSelectionRange(S.q.length, S.q.length) } }, 250) } });
    host.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-lg]'); if (!b || !b.dataset.lg) return;
      if (b.dataset.lg === 'csv') csv(host._rows || []);
      if (b.dataset.lg === 'print') print(host._rows || [], host._tot || {}, opt);
    });
    function csv(rows) {
      var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"' };
      var out = [['Date', 'Type', 'Name', 'Details', 'Reference', 'Money in', 'Money out', 'Status']].concat(rows.map(function (r) { return [dt(r.at), r.cat, r.party, r.descr, r.ref, r.dir === 'in' ? num(r.amount) : '', r.dir === 'out' ? num(r.amount) : '', stat(r)[1]] }));
      var blob = new Blob(['﻿' + out.map(function (r) { return r.map(q).join(',') }).join('\r\n')], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'payment-records.csv'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove() }, 500);
    }
    function print(rows, t, o) {
      var w = window.open('', '_blank'); if (!w) return;
      var asc = rows.slice().reverse();
      w.document.write('<!doctype html><meta charset="utf-8"><title>Payment records</title><style>body{font:14px Arial,sans-serif;color:#10233f;margin:24px}h1{margin:0 0 4px;font-size:22px}p{margin:0 0 14px;color:#555}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:7px 9px;text-align:left;vertical-align:top;font-size:12.5px}th{background:#f1f4f2}.n{text-align:right;white-space:nowrap}.i{color:#15803d}.o{color:#b91c1c}tfoot td{font-weight:700;background:#f1f4f2}</style>' +
        '<h1>' + esc((o && o.title) || 'Payment records') + '</h1><p>Printed ' + esc(dt(new Date())) + '. Only completed payments are counted in the totals.</p><table><thead><tr><th>Date</th><th>Details</th><th>Status</th><th class="n">Money in</th><th class="n">Money out</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td>' + esc(dt(r.at)) + '</td><td><b>' + esc(r.party) + '</b> &middot; ' + esc(r.cat) + '<br>' + esc(r.descr) + (r.ref ? ' &middot; ' + esc(r.ref) : '') + '</td><td>' + esc(stat(r)[1]) + '</td><td class="n i">' + (r.dir === 'in' ? fmt(r.amount) : '') + '</td><td class="n o">' + (r.dir === 'out' ? fmt(r.amount) : '') + '</td></tr>' }).join('') +
        '</tbody><tfoot><tr><td colspan="3">Total (completed payments)</td><td class="n">' + fmt(t.tin || 0) + '</td><td class="n">' + fmt(t.tout || 0) + '</td></tr><tr><td colspan="3">Left with MOZLYT</td><td class="n" colspan="2">' + fmt(t.net || 0) + '</td></tr></tfoot></table>');
      w.document.close(); setTimeout(function () { try { w.print() } catch (e) { } }, 400);
    }
    function load() {
      return MZ.rpc(opt.rpc).then(function (r) { S.rows = r || []; view() }, function (er) { host.innerHTML = '<div class="lg-empty">' + esc(er.message) + '</div>' });
    }
    host._reload = load; load();
  }
  window.MZLedger = { mount: mount };
})();
