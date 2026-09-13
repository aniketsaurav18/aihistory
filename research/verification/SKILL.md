---
name: human-chrome-verify
description: Verify first-party source URLs (announcement blogs, docs, papers) using the user's real headed Chrome over CDP with Playwright, bypassing Cloudflare/bot-walls that block headless automation. Use when bulk-verifying source links for timeline/dataset JSON files, when Exa fetch or headless browsers hit challenges, 403s, or render failures.
---

# Human-Chrome Verification (Playwright + user's Chrome)

Batch-verify that source URLs are the correct live first-party pages by loading them in the **user's real headed Chrome** via Playwright `connectOverCDP`. A real browser with a human profile sails past Cloudflare Turnstile and bot-walls that stop headless Chromium, Exa's crawler, and `agent-browser`.

Developed while verifying 400+ sources for the AI-history timeline in this folder (`2017.json` … `2026.json`, `index.json`).

## When to use this vs alternatives

| Method | Use when | Watch out |
|---|---|---|
| `exa_web_fetch_exa` (bulk) | Fast first pass, 4–8 URLs/call, sequential calls | Fails on legacy JS pages ("couldn't load"), path-level 403s, moved URLs (400), dead URLs (NOT_FOUND), old `ai.googleblog.com` blogspot hangs; parallel fetch calls time out |
| agent-browser headless | Quick single checks, GitHub/arXiv/simple blogs | Cloudflare "Just a moment..." on protected domains; **headed mode is broken in containers** (blank screenshots, tabs stuck on `about:blank`) |
| **This skill (user Chrome + Playwright)** | Blocked URLs, final verdicts (live vs 404 vs wall), titles/h1/dates | Needs 2 min of the user's time once per session |

## Step 1 — Launch the user's Chrome for debugging

The user must run this (all Chrome windows must be **fully quit first**, or the flag is silently ignored with "Opening in existing browser session"):

```bash
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
```

Two non-obvious requirements discovered the hard way:
- `--user-data-dir` is **mandatory** — Chrome refuses remote debugging on the default profile ("requires a non-default data directory").
- Disable *Settings → System → Continue running background apps* or old processes hijack every launch.

Verify the port is live (must return Browser JSON, not "Connection refused"):

```bash
curl -s -m 8 http://127.0.0.1:9222/json/version
```

## Step 2 — Connect Playwright (needs `playwright-skill`)

```bash
export SKILL_DIR=/home/aniket/.agents/skills/playwright-skill
node "$SKILL_DIR/run.js" -e "const {chromium} = require('playwright'); const b = await chromium.connectOverCDP('http://127.0.0.1:9222'); try { console.log('pages:', b.contexts().reduce((n,c)=>n+c.pages().length,0)); } finally { b.close(); }"
```

`browser.close()` here only **detaches CDP** — user tabs stay open. Rules while attached:
- **Never close the user's last tab.** Close only tabs your script opened; always leave `chrome://newtab` alive.
- If a Cloudflare checkbox appears: **do not click it yourself** — automation clicks are detected and reset. Leave the tab open, tell the user which tab needs one human click, resume after they confirm.

## Step 3 — Grind script (chunked, resumable)

Save as `pw-grind.js`. It pages through a URL list in offset/limit chunks, writes results incrementally to JSON (crash-safe), closes finished tabs, and **halts with the challenge tab left open** if bot detection appears:

