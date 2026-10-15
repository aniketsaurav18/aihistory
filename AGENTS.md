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
- `highlight` is user-curated. Do not auto-highlight research candidates;
  preserve the user's explicit Highlight choices when applying a review.
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
- Run `npm run build` for code changes. JSON-only data validation needs no
  rebuild, but always rebuild before verifying updated content in `out/`.

## Git

- Commit, amend, push, or open PRs only when explicitly asked. Before
  committing inspect `git status`, `git diff`, `git log --oneline -10`; stage
  only intended files. Concise commit messages matching repo style
  (e.g. `Add TypeSafe Jev System One model launch (highlighted, Sep 15)`).

## Manual research review

For AI-news research and user-selected timeline additions, use the repository-local [data-hand-picking skill](.agents/skills/data-hand-picking/SKILL.md). It covers source verification, deduplication, the HTML picker, retrieving user selections from Chrome, and applying them to the canonical data.

## Default workflow when the user asks to research

Treat requests such as "research", "research latest AI news", or "find news
to add" as instructions to run this workflow. The user should not need to
repeat the tool choices, review process, or validation requirements. Resume
existing research/review work when present rather than starting over.

### 1. Establish coverage and search with Exa

- Read this file, `lib/types.ts`, the data-hand-picking skill and its
  `references/review-format.md`. Inspect `git status`, `data/index.json`,
  every year file, and available `research/STATE.md`, candidates, final
  selections and application reports. Derive counts and coverage from the
  current data; never copy a previous run's counts or assume it was exhaustive.
- Use Exa for discovery. Start with a broad news sweep, then targeted searches
  for gaps. Focus on announcements since the latest completed review through
  the actual current date; include clearly dated, overlooked older milestones.
- Cover model releases and version updates, products, papers/advances,
  infrastructure, funding/company news, policy/legal actions, and security or
  industry incidents. Include Chinese labs and smaller decision, voice, image
  and video model providers as relevant. Do not rely only on major lab blogs
  or repeat a daily aggregator's shortlist. Return fewer items if evidence is
  weak; there is no candidate quota.

### 2. Verify sources in real Chrome

- Use the available `real-browser` skill and persistent research Chrome;
  Playwright over CDP may perform the reads. Follow that skill's setup and
  tab-ownership rules. Do not replace the user's existing review profile.
- Independently read each proposed source's committed URL, title/headings,
  date evidence, lead and relevant body. A search snippet, HTTP 200, generic
  landing page, teaser, loading shell or browser error does not verify an event.
- Prefer the original announcement. Use official filings/releases for legal
  actions; clearly attribute allegations and distinguish charges, requests for
  information and lawsuits from convictions, findings or penalties. Attribute
  private financial disclosures and vendor benchmark claims to their sources.
- Distinguish previews, experiments, opt-in features, future plans and completed
  releases. A new listing or alias does not prove a new model launch. Preserve
  default-versus-preview availability and important experimental limitations.
- Date the actual announcement/milestone, not a later recap, crawler timestamp,
  paper revision or local-time repost. Resolve dates from original evidence;
  keep unresolved dates on hold. Never manufacture precision.
- Save original source captures and exact verification methods under
  `research/verification/`. If real Chrome cannot read a source, report the
  limitation and record any successful alternative at its actual tier; do not
  upgrade an Exa scrape to `playwright-user-chrome`.

### 3. Deduplicate before recommending

- Compare every candidate with the entire canonical dataset, all active
  candidate lists and saved user decisions. Match the underlying action,
  names/versions, dates, descriptions and URLs, not titles alone.
- Do not reintroduce prior Delete choices as fresh recommendations. A material
  later milestone can be distinct: explain how a public rollout differs from
  an earlier restricted preview, or an update from the initial model release.
- Bundle co-announced model sizes/variants and overlapping launch features.
  Separate genuinely different actions even when organizations are the same.
- Save one authoritative candidate snapshot per review batch and a short audit
  of existing coverage, distinct items, merged repeats, exclusions and holds.
  Show the original dates of backfilled items. Keep completed queues marked
  applied so future runs do not recommend them again.

### 4. Present an interactive review

