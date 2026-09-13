const fs = require('node:fs');
const { chromium } = require('playwright');

const offset = parseInt(process.argv[2] || '0', 10);
const limit = parseInt(process.argv[3] || '40', 10);
const remaining = JSON.parse(fs.readFileSync('/tmp/opencode/remaining.json', 'utf8'));
const urls = Object.keys(remaining).slice(offset, offset + limit);
const outPath = '/tmp/opencode/pw-grind.json';
let out = [];
try { out = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch (_) {}

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  try {
    const ctx = browser.contexts()[0];
    for (const url of urls) {
      if (out.some(r => r.url === url)) { console.log('SKIP(done) ' + url); continue; }
      const page = await ctx.newPage();
      const rec = { url, finalUrl: null, title: null, h1: null, http: null, status: 'unknown' };
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 22000 });
        rec.http = resp ? resp.status() : null;
        await page.waitForTimeout(2500);
        try { rec.title = (await page.title()).slice(0, 90); } catch (_) {}
        rec.finalUrl = page.url().slice(0, 120);
        try { rec.h1 = (await page.locator('h1').first().innerText({ timeout: 4000 })).slice(0, 90); } catch (_) {}
        try {
          rec.pubDate = await page.evaluate(() => {
            const m = document.querySelector('meta[property="article:published_time"],meta[name="date"],meta[name="publish-date"],meta[property="og:updated_time"]');
            if (m && m.content) return m.content.slice(0, 10);
            const t = document.querySelector('time[datetime]');
            if (t) return (t.getAttribute('datetime') || '').slice(0, 10);
            return null;
          });
        } catch (_) { rec.pubDate = null; }
        try {
          rec.body = (await page.evaluate(() => {
            const root = document.querySelector('article') || document.querySelector('main') || document.body;
            const ps = Array.from(root.querySelectorAll('h1,h2,p,li')).slice(0, 24);
            return ps.map(el => el.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.length > 0).join('\n').slice(0, 1800);
          })).slice(0, 1800);
        } catch (_) { rec.body = null; }
        if (/just a moment/i.test(rec.title || '')) rec.status = 'cloudflare-challenge';
        else if (rec.http === 404 || /^404\b/.test(rec.h1 || '') || /page not found|not found/i.test(rec.h1 || '')) rec.status = 'dead-404';
        else rec.status = 'loaded';
      } catch (e) {
        rec.status = 'error: ' + String(e).split('\n')[0].slice(0, 140);
        try { rec.title = (await page.title()).slice(0, 90); rec.finalUrl = page.url().slice(0, 120); } catch (_) {}
      }
      out.push(rec);
      fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
      console.log(rec.status + ' | ' + (rec.http || '-') + ' | ' + (rec.title || '?').slice(0, 55) + ' | ' + url.slice(0, 70));
      if (rec.status === 'cloudflare-challenge') {
        console.log('CHALLENGE-HALT: leaving tab open for human, stopping run at ' + url);
        break; // leave tab open for the user to solve; resume after
      }
      await page.close();
    }
  } finally {
    browser.close();
  }
})();
