// Usage: node tools/contrast-check.js [baseUrl] [page1.html page2.html ...]
// Opens each page on a phone-sized screen, opens the top menu, and checks that every
// menu link is readable against the menu background. Prints FAIL lines and exits 1 if any.
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8765/';
const pages = process.argv.slice(3).length ? process.argv.slice(3) : ['index.html','shop.html','gh/index.html','gh/services.html','gh/about.html','blog.html','about.html','admin.html','franchise.html','provider.html','seller.html'];
const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4) }); return .2126*r+.7152*g+.0722*b };
const ratio = (a,b) => { const x=lum(a),y=lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05) };
const parse = s => (s.match(/[\d.]+/g)||[0,0,0,1]).map(Number);
(async () => {
  const br = await chromium.launch(); let bad = 0;
  for (const pg of pages) {
    const c = await br.newContext({ viewport:{width:412,height:900}, isMobile:true, hasTouch:true }); const p = await c.newPage();
    await p.route('**/*supabase.co/**', r => r.fulfill({status:200,contentType:'application/json',body:'[]'}));
    try { await p.goto(base+pg, {waitUntil:'load'}); await p.waitForTimeout(1200);
      const has = await p.evaluate(() => { const b=document.querySelector('.mz-burger'); if(!b) return false; b.click(); return true });
      if (!has) { console.log('SKIP', pg, '(no menu)'); await c.close(); continue }
      await p.waitForTimeout(400);
      const r = await p.evaluate(() => {
        const nav = document.getElementById('mzNav'); const out = [];
        let bg = 'rgba(0,0,0,0)'; for (let e = nav; e; e = e.parentElement) { const v = getComputedStyle(e).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(v)) { bg = v; break } }
        nav.querySelectorAll('a').forEach(a => { if (a.offsetParent) out.push([a.textContent.trim().slice(0,24), getComputedStyle(a).color, bg, getComputedStyle(a).backgroundColor]) });
        return out });
      let fails = 0;
      for (const [t, fg, bg, abg] of r) {
        const bgc = /rgba\(0, 0, 0, 0\)/.test(abg) ? parse(bg) : parse(abg);
        const cr = ratio(parse(fg).slice(0,3), bgc.slice(0,3));
        if (cr < 3) { fails++; console.log('FAIL', pg, JSON.stringify(t), 'text', fg, 'on', bg, 'contrast', cr.toFixed(2)) }
      }
      if (fails) bad++; else console.log('OK  ', pg, r.length, 'links readable');
    } catch (e) { console.log('ERR ', pg, e.message.split('\n')[0]) }
    await c.close();
  }
  await br.close(); process.exit(bad ? 1 : 0);
})();
