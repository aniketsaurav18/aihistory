---
name: data-hand-picking
description: Curate AI History timeline events in this repository by researching and verifying AI news, deduplicating against existing coverage, presenting an HTML Keep/Delete/Highlight picker, and applying the user's selections.
---

# Data hand picking

This skill belongs to the AI History repository. Canonical events live in `data/years/*.json`, with counts and coverage indexed by `data/index.json`. Produce a reviewable candidate list, let the user curate it in a browser, then apply their choices. Continue from the current stage: reuse research and saved selections already present rather than restarting.

## Research and deduplication

Read the project's dataset schema and local instructions. Compare against the entire existing dataset and all active research lists before presenting candidates. Match the underlying announced action, names, versions, dates, descriptions and source URLs. Related organizations or compatible APIs alone do not make events duplicates. Bundle co-announced sizes/variants and minor follow-ups when they belong to one event.

Use first-party sources and confirm title, headings, publication/date evidence, lead and relevant body. When real-browser verification is requested or needed, use the available real-browser/Playwright skills and the persistent Chrome profile. Record the method actually used; retain historical evidence without claiming fresh checks or upgrading verification tiers. Attribute vendor claims and distinguish previews, plans and completed releases. Keep uncertain dates on hold.

Save one authoritative candidate snapshot and a short reconciliation of existing coverage, merged repeats, distinct candidates and holds. Preserve original verification captures. Superseded reports should point to the current shortlist rather than remain additional recommendation queues.

## Build and show the picker

Use [references/review-format.md](references/review-format.md) for the input/output contract and helper usage. Generate a standalone HTML picker with `scripts/generate_review.py`; its template is `assets/review.html`. Embed the snapshot so the page works without data fetches or external assets. Keep the snapshot as the authoritative facts for later application.

The picker provides descriptions, source links, optional significance/context, search and category/decision filters, notes, local persistence, and JSON export/import. Start every item as **Unreviewed**. **Highlight** means keep with `highlight: true`; **Delete** excludes that candidate, not an existing canonical record. Date holds stay visible and cannot become ready to insert merely because the user chose Keep.

Serve on an available local port using a retained process, or use the project's existing server when appropriate. Open a new task-owned tab in the user's browser and give the user its link. Verify the controls, reload persistence, exported flags, hold handling and narrow-screen layout. Use an isolated test context so test selections never overwrite the user's choices. Do not regenerate a picker or change its origin/storage key after review has started without recovering the selections first.

## Read and apply the review

When the user finishes, retrieve their exported JSON or use `scripts/read_review.js` to read the exact existing Chrome tab. If they say “done” in an established flow that includes applying selections, capture the choices and continue without asking them to export a file unnecessarily. If the task is only to prepare a picker, do not infer authority to modify the canonical dataset.

Validate the dataset identity, IDs, allowed decisions and notes against the saved candidate snapshot. Trust the selection JSON for decisions and notes; use the original researched snapshot for dates, sources and other record facts. Apply requested factual edits only with appropriate supporting evidence. Keep pending items untouched. Preserve choices on held items and resolve the hold before insertion; elapsed time does not resolve it.

Translate kept candidates to complete records in the project's schema; preserve the user's explicit highlight selections. Use surgical edits when the repository requires formatting preservation. Recheck for duplicates at insertion time and sync counts, date ranges and coverage descriptions. Check JSON parsing, unique IDs, chronology, required fields, Boolean flags, source provenance and exact selection application. Ensure previously existing records remain intact unless the user selected changes to them.

Record which candidate became which canonical ID, exclusions and unresolved selections. Mark the research queue as applied so future research does not recommend the same records again. Build and run the application when required by the project or requested by the user; check additions, highlights and relevant controls in the browser. Report applied counts and real limitations. Commit, push or publish only when separately authorized.