- Generate the standalone HTML picker using the skill's `generate_review.py`.
  Use dated, unique filenames/origins and record the exact URL, dataset
  fingerprint and retained server process in the research session record.
  Include `sources: []` on supporting-context entries without source links.
- Start all candidates Unreviewed. Keep accepts; Highlight accepts with
  `highlight: true`; Delete rejects only that candidate. Held dates cannot
  become ready for insertion merely because the user selects Keep.
- Open a task-owned tab in the user's research Chrome and share its link.
  Test rendering, decision/note persistence after reload, actual exported JSON
  flags, filters, holds and narrow-screen layout in an isolated test context.
  Test choices must never overwrite the user's choices.
- A research request alone stops here with canonical data unchanged. If the
  user asks for more news while reviewing, first capture their current choices,
  then create a separate deduplicated supplementary picker. Do not regenerate
  an active picker, change its fingerprint/origin, or reset browser storage.

### 5. Retrieve and apply the user's choices

- In this research flow, "done", "all selections done", or "check now" means
  read the exact existing picker tab(s) and apply reviewed choices. Use the
  skill's `read_review.js` with the Playwright skill runner; do not ask the user
  to export unnecessarily. An explicitly requested extra event may be added
  directly after source/date verification and deduplication.
- Validate each export's fingerprint, exact IDs, unique selections, allowed
  decisions, notes and Keep/Highlight/ready flags against the original snapshot.
  Use selections for decisions/notes and the saved research for event facts.
  Investigate factual edits in notes before applying them.
- If the user reports selections but the connected tab shows everything
  pending, investigate the exact tab, URL, origin and browser/profile. Do not
  treat that empty state as a completed rejection or recreate the picker.
  If the correct browser is inaccessible, recover the user's export instead.
- Apply only Keep/Highlight items, preserving explicit highlights; leave pending
  items and unresolved holds untouched. Recheck duplicates immediately before
  insertion. Use surgical event-block edits, preserving existing formatting.
- File each event under the year of its `date`, including historical context
  entries. Sort each year by `(date, id)`; sync year/index counts, ranges and
  coverage descriptions. Record candidate-to-canonical IDs, exclusions and
  remaining holds, and mark the reviewed research queues applied.

### 6. Validate the whole timeline

- Check all year files: JSON parsing, required fields, unique IDs, counts,
  source provenance, Boolean flags, `(date, id)` order and correct year placement.
  Check index counts/total and exact application of every reviewed choice.
- Compare event contents before/after: existing records, dates, sources and
  highlight flags must remain intact unless a change was authorized. Ordering
  and year-placement checks must cover the entire dataset, not just additions.
- The display defaults to **newest first**, as the user requested. Keep the
  Oldest/Newest toggle and deterministic same-date ordering; do not change the
  default merely because the user says "chronological".
- Build fresh output with `npm run build`, serve `out/` on a free retained local
  port, and verify the actual rendered site in real Chrome. Check additions,
  highlights, year/category filters, search, source links and sort directions.
  For ordering changes, scroll through every lazy-loaded event in both
  directions and compare the full sequence with canonical dates/IDs; checking
  only the first visible batch is insufficient. Check runtime errors and mobile
  overflow; distinguish a missing local analytics endpoint from an app error.
- Report applied/excluded/highlight counts, the current total, validation results
  and unresolved limitations. Preserve verification evidence and final choices.

### 7. Finish and clean up when requested

- Commit/push only on explicit request, following the Git rules above. Inspect
  the final diff and stage only intended source/data/instruction files; exclude
  generated files and completed temporary picker pages unless requested.
- After review is applied and the user asks to finish/clean up, remove only
  task-owned temporary scripts, payloads, public picker HTML and generated
  copies. Stop task-owned preview servers and close only task-owned tabs.
  Preserve shared Chrome, unrelated tabs/processes and the user's files.
- Keep authoritative snapshots, final selections, original source captures and
  application/validation reports locally in ignored `research/`; cleanup must
  not destroy the audit trail. Update `research/STATE.md` so future research can
  resume and know which reviews are closed and which holds remain unresolved.
- After a requested push, verify the remote branch matches the local commit
  and confirm the working tree is clean. Never force-push as routine cleanup.
