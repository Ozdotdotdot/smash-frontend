# Smash Watch (smash.watch) — Frontend

This repo is the Next.js/TypeScript frontend for **Smash Watch**, a data-visualization UI powered by the **smashDA analytics engine** (the backend does the querying + computation; this app focuses on UX and interactive charts).

## What it does (in ~30 seconds)

- Turns precomputed competitive Smash data into an interactive **scatter plot** (Weighted Win Rate vs Opponent Strength) plus a sortable table.
- Supports **state** views and **tournament/series** views (including discovery + selection when multiple series match).
- Adds “product-y” usability for analytics: filters, outlier handling, helpful tooltips, loading/error states, and docs links.

## Architecture (frontend’s role)

- **Next.js App Router UI** under `app/` (landing page, dashboard, “how it works”, docs links).
- **API proxy routes** under `app/api/*/route.ts` that forward requests to the smashDA service (avoids browser CORS + keeps the client API stable).
- **Visualization layer** built around `recharts` + custom UI components.

## Tech

Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts, shadcn/ui-style components, ESLint.

## What I learned / practiced 

- Designing UX for “messy” real-world analytics (filters, defaults, edge cases, progressive disclosure).
- Building reliable client ↔ API boundaries (proxy routes, query param plumbing, error handling).
- Implementing interactive data viz (tooltips, outlier toggles, responsive charts) that stays readable.
- Shipping a polished UI in a modern React stack (App Router, typed components, Tailwind composition).

## Run locally

```bash
npm install
npm run dev
```

If you prefer `pnpm`, this repo also includes `pnpm-lock.yaml`.

Note: the API routes currently proxy to a hosted backend (see `app/api/precomputed/route.ts:3`). To use your own backend, change the `REMOTE_BASE` constants in `app/api/**/route.ts`.

## Docs / deeper dive

- System overview: `how_it_works.md`
- [https://docs.smash.watch](https://docs.smash.watch)
