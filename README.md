# AI History

[AI History](https://aihistory.live) is a living, sourced timeline of modern artificial intelligence. It brings together the papers, model releases, products, companies, infrastructure, policy decisions, and industry shifts that have shaped the field since 2017.

The site is designed for fast exploration: events appear newest first, can be searched and filtered, and always show their context, significance, and supporting sources. It is a fully static Next.js site with no backend.

## Features

- 437 documented events spanning 2017–2026
- Newest-first timeline with continuous scrolling
- Full archive and curated Highlights views
- Search by people, laboratories, models, products, and ideas
- Category and year filters with contextual counts
- Visible “Why it matters” context and source links for every event
- Responsive layout for desktop and mobile
- Static output suitable for simple hosting

## Submit an event

AI History is a living archive. If an important event is missing, [create a GitHub issue](https://github.com/aniketsaurav18/aihistory/issues/new) with:

- The event date and a concise title
- A factual summary of what happened
- Why the event matters to the history of AI
- Links to reliable primary sources

Submissions are reviewed before they are added to the archive.

## Project structure

- `app/` — routes, metadata, and the global visual system
- `components/` — the shared header and interactive timeline explorer
- `data/years/` — the canonical year-by-year event archive
- Each yearly event has a `highlight` boolean that controls inclusion in the curated Highlights view
- `data/sources.json` — the supplementary source index
- `archive/legacy/` — earlier generated timeline artifacts
- `research/` — research notes and source-verification tooling

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To create the static production output:

```bash
npm run build
```

The exported site is written to `out/`.

## Data notes

Dates reflect the best available publication or announcement record. Some rolling launches span multiple surfaces or release stages; the archive favors the clearest public milestone. Supporting sources remain visible with each event so readers can follow the record beyond the summary.

## License

This project is available under the [MIT License](LICENSE).
