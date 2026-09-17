<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI History — agent instructions

Static Next.js timeline of AI history (2017–2026). Canonical data lives in
`data/years/*.json`, indexed by `data/index.json`. Event type: `lib/types.ts`.

## Data conventions

- Event schema: `id` (slug `YYYY-MM-DD-short-name`), `highlight` (true =
  curated Highlights view), `date` (YYYY-MM-DD), `title`, `category` (paper |
  model-release | product | company | policy | drama | advance | infrastructure),
  `organizations[]`, `summary` (2–5 sentences), `significance` (1–2 sentences),
  `tags[]`, `sources[]`, `confidence?` (high | medium | low), `verified?`.
- `highlight` is curated and rare (~30 across the whole timeline). Set true
  only for genuinely landmark events.
- `confidence`: use for single-sourced / rumor / rolling-launch items.
- Keep events in chronological order (by date, then id) within each year file.
- Dates are best-available publication/announcement dates; note uncertainty
  in the summary rather than picking a false-precision date.
- After any add/remove: sync `count` in the year file AND the matching entry
  plus `total_events` in `data/index.json`. If coverage extends past the
  current range, update `range`/`description` in both files.

## Source validation (mandatory)

Every link and source added to the timeline MUST be validated before commit:

- Prefer first-party sources (official blogs, docs, papers, repos). Press /
  social / archive links are for corroboration or when no first-party page exists.
- Don't just check HTTP 200 — read the title, h1, pub date, lead, and body,
  and confirm it is the right article before marking verified.
- Event-level `verified: true` ONLY if every source on the event is verified.
- Each source records `{label, url, type, verified, verifiedTitle, verifiedVia}`:
  - `verifiedVia` tiers: `browser` (headless) < `exa` (scrape with
    title+date+lead matched) < `playwright-user-chrome` (user's real Chrome
    over CDP — strongest, beats Cloudflare). Never overclaim the tier used.
  - Search-snippet-only confirmations are NOT verified.
- Dead links: original page gone (404 confirmed) → keep sole sources with
  `"note": "Original page removed (HTTP 404 confirmed <date>)"`, drop dead
  duplicates when the event keeps another source. For dead links only,
  credible third-party replacements (news/Wikipedia) are acceptable.
- Known traps: OpenAI prunes retired-model docs; Meta deleted old
  `ai.meta.com/blog/*` slugs; xAI 2023 news URLs 404 post-rebrand (use `x.ai/`
  + note); arXiv IDs must be title-matched (wrong IDs have shipped before);
  Truth Social canonical pages return HTTP 403 shell but render the post body
  (record that honestly in `verifiedTitle`).
- Tooling/notes: `research/verification/SKILL.md`,
  `research/verification/remaining-unverified.json`, `research/STATE.md`.

## Edit hygiene

- Data files use custom 1-space-indent formatting with compact small arrays.
  NEVER rewrite them with a JSON serializer — it reflows thousands of lines.
  Use surgical text edits (insert event block, bump counts) so diffs stay minimal.
- Validate after every data change: files parse as JSON, `count` fields match
  actual event lengths, no duplicate ids, new event present with intended flags.
- `next-env.d.ts` is generated — never stage it. `data/sources.json` covers
  2021–2023 only; new events carry their own `sources[]`.
- Run `npm run build` for code changes; JSON-only changes need no rebuild.

## Git

- Commit, amend, push, or open PRs only when explicitly asked. Before
  committing inspect `git status`, `git diff`, `git log --oneline -10`; stage
  only intended files. Concise commit messages matching repo style
  (e.g. `Add TypeSafe Jev System One model launch (highlighted, Sep 15)`).
