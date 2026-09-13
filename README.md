# Epoch — AI history explorer

A static Next.js site for exploring the modern history of artificial intelligence from 2017 to 2026.

## Structure

- `app/` — page shell, metadata, and global visual system
- `components/` — the interactive timeline explorer
- `data/years/` — the canonical year-by-year event archive
- `data/important_events.json` — curated highlights
- `data/sources.json` — supplementary source index
- `archive/legacy/` — previous generated HTML timelines
- `research/` — research notes and source-verification tooling

## Run locally

```bash
npm install
npm run dev
```

The production build is a fully static export in `out/`.
