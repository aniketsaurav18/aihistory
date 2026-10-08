# Picker contract and helpers

Use Python 3 for generation. Browser capture needs Node 20+ and Playwright; use the installed Playwright skill runner to resolve that dependency. Resolve paths from the installed skill directories rather than assuming a particular user's home.

## Candidate snapshot

The generator accepts a candidate array, or an object with `items`, `candidates`, or `readyCandidates`. Optional metadata: `checkedOn` (actual research date) and `canonicalEvents` (existing dataset count).

Each item requires a stable unique string `id`, `title`, and `details` or `summary`. Dates are `YYYY-MM-DD`; an undated item requires `held: true` and a `holdReason`. Category defaults to `uncategorized`. Optional fields include `significance`, `sources[]`, and `context[]`; other record fields are preserved in the export. Sources are objects with an HTTP(S) `url`, and may retain labels, titles and verification provenance. Context entries may include `title`, `details`, and `sources[]`.

An audit object with `readyCandidates` and `dateHolds` is also supported: each hold needs `id`, `title`, `reason`, and optionally `source` or `sources`. Global `supportingContext` entries attach to candidates through `candidateId`. The helper normalizes data for display; it does not independently verify or deduplicate it.

```json
{
  "checkedOn": "2026-10-08",
  "items": [
    {
      "id": "2026-10-07-example-release",
      "date": "2026-10-07",
      "title": "Example model release",
      "category": "model-release",
      "summary": "Announcement details with accurate availability.",
      "sources": [{"url": "https://example.org/announcement", "verified": false}]
    }
  ]
}
```

Generate with the installed skill path:

```bash
python .agents/skills/data-hand-picking/scripts/generate_review.py \
  --input research/candidates.json \
  --output public/candidate-review.html \
  --title 'Research review' --app-label 'AI History'
```

The helper refuses to overwrite an existing picker. It validates IDs, descriptions, dates, hold flags and source URL schemes, then embeds escaped JSON. Its dataset fingerprint binds choices to the reviewed facts. Save the input snapshot alongside your research; browser export is not a substitute for authoritative source evidence.

## Capture choices from real Chrome

Start/attach Chrome according to the available real-browser skill; preserve user tabs. The reader does not navigate, close tabs, or modify choices:

```bash
node <playwright-skill-dir>/run.js .agents/skills/data-hand-picking/scripts/read_review.js \
  --url http://127.0.0.1:8765/candidate-review.html \
  --output research/review-selections.json
```

Use the exact current picker URL. If multiple matching tabs exist, identify the intended tab rather than guessing. If Chrome is unavailable, use the user's export instead; do not recreate a fresh profile and treat its empty state as their selections.

## Selection semantics

Export has `version: 1`, `datasetId`, research/export timestamps, and `selections[]`. Each selection retains the candidate fields plus:

| decision | keep | highlight | readyToInsert |
| --- | --- | --- | --- |
| pending | null | false | false |
| keep | true | false | true only without a hold |
| highlight | true | true | true only without a hold |
| delete | false | false | false |

`notes` is the user's text. Reconcile the fingerprint and IDs with the generated picker and saved input. Unknown or duplicated IDs, invalid choices, mismatched datasets or unsupported factual changes need resolution before applying dependent mutations. A partial review is valid: apply only authorized reviewed choices, leaving pending ones untouched.

## AI History repository conventions

When working in AI History, read its current `AGENTS.md`, `lib/types.ts`, and `research/verification/SKILL.md`; do not freeze counts or dates from a prior session. Canonical events live in `data/years/*.json`, indexed by `data/index.json`. Maintain summary/significance, organizations, tags, source verification fields and counts. Do not serialize entire canonical files; preserve their original formatting and source tier. Respect the user's chosen Highlights rather than auto-highlighting editorial priorities.

For app verification, this repository exports static Next.js output. Build the current data with `npm run build`, then serve `out/` on a free local port and exercise the real rendered site. Read the installed Next.js documentation before any application code change. A local static server does not provide Vercel Analytics' endpoint; distinguish that missing request from application runtime errors. Keep the server alive long enough for the user to review it.
