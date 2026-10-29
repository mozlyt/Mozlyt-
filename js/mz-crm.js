/* MOZLYT customer follow-up for shop owners (sellers and franchises).
   Shows unfinished carts, a customer pipeline, offers consent and a follow-up log.
   Used inside the Customers tab. Every call is limited to the owner's own customers by the database. */
(function () {
  var S = { shop: null, carts: [], rec: { n: 0, v: 0 }, f: 'all', reload: null, redraw: null, list: [], offer: '' };
  var DAY = 86400000;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
  function $(i) { return document.getElementById(i) }
  function say(t) {
    var e = $('crmToast');
    if (!e) { e = document.createElement('div'); e.id = 'crmToast'; e.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#0E2A47;color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;z-index:99999;max-width:90vw;box-shadow:0 6px 24px rgba(0,0,0,.3)'; document.body.appendChild(e) }
    e.textContent = t; e.style.display = 'block'; clearTimeout(e._t); e._t = setTimeout(function () { e.style.display = 'none' }, 2600);
  }
  try { S.offer = localStorage.getItem('mz-crm-offer') || '' } catch (e) { }
  function first(n) { return String(n || '').trim().split(/\s+/)[0] || '' }
  function wa(phone, text) { return phone ? 'https://wa.me/' + MZ.phoneIntl(phone) + '?text=' + encodeURIComponent(text) : '' }
  function shopName() { return (S.shop && S.shop.store_name) || 'our shop' }
  function shopUrl() {
    var p = S.shop || {};
    if (p.custom_domain && p.domain_status === 'active') return 'https://' + p.custom_domain + '/';
    if (p.franchise && p.franchise_country) return 'https://mozlyt.com/' + String(p.franchise_country).toLowerCase() + '/shop.html';
    return 'https://mozlyt.com/store.html?s=' + encodeURIComponent(p.store_slug || '');
  }
  function unsubUrl(tok) { var u = shopUrl(); return u + (u.indexOf('?') > -1 ? '&' : '?') + 'unsub=' + tok }
  function ago(t) { return t ? Date.now() - new Date(t).getTime() : Infinity }

  /* ---- who needs attention ---- */
  function attn(c) {
    if (c.open_cart) return true;
    if (c.orders > 0 && ago(c.last_order_at) > 30 * DAY && ago(c.last_contact_at) > 14 * DAY) return true;
    if (c.orders === 0 && c.has_account && ago(c.created_at) > 2 * DAY && ago(c.last_contact_at) > 14 * DAY) return true;
    return false;
  }
  function offerOk(c) { return c.marketing_ok && !c.unsub_at }
  var FILT = {
    all: function () { return true }, enquiry: function (c) { return c.stage === 'enquiry' }, new: function (c) { return c.stage === 'new' },
    buyer: function (c) { return c.stage === 'buyer' }, repeat: function (c) { return c.stage === 'repeat' },
    attention: attn, offers: offerOk
  };
  var LABEL = { all: 'All', attention: 'Needs attention', enquiry: 'Enquiry', new: 'New', buyer: 'Buyers', repeat: 'Repeat buyers', offers: 'Agreed to offers' };
  var STAGE = { new: 'New', enquiry: 'Enquiry', buyer: 'Buyer', repeat: 'Repeat buyer' };

  /* ---- top block: unfinished carts, filters, offer message ---- */
  function cartRow(c) {
    var items = (c.items || []).map(function (i) { return i.qty + ' x ' + i.name }).join(', ');
    var nm = c.name || c.phone || c.email || 'Customer';
    var msg = 'Hi ' + first(c.name) + ', you left ' + items + ' in your cart at ' + shopName() + '. It is still saved for you: ' + shopUrl() + ' Reply here if you need any help.';
    var link = c.phone ? wa(c.phone, msg) : '';
    return '<div class="it" style="margin-top:10px"><div class="h"><b>' + esc(nm) + '</b><span class="m"><b>' + MZ.money(c.total || 0) + '</b></span></div>' +
      '<div class="m">' + esc(items) + '</div>' +
      '<div class="m">' + (c.phone ? esc(c.phone) : '') + (c.email ? ' &middot; ' + esc(c.email) : '') + ' &middot; left ' + MZ.when(c.updated_at) + (c.reminded_count ? ' &middot; reminded ' + c.reminded_count + ' time' + (c.reminded_count === 1 ? '' : 's') : '') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      (link ? '<a class="b2" style="text-decoration:none" target="_blank" rel="noopener" href="' + esc(link) + '" data-crm="rem" data-id="' + esc(c.id) + '">Remind on WhatsApp</a>' :
        (c.email ? '<a class="b2" style="text-decoration:none" href="mailto:' + esc(c.email) + '?subject=' + encodeURIComponent('Your cart at ' + shopName()) + '&body=' + encodeURIComponent(msg) + '" data-crm="rem" data-id="' + esc(c.id) + '">Remind by email</a>' : '')) +
      '<button class="b2 ghost" type="button" data-crm="dis" data-id="' + esc(c.id) + '">Dismiss</button></div></div>';
  }
  function cartsBlock() {
    var n = S.carts.length, val = S.carts.reduce(function (s, x) { return s + Number(x.total || 0) }, 0);
    return '<div class="it" style="margin-bottom:12px"><div class="h"><b>Unfinished carts</b><span class="m">' + n + ' waiting &middot; ' + MZ.money(val) + '</span></div>' +
      '<div class="m">People who added items and left their phone number or email, but did not order. A cart shows here 20 minutes after they leave.' +
      (S.rec.n ? ' Recovered so far: <b>' + S.rec.n + '</b> (' + MZ.money(S.rec.v) + ').' : '') + '</div>' +
      (n ? S.carts.map(cartRow).join('') : '<div class="empty">No unfinished carts right now.</div>') + '</div>';
  }
  function paint(list) {
    S.list = list || S.list;
    var host = $('crmTop'); if (!host) return;
    var chips = Object.keys(FILT).map(function (k) {
      var n = S.list.filter(FILT[k]).length, on = S.f === k;
      return '<button type="button" data-crm="f" data-k="' + k + '" style="padding:7px 12px;border-radius:99px;border:' + (on ? '2px solid #1F9D6B' : '1px solid rgba(128,128,128,.5)') + ';background:' + (on ? 'rgba(31,157,107,.14)' : 'transparent') + ';color:inherit;font-size:13px;cursor:pointer;font-weight:' + (on ? 700 : 500) + '">' + LABEL[k] + ' (' + n + ')</button>';
    }).join('');
    host.innerHTML = cartsBlock() +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px">' + chips + '</div>' +
      '<label class="m" style="display:grid;gap:4px;margin-bottom:12px">Your offer message (sent only to people who agreed to offers)<textarea id="crmOffer" rows="2" maxlength="400" placeholder="e.g. New massage guns are in. 10% off this week.">' + esc(S.offer) + '</textarea></label>';
  }
  function filter(list) { return (list || []).filter(FILT[S.f] || FILT.all) }

  /* ---- extra row content inside each customer card ---- */
  function extra(c) {
    var tags = '<span class="tag">' + (STAGE[c.stage] || 'New') + '</span> ' +
      (c.unsub_at ? '<span class="tag" style="background:#fde8e8;color:#9b1c1c">Opted out of offers</span>' : (c.marketing_ok ? '<span class="tag">Agreed to offers</span>' : '<span class="tag" style="opacity:.7">No offers consent</span>')) +
      (attn(c) ? ' <span class="tag" style="background:#fff4d6;color:#7a5200">Needs attention</span>' : '');
    var btns = '';
    if (offerOk(c) && c.phone) btns += '<button class="b2" type="button" data-crm="offer" data-id="' + esc(c.id) + '">Send offer</button>';
    if (offerOk(c)) btns += '<button class="b2 ghost" type="button" data-crm="stop" data-id="' + esc(c.id) + '">They said stop</button>';
    btns += '<button class="b2 ghost" type="button" data-crm="fu" data-id="' + esc(c.id) + '">Follow-ups' + (c.followups ? ' (' + c.followups + ')' : '') + '</button>';
    return '<div class="m" style="margin-top:6px">' + tags + (c.last_contact_at ? ' &middot; last contact ' + MZ.when(c.last_contact_at) : '') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">' + btns + '</div><div class="crmfu" hidden></div>';
  }

  /* ---- actions ---- */
  function find(id) { for (var i = 0; i < S.list.length; i++) if (S.list[i].id === id) return S.list[i]; return null }
  function loadCarts() {
    return MZ.rpc('my_carts').then(function (r) {
      S.carts = (r && r.carts) || []; S.rec = { n: (r && r.recovered) || 0, v: (r && r.recovered_value) || 0 }; paint();
    }, function () { });
  }
  function load() {
    var u = MZ.user && MZ.user();
    if (!S.shop && u) MZ.q('profiles', 'select=store_name,store_slug,custom_domain,domain_status,franchise,franchise_country&id=eq.' + u.id).then(function (r) { S.shop = r && r[0] || {}; paint() }).catch(function () { });
    return loadCarts();
  }
  function fuPanel(box, c) {
    box.hidden = false; box.innerHTML = '<div class="m">Loading...</div>';
    MZ.rpc('my_followups', { p_id: c.id }).then(function (r) {
      box.innerHTML = '<div style="display:grid;gap:6px;margin-top:8px;padding:10px;border:1px solid rgba(128,128,128,.35);border-radius:10px">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><select data-fch style="padding:8px;border-radius:8px"><option value="whatsapp">WhatsApp</option><option value="call">Phone call</option><option value="sms">SMS</option><option value="email">Email</option><option value="visit">In person</option></select>' +
        '<input data-fnote maxlength="300" placeholder="What was said or agreed" style="flex:1;min-width:160px;padding:8px;border-radius:8px"><button class="b2" type="button" data-crm="fusave" data-id="' + esc(c.id) + '">Save</button></div>' +
        ((r || []).map(function (f) { return '<div class="m" style="padding:5px 0;border-top:1px solid rgba(128,128,128,.25)">' + MZ.when(f.created_at) + ' &middot; <b>' + esc(f.channel) + '</b>' + (f.note ? ' &middot; ' + esc(f.note) : '') + '</div>' }).join('') || '<div class="m">No follow-ups saved yet.</div>') + '</div>';
    }, function (er) { box.innerHTML = '<div class="m">' + esc(er.message) + '</div>' });
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'crmOffer') { S.offer = e.target.value; try { localStorage.setItem('mz-crm-offer', S.offer) } catch (x) { } }
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-crm]'); if (!b) return;
    var a = b.dataset.crm, id = b.dataset.id;
    if (a === 'f') { S.f = b.dataset.k; paint(); if (S.redraw) S.redraw(); return }
    if (a === 'rem') { MZ.rpc('mark_cart_reminded', { p_id: id, p_channel: 'whatsapp' }).then(function () { setTimeout(loadCarts, 800); if (S.reload) setTimeout(S.reload, 900) }); return }
    if (a === 'dis') { MZ.rpc('dismiss_cart', { p_id: id }).then(function () { loadCarts(); say('Removed from the list') }, function (er) { say(er.message) }); return }
    var c = find(id); if (!c) return;
    if (a === 'offer') {
      var t = (S.offer || '').trim();
      if (!t) { say('Write your offer message at the top first'); var o = $('crmOffer'); if (o) o.focus(); return }
      var msg = 'Hi ' + first(c.name) + ', ' + t + '\n\n' + shopName() + ': ' + shopUrl() + '\nTo stop receiving offers: ' + unsubUrl(c.unsub_token);
      window.open(wa(c.phone, msg), '_blank', 'noopener');
      MZ.rpc('log_followup', { p_id: c.id, p_channel: 'whatsapp', p_note: 'Offer sent' }).then(function () { if (S.reload) S.reload() }); return
    }
    if (a === 'stop') { MZ.rpc('set_customer_optout', { p_id: c.id }).then(function () { say('Marked as opted out. No more offers to them.'); if (S.reload) S.reload() }, function (er) { say(er.message) }); return }
    if (a === 'fu') { var box = b.closest('.it').querySelector('.crmfu'); if (!box.hidden) { box.hidden = true; return } fuPanel(box, c); return }
    if (a === 'fusave') {
      var bx = b.closest('.crmfu'), ch = bx.querySelector('[data-fch]').value, nt = bx.querySelector('[data-fnote]').value.trim();
      MZ.rpc('log_followup', { p_id: c.id, p_channel: ch, p_note: nt }).then(function () { say('Follow-up saved'); fuPanel(bx, c); if (S.reload) setTimeout(S.reload, 300) }, function (er) { say(er.message) });
    }
  });

  window.MZCRM = {
    attach: function (o) { S.reload = o.reload; S.redraw = o.redraw },
    load: load, paint: paint, filter: filter, extra: extra
  };
})();
