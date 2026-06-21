# KJV Bible Reader — Technical Overview

A fully static, offline-capable KJV Bible reader. No backend. No server functions. The entire Bible is downloaded once to the browser and queried locally via SQLite-in-the-browser (sql.js). After the first visit it works without a network connection.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, Turbopack |
| Language | TypeScript (strict) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (no tailwind.config.js — uses `@import "tailwindcss"`) |
| DB (client) | sql.js (SQLite compiled to WebAssembly) |
| Icons | lucide-react |
| Hosting | Vercel (fully static export — no server needed) |

---

## How the data works

- `database/KJV.db` — SQLite file (~4.5 MB). Tables: `KJV_books(id, name)`, `KJV_verses(id, book_id, chapter, verse, text)`.
- `database/book_summaries.csv` and `database/section_summaries.csv` — pre-written summaries keyed by book name.
- At build time, `scripts/prepare-data.mjs` runs automatically (wired into `npm run build`). It:
  - Copies `KJV.db` → `public/database/KJV.db`
  - Copies `sql-wasm.wasm` → `public/sql/sql-wasm.wasm`
  - Normalises book name variants in the CSVs to match exact `KJV_books.name` values (e.g. `"1 Samuel"` → `"I Samuel"`)
  - Converts both CSVs → `public/data/book_summaries.json` and `public/data/section_summaries.json`

On first page visit, `src/lib/bibleDb.ts` fetches `KJV.db`, caches the raw bytes in **IndexedDB**, and opens it with sql.js. Subsequent visits skip the download entirely and read straight from IndexedDB. A loading banner is shown only during that one-time download.

---

## Architecture

### Static export
`next.config.ts` has `output: "export"`. The build produces a fully static `out/` folder — 66 pre-rendered HTML pages (one per book) plus the root index. Deployed to Vercel as a static site with zero server-side runtime.

### Server / client component split
- `page.tsx` files are **always Server Components** — no `"use client"`.
- All interactivity (DB queries, localStorage, scroll events) lives in dedicated client components under `src/components/`.
- `BookShell` is the client boundary on the book page — it owns the DB state and composes all child client components.

### Key source files

```
src/
  types.ts                  — shared types (Verse, ChaptersMap, SectionSummary, RecentRef)
  lib/
    books.ts                — canonical 66-book order + slug helpers (bookToSlug / slugToBook)
    bookMeta.ts             — static author / location / date metadata for all 66 books
    bibleDb.ts              — sql.js init, IndexedDB cache, queryChapters()
    recents.ts              — localStorage read/write for recent chapter history
  app/
    page.tsx                — home: Old/New Testament two-column book list (Server Component)
    books/[slug]/page.tsx   — book page shell with generateStaticParams over all 66 books
  components/
    BookShell.tsx           — client boundary; owns DB state, composes book page
    BookReader.tsx          — renders all chapters + verses; scroll-spy; hash-anchor scroll
    ChapterRail.tsx         — sticky right sidebar with chapter number buttons
    SectionCard.tsx         — collapsible section summary card shown before each section
    RecentSidebar.tsx       — sticky left sidebar; reads localStorage; updates via CustomEvent
    BookHeader.tsx          — back nav + book title + theme toggle
    DbLoadingBanner.tsx     — banner shown only during first-time DB download
    ThemeToggle.tsx         — light/dark toggle; persists to localStorage
```

### Recent chapters
Stored in `localStorage` as `RecentRef[]` (`{ book, chapter, verse? }`). Written only on explicit user actions:
- **Chapter rail click** → saves `{ book, chapter }`
- **Verse click** → overwrites same entry with `{ book, chapter, verse }`

`RecentSidebar` updates instantly via a `CustomEvent("recentsUpdated")` dispatched after every write (cross-tab sync via the native `storage` event).

### Dark mode
CSS custom properties (`--bg`, `--text`, `--accent`, etc.) defined in `globals.css` for both `:root` and `.dark`. Tailwind `dark:` variants use `@custom-variant dark (&:where(.dark, .dark *))`. The `ThemeToggle` component toggles the `dark` class on `<html>` and persists the choice to `localStorage`.

---

## Scaffold note
The project was scaffolded manually (`npm init -y` + manual installs) because the folder name contains spaces, which `create-next-app` rejects. If re-scaffolding, follow the same manual process.

---

## Deploy
Connect the GitHub repo to Vercel. Vercel auto-detects Next.js. The `output: "export"` config means it deploys as a static site — no serverless functions, no edge runtime needed.
