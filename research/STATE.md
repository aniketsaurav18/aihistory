# AI History Timeline — Session State (updated Sep 13 2026, evening session)

## Mission
Research full AI history (Attention Is All You Need → Sep 2026 slowdown debate) into year-wise JSON for a webpage timeline. Then: first-party sources for every event + `verified` flags. Then: catalog EVERY 2026 model (US + Chinese).

## Current numbers
- `2017.json`…`2026.json` + `index.json` in `/home/aniket/projects/aihistory/`
- Events total: **436** (2026.json alone has 165: 9 governance + 156 model releases)
- Sources verified: **630/647** · Events fully verified: **410/436**
- Remaining unverified URLs: **16** deduplicated → `human-chrome-verify/remaining-unverified.json` (freshly rebuilt; all adjudicated, see holds below)

## Schema (per event)
`id, date, title, category, organizations[], summary, significance, tags[]`, `sources[]: {label, url, type, verified?, verifiedTitle?, verifiedVia?, note?}`, `confidence?` (2026 models: high/medium/low), `verified?` (event-level: true ONLY if every source verified).
`verifiedVia` tiers: `browser` (agent-browser headless) < `exa` (Exa scrape, title+date+lead matched) < `playwright-user-chrome` (user's real Chrome via CDP — strongest, beats Cloudflare).

## Key files
- `human-chrome-verify/SKILL.md` — the reusable verification skill (user Chrome + Playwright method)
- `human-chrome-verify/pw-grind.js` — chunked grind script: `node $SKILL_DIR/run.js pw-grind.js <offset> <limit>`; reads `remaining.json` from CWD-adjacent path (edit paths: it uses `/tmp/opencode/` — repoint to project dir or recreate; SKILL_DIR=/home/aniket/.agents/skills/playwright-skill)
- `human-chrome-verify/remaining-unverified.json` — `{url: {label, type, note, events[]}}`
- `/tmp/opencode/` is EPHEMERAL (pw-grind.json results with bodies, stage-*.json already merged — safe to lose).

## Verification rules in force (user orders)
1. Don't just check HTTP 200 — **read title+h1+pubDate+lead+body** and confirm it's the right article before flagging.
2. 404s → find replacement truth via Exa (news/Wikipedia/credible allowed for dead links only).
3. Never flag search-snippet-only confirmations as `verified` without honest `verifiedVia`.
4. Dead sole-source URLs: keep + `"note": "Original page removed (HTTP 404 confirmed <date>)"`. Dead dupes: drop if event keeps another source.

## Known findings (don't re-discover)
- OpenAI prunes retired-model docs: `developers.openai.com/api/docs/models/<old>` 404 → index lists only current slugs. Dots-vs-dashes matter (`gpt-realtime-1.5` lives, `gpt-realtime-1-5` 404s).
- Meta deleted Galactica/Cicero blogs, old `ai.meta.com/blog/*` slugs 400 (OPT slug moved to `democratizing-access-to-large-scale-language-models-with-opt-175b`).
- xAI 2023 news URLs all 404 post-SpaceXAI rebrand → use `x.ai/` + note.
- 3 wrong arXiv IDs were in our data, caught via title mismatch and FIXED: Sparse Transformer→1904.10509; malicious-use 1802.10129 REMOVED (points at DFT paper, report has no arXiv); Stochastic Parrots has no arXiv (ACM-walled, kept+note). BAAI WuDao ID still flagged wrong, needs correct ID.
- Exa error taxonomy: legacy-JS render fails, path-level Cloudflare 403s, moved-URL 400s, genuine NOT_FOUNDs, `ai.googleblog.com` blogspot hangs (use research.google/blog or `*.research.google` pages instead), parallel-fetch timeouts (sequential ≤8 URLs).
- agent-browser headed is broken in containers (blank paint, `about:blank`); its `open` title output is unreliable. Config `args` must stay single-string.
- User's Chrome debug recipe: quit ALL Chrome → `google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug` → `curl :9222/json/version` → Playwright `connectOverCDP`. Never close their last tab. Automation clicks fail Turnstile; human clicks work.

## Queued work (in order)
1. ~~Finish grinding `remaining-unverified.json`~~ DONE Sep 13 eve: ground all 127 via user Chrome (149 pw-grind records in `/tmp/opencode/pw-grind.json`), every `loaded` body-read before flagging. 16 URLs remain, each deliberately held:
   - 4 dead-notes accepted (no first-party exists): HF $40M blog, Galactica blog, Lensa page, Microsoft Altman blog (all HTTP 404 via user Chrome, notes on events).
   - 4 rumor/negative-evidence holds (by design): deepseek-r2-rumor (changelog cited for *absence* of R2), gemini-4-rumor, gemini-3-5-pro-rumor, qwen4-rumor.
   - 8 weak-page holds: iflytek.com + 01.ai homepages (generic, no model mention), xAI models docs (living page, no 4.3 entry — xAI published no 4.3 post), qwencloud changelog (no 3.7-Plus entry), huawei openPangu URL (article is Pro-only, Flash event keeps it unverified), poolside release-notes (XS 2.1 entry below fold unconfirmed), BlueLM-7B quant repo (event is Nano-3B), kimi models page (no K2.8 in captured body).
2. ~~Find replacements~~ DONE: WuDao corpora paper had NO arXiv — replaced wrong ID 2107.03306 with AI Open DOI 10.1016/j.aiopen.2021.06.001 (verified exa); OPPO generic org → AndesVL collection URL (verified exa); SenseNova Flash-Lite wrong U1 URL → 51170639 (verified exa); Qwen3.7-Max changelog → Alibaba Model Studio docs (verified exa); GPT-Realtime generic docs → gpt-realtime-2.1 doc (verified exa); Tencent ×3 (Chrome-blocked) verified via Exa title+date+lead.
3. 2026 low-confidence rumors: Grok 4.3/Yi-Lightning-2 have no first-party post (third-party corroboration exists, not flagged per first-party rule). Qwen3.7-Plus still needs a specific source.
4. DONE Sep 13: coding-agent gap-fill — main timeline had no Cursor/Codex-CLI/Copilot-Workspace/Copilot-agent/Jules/SWE-bench. Added 6 events (2023-10-10-swe-bench; 2024-04-29-copilot-workspace; 2025-04-16-codex-cli; 2025-05-19-copilot-coding-agent; 2025-05-19-jules-preview; 2025-06-04-cursor-10) plus standalone 2025-02-24-claude-code-launch (blog + canonical docs + Feb 24 X announcement tweet), promoted 4 (2021-08-10-codex-beta, 2022-06-21-copilot-ga, 2025-05-16-codex-agent, 2025-09-15-gpt5-codex) to important_events.json (118→129), index.json 423→430, timeline.html rebuilt newest-first with sort toggle.
5. DONE Sep 13 eve: user-Chrome grind of all 14 coding-agent URLs (grind-agents + retry in /tmp/opencode/, records in pw-grind-agents.json). 12 loaded first pass; docs.anthropic.com/en/docs/agents-and-tools/claude-code 404 (docs moved → replaced with https://code.claude.com/docs, loaded, h1 Overview); developers.openai.com/codex/cli redirects to https://learn.chatgpt.com/docs/codex/cli (stored URL updated to final); X status 1894092430560965029 timed out once, loaded 200 on retry with tweet text in title+h1. All 14 now verifiedVia playwright-user-chrome. Two stored-URL updates, exact grind titles merged, important_events.json copies refreshed (drift 0). remaining-unverified.json still 16 urls, unchanged.
6. DONE Sep 13 eve: open-weights letter (2026-07-24, NVIDIA-hosted PDF + Jensen's first-ever X post 2080643682408321103 + CNBC) — note NOT all labs: OpenAI/Anthropic/Google absent at launch (Altman/Musk welcomed; Anthropic own position Jul 27); Coxon resignation (2026-09-08, @hilbertspaess status 2097476196791709843 + AP/PBS; WSJ 401-paywalled so dropped, event keeps X+AP); Antigravity launch (2025-11-18, antigravity.google blog + dev-googleblog). All 8 URLs ground via user Chrome (pw-grind2.json), 7 upgraded to playwright-user-chrome. important 129→132, index 430→433, timeline rebuilt.
7. DONE Sep 13 eve: pace-frontier endorsements (2026-09-12, user-supplied tweets sama/2098811563415150910 + elonmusk/2098789109980332057, Amodei X announcement 2098773920774074715 found via @DarioAmodei profile scan in user Chrome, Fortune Altman interview) — all 4 ground 200 via user Chrome (pw-grind3.json), flagged playwright-user-chrome. Framed as endorsements + pact HINTS, explicitly not a signed agreement. important 132→133, index 433→434, timeline rebuilt.
8. DONE Sep 13 eve: OpenAI-agents-hack-HF incident (2026-07-21-openai-hf-breach, drama) — OAI blog + HF disclosure (Jul 16) + HF technical timeline (Jul 27) + Black Hat YouTube video (Wallace/Dalton, v=87DyyMV0kCY). All 4 ground 200 via user Chrome (pw-grind5.json), flagged playwright-user-chrome. important 133→135 (incl. nvidia-hf 134), index 434→436, timeline surgically updated.
4. Morning summary already promised: user asleep, Chrome tabs may still be open in their session.

## Rebuild + tally commands
```bash
python3 -c "import json,glob;seen={};
for f in sorted(glob.glob('/home/aniket/projects/aihistory/20*.json')):
 d=json.load(open(f))
 for e in d['events']:
  for s in e.get('sources',[]):
   if not s.get('verified'):
    seen.setdefault(s['url'],{'label':s['label'][:70],'type':s.get('type'),'note':s.get('note',''),'events':[]})['events'].append(e['id'])
json.dump(seen,open('/home/aniket/projects/aihistory/human-chrome-verify/remaining-unverified.json','w'),indent=1);print(len(seen))"
```
