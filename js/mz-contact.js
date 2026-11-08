/* MOZLYT contact chooser: Live chat, WhatsApp, Text message, Email.
   Replaces the direct WhatsApp links on the chat buttons (.wa-float, #bnChat). */
(function () {
  var WA = '233538729743', SMS = '+233538729743', MAIL = 'Info@mozlyt.com';
  var HI = 'Hello MOZLYT, I would like to know more.';
  var css = '.mzc{position:fixed;inset:0;background:rgba(14,42,71,.55);z-index:9000;display:none;align-items:flex-end;justify-content:center}.mzc.on{display:flex}' +
    '.mzc-p{background:#fff;width:100%;max-width:460px;border-radius:20px 20px 0 0;padding:18px 16px 22px;font-family:inherit;color:#0E2A47;max-height:92vh;overflow:auto}' +
    '@media(min-width:640px){.mzc{align-items:center}.mzc-p{border-radius:20px}}' +
    '.mzc-h{display:flex;align-items:center;margin-bottom:4px}.mzc-h h3{margin:0;font-size:20px;flex:1}.mzc-x{background:none;border:0;font-size:28px;line-height:1;cursor:pointer;color:#0E2A47;padding:0 4px}' +
    '.mzc-s{margin:0 0 12px;font-size:14px;color:#4a5b73}' +
    '.mzc-o{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:1px solid #DCE4DE;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer;text-decoration:none;color:#0E2A47;font:inherit;min-height:56px}' +
    '.mzc-o:hover,.mzc-o:focus-visible{border-color:#157650;background:#F3FAF6}.mzc-o b{display:block;font-size:16px}.mzc-o span{display:block;font-size:13px;color:#4a5b73}' +
    '.mzc-i{flex:none;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#E6F5EE}.mzc-i svg{width:22px;height:22px;fill:none;stroke:#157650;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}';
  var ICON = {
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    wa: '<path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7c-1-.4-2-1.4-2.4-2.4l.7-1-1-2z"/>',
    sms: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
  };
  function ico(k) { return '<span class="mzc-i"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg></span>'; }
  var el = null, last = null;
  function build() {
    if (el) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    el = document.createElement('div'); el.className = 'mzc'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Contact MOZLYT');
    el.innerHTML = '<div class="mzc-p"><div class="mzc-h"><h3>How would you like to reach us?</h3><button type="button" class="mzc-x" aria-label="Close">&times;</button></div><p class="mzc-s">Choose what suits you best.</p>' +
      '<button type="button" class="mzc-o" data-k="live">' + ico('chat') + '<div><b>Live chat</b><span>Chat with MOZLYT support here. Replies show in your account.</span></div></button>' +
      '<a class="mzc-o" data-k="wa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(HI) + '">' + ico('wa') + '<div><b>WhatsApp</b><span>Send us a message on WhatsApp.</span></div></a>' +
      '<a class="mzc-o" data-k="sms" href="sms:' + SMS + '?body=' + encodeURIComponent(HI) + '">' + ico('sms') + '<div><b>Text message (SMS)</b><span>Send a normal text message from your phone.</span></div></a>' +
      '<a class="mzc-o" data-k="mail" href="mailto:' + MAIL + '?subject=' + encodeURIComponent('Question for MOZLYT') + '&body=' + encodeURIComponent(HI) + '">' + ico('mail') + '<div><b>Email</b><span>' + MAIL + '</span></div></a></div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var t = e.target;
      if (t === el || t.closest('.mzc-x')) { close(); return; }
      var o = t.closest('.mzc-o'); if (!o) return;
      if (o.dataset.k === 'live') { close(); live(); } else setTimeout(close, 200);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('on')) close(); });
  }
  function open() { build(); last = document.activeElement; el.classList.add('on'); var f = el.querySelector('.mzc-o'); if (f) f.focus(); }
  function close() { if (!el) return; el.classList.remove('on'); if (last && last.focus) try { last.focus(); } catch (x) { } }
  function live() {
    if (window.MZAccount && MZAccount.openChat) MZAccount.openChat();
    else location.href = '/gh/shop.html#chat';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.wa-float,#bnChat');
    if (!a) return;
    e.preventDefault(); e.stopPropagation(); open();
  }, true);
  window.MZContact = { open: open };
})();