```javascript
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
      const rec = { url, finalUrl: null, title: null, h1: null, http: null, pubDate: null, lead: null, status: 'unknown' };
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 22000 });
        rec.http = resp ? resp.status() : null;
        await page.waitForTimeout(2500);
        try { rec.title = (await page.title()).slice(0, 90); } catch (_) {}
        rec.finalUrl = page.url().slice(0, 120);
        try { rec.h1 = (await page.locator('h1').first().innerText({ timeout: 4000 })).slice(0, 90); } catch (_) {}
        try {
          rec.pubDate = await page.evaluate(() => {
            const m = document.querySelector('meta[property="article:published_time"],meta[name="date"],time[datetime]');
            return m ? ((m.content || m.getAttribute('datetime') || '').slice(0, 10)) : null;
          });
        } catch (_) {}
        try { rec.lead = (await page.locator('article p, main p, p').first().innerText({ timeout: 4000 })).replace(/\s+/g, ' ').slice(0, 280); } catch (_) {}
        if (/just a moment/i.test(rec.title || '')) rec.status = 'cloudflare-challenge';
        else if (rec.http === 404 || /^404\b/.test(rec.h1 || '') || /page not found/i.test(rec.h1 || '')) rec.status = 'dead-404';
        else rec.status = 'loaded';
      } catch (e) {
        rec.status = 'error: ' + String(e).split('\n')[0].slice(0, 140);
        try { rec.title = (await page.title()).slice(0, 90); rec.finalUrl = page.url().slice(0, 120); } catch (_) {}
      }
      out.push(rec);
      fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
      console.log(rec.status + ' | ' + (rec.http || '-') + ' | ' + (rec.title || '?').slice(0, 55) + ' | ' + url.slice(0, 70));
      if (rec.status === 'cloudflare-challenge') { console.log('CHALLENGE-HALT: tab left open for human, stopping.'); break; }
      await page.close();
    }
  } finally { browser.close(); }
})();
```

Build `/tmp/opencode/remaining.json` as `{url: {label, type, events:[ids]}}` for every unverified source, then run ~40/chunk:

```bash
node "$SKILL_DIR/run.js" /tmp/opencode/pw-grind.js 0 40
```

## Step 4 — Interpret results (learned verdicts)

- `loaded` + specific title/h1 (+ matching pubDate/lead) → flag `verified:true`, `verifiedTitle`, `verifiedVia` (`browser` / `playwright-user-chrome` / `exa`).
- Real 404s are **findings, not failures**: publishers routinely delete old posts (OpenAI removed `glide`, `12-days`, `five-arena`; Meta removed Galactica/Cicero blogs post-pull; xAI 404'd all 2023 news in the SpaceXAI rebrand). Drop the URL if the event keeps another source, else keep it with `"note": "Original page removed (HTTP 404 confirmed <date>)"`.
- `dead-404` with HTTP **200** = soft-404 (EU sites render "Page not found" at 200) — treat as dead.
- Titles like `Prove your humanity` (Reddit), `Request Access` (Federal Register), bare `YouTube`, `Attention Required!` = bot-wall, not confirmation. Keep URL + wall note, don't flag.
- **Wrong-ID trap**: 3 arXiv IDs in our data pointed at unrelated papers (titles proved it). Always compare the fetched title against the expected paper; fix the ID via Exa search when mismatched.
- `about:blank` tabs with correct titles in `open` output = navigation never committed (broken renderer), not success. Trust only committed reads (`tab list`, snapshot, DOM).
- X/Twitter account pages load but don't prove specific tweets — relabel to account-level if status URLs are unstable.
- PDFs have no titles: HTTP 200 on the exact archived path + Exa content match is acceptable evidence.

## Step 5 — Merge flags (schema used in this folder)

Per source: `"verified": true, "verifiedTitle": "<exact page title>", "verifiedVia": "browser|playwright-user-chrome|exa"`. Per event: `"verified": true` only when **every** source is verified. Never flag search-snippet-only confirmations as `verified` without a `verifiedVia` that says how. After patching, refresh event flags and tally:

```bash
python3 -c "import json,glob; t=v=e=f=0
for x in sorted(glob.glob('20*.json')):
 d=json.load(open(x))
 for ev in d['events']:
  s=ev.get('sources',[]); t+=len(s); v+=sum(1 for z in s if z.get('verified')); e+=1
  f+=bool(s and all(z.get('verified') for z in s))
print(f'sources {v}/{t} | fully-verified events {f}/{e}')"
```

## Operational notes

- Exa limit observed: 30 req/s is fine; timeouts come from oversized parallel fetches, not rate limits — keep Exa batches sequential, ≤8 URLs.
- `agent-browser` config (`~/.agent-browser/config.json`) accepts `args` as a **single string only**; arrays invalidate the file. Its `open` title output is unreliable — always re-read the tab.
- Screenshot via CDP proves page rendering, not OS-window visibility; on Wayland, `wmctrl` can't list native windows and GNOME Shell `Eval` is blocked — if the user can't find the debug window, rename its tab title to something loud via `eval` (`document.title='⚠ ...'`) and have them use the Activities overview.
