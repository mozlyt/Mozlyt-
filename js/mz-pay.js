/* Paystack checkout (LIVE). The server verifies with PAYSTACK_SECRET_KEY_LIVE. To test again, swap in the pk_test key and the server key. */
(function () {
  var PK = 'pk_live_6d866e0acebda3502aa51b51f1ed24ad7b46763c';
  function load() {
    return new Promise(function (ok, no) {
      if (window.PaystackPop) return ok();
      var s = document.createElement('script'); s.src = 'https://js.paystack.co/v1/inline.js';
      s.onload = ok; s.onerror = function () { no(new Error('Could not open the payment window. Check your internet and try again.')); };
      document.head.appendChild(s);
    });
  }
  /* o: {amount (GHS), email, kind: subscription|training|franchise, tier, plan, item} */
  MZ.pay = function (o) {
    var amt = Math.round(Number(o.amount) * 100);
    if (!(amt > 0)) return Promise.reject(new Error('Amount not ready. Please refresh and try again.'));
    var ref = 'MZ' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase();
    return load().then(function () {
      return new Promise(function (ok, no) {
        var done = false;
        var h = PaystackPop.setup({
          key: PK, email: o.email, amount: amt, currency: 'GHS', ref: ref,
          channels: ['mobile_money', 'card'],
          callback: function () {
            done = true;
            MZ.fn('paystack-confirm', { reference: ref, kind: o.kind, tier: o.tier, plan: o.plan, item: o.item }).then(function (r) {
              if (r && r.ok) ok(r); else no(new Error((r && r.error) || 'We could not confirm the payment. Your reference is ' + ref + '. Send it to MOZLYT on WhatsApp.'));
            }, function () { no(new Error('We could not reach the server. Your payment reference is ' + ref + '. Send it to MOZLYT on WhatsApp.')); });
          },
          onClose: function () { if (!done) no(new Error('cancelled')); }
        });
        h.openIframe();
      });
    });
  };
})();
