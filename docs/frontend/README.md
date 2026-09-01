# Shazamat Frontend — Agent Entry Point

This is the single source of truth for the **public website and admin UI**. Read this first before editing anything under `src/app`, `src/components`, `src/data`, or `src/app/globals.css`.

For CMS/data/auth/uploads (Prisma, server actions, Blob, JWT), also read [`docs/cms/README.md`](../cms/README.md).

---

## Table of Contents

1. [What this app is](#what-this-app-is)
2. [Stack](#stack)
3. [15-minute orientation](#15-minute-orientation)
4. [Doc map](#doc-map)
5. [Directory map](#directory-map)
6. [Route map](#route-map)
7. [Data: what is live vs static](#data-what-is-live-vs-static)
8. [Environment variables](#environment-variables)
9. [Local setup](#local-setup)
10. [Where to start for common tasks](#where-to-start-for-common-tasks)
11. [Related docs (outdated)](#related-docs-outdated)

---

## What this app is

**Shazamat** (שאזאמאט) is the official website for an Israeli hip-hop band.

| Surface | Audience | Purpose |
|---|---|---|
| `/` | Public | Hebrew RTL marketing site: hero, featured show, shows list, music |
| `/life` | Public | Shazamat Life Simulator game — see [`docs/game/README.md`](../game/README.md) |
| `/admin/*` | Band manager | CMS for shows (CRUD, feature, hide, cover upload) |

There is **one homepage**. Sections are composed in `src/app/page.tsx`. Shows come from Postgres; albums and social links are still static TypeScript files.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **15.5** App Router |
| UI | React **19** |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS **v4** + brand CSS variables in `globals.css` |
| Components | Mix of custom brand UI + shadcn/ui (new-york). Many shadcn primitives are installed but unused |
| Forms (admin) | `react-hook-form` + Zod |
| Toasts (admin) | `sonner` |
| DB | Prisma 7 + Neon Postgres (via `@prisma/adapter-pg`) |
| Images | `next/image` + Vercel Blob for show covers |
| Auth | JWT cookie (`jose`) gated by `src/middleware.ts` |
| Locale | Hebrew (`lang="he"`), RTL (`dir="rtl"`) |

Path alias: `@/*` → `./src/*` (see `tsconfig.json`).

---

## 15-minute orientation

Read these files in order:

1. [`src/app/layout.tsx`](../../src/app/layout.tsx) — root HTML, metadata, RTL
2. [`src/app/page.tsx`](../../src/app/page.tsx) — homepage composition + data fetch
3. [`src/app/globals.css`](../../src/app/globals.css) — fonts, brand tokens, utilities
4. [`design.json`](../../design.json) — brand blueprint (not always matching CSS — see [design-system.md](./design-system.md))
5. [`src/lib/shows/queries.ts`](../../src/lib/shows/queries.ts) — `PublicShow` type and public queries
6. [`src/components/sections/`](../../src/components/sections/) — Hero, UpcomingShow, Shows, Music
7. [`src/app/admin/shows/`](../../src/app/admin/shows/) — admin UI for shows

Then skim [gotchas](./conventions-and-gotchas.md#gotchas).

---

## Doc map

| Doc | Use when |
|---|---|
| [architecture.md](./architecture.md) | Understanding RSC vs client, data flow, folder roles |
| [design-system.md](./design-system.md) | Colors, fonts, spacing, brand rules, CSS utilities |
| [components.md](./components.md) | Finding / adding components; inventory of used vs unused |
| [public-site.md](./public-site.md) | Editing the homepage experience |
| [admin-ui.md](./admin-ui.md) | Editing admin pages/forms (UI layer only) |
| [conventions-and-gotchas.md](./conventions-and-gotchas.md) | Patterns to follow + traps that waste time |
| [`docs/cms/README.md`](../cms/README.md) | Server actions, auth, Prisma, Blob uploads |

---

## Directory map

```
src/
├── app/
│   ├── layout.tsx              # Root layout (lang=he, dir=rtl, SEO metadata)
│   ├── page.tsx                # Public homepage (RSC, force-dynamic)
│   ├── globals.css             # Tailwind v4 + brand tokens + utilities
│   ├── favicon.ico
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── admin/                  # CMS UI (see docs/cms + admin-ui.md)
│   └── api/admin/upload/       # Blob upload token endpoint
│
├── components/
│   ├── layout/                 # Header, Footer
│   ├── sections/               # Hero, UpcomingShow, Shows, Music, Contact
│   ├── ui/                     # Brand UI + shadcn primitives
│   ├── seo/StructuredData.tsx
│   └── index.ts                # Barrel exports for public site
│
├── data/                       # Static content (music, social; shows.ts is LEGACY)
├── types/                      # Legacy/shared TS interfaces (Album, SocialPlatform, …)
├── hooks/                      # useShows.ts — LEGACY (static shows only)
├── lib/
│   ├── shows/                  # queries, actions, schemas (CMS + public)
│   ├── auth.ts, prisma.ts, blob.ts, hebrew.ts, dates.ts, utils.ts
│   └── shows.ts                # LEGACY helpers for static shows
│
└── generated/prisma/           # Prisma client output (gitignored — run prisma generate)

public/
├── fonts/                      # Emulsi (+ unused MandatoryVariable.ttf)
├── images/                     # hero-image.webp, barby-july.png
├── albums/                     # Album cover art
├── icons/                      # Social + streaming icons
└── shazamat-assets/            # Logos (wordmark, shin icon, variants)

design.json                     # Brand design blueprint
components.json                 # shadcn config
```

---

## Route map

| Route | File | Role |
|---|---|---|
| `/` | `src/app/page.tsx` | Public homepage |
| `/admin` | `src/app/admin/page.tsx` | Redirect → login or `/admin/shows` |
| `/admin/login` | `src/app/admin/login/page.tsx` | Login |
| `/admin/shows` | `src/app/admin/shows/page.tsx` | Shows list + create dialog |
| `/admin/shows/new` | `src/app/admin/shows/new/page.tsx` | Full-page create (also covered by dialog) |
| `/admin/shows/[id]/edit` | `src/app/admin/shows/[id]/edit/page.tsx` | Edit show |
| `/admin/albums` | `src/app/admin/albums/page.tsx` | Albums list + create dialog |
| `/admin/albums/[id]/edit` | `src/app/admin/albums/[id]/edit/page.tsx` | Edit album |
| `/api/admin/upload` | `src/app/api/admin/upload/route.ts` | Vercel Blob client upload |
| `/life` | `src/app/life/page.tsx` | Game — see [`docs/game/README.md`](../game/README.md) |
| `/life/r/[runId]` | `src/app/life/r/[runId]/page.tsx` | Game share landing |
| `/sitemap.xml` | `src/app/sitemap.ts` | Sitemap |
| `/robots.txt` | `src/app/robots.ts` | Robots |

---

## Data: what is live vs static

| Content | Source of truth | Edit how |
|---|---|---|
| Shows (public + admin) | **Postgres via Prisma** | Admin CMS (`/admin/shows`), or `src/lib/shows/*` |
| Featured show | DB (`isFeatured`) | Admin FeaturedCard / table toggle |
| Albums / music | **Postgres via Prisma** | Admin CMS (`/admin/albums`), or `src/lib/albums/*` |
| Social links | **`src/data/social.ts`** | Edit the file |
| Hero video | Hardcoded Vimeo id in `VideoBackground` | Edit component |
| Logos | `public/shazamat-assets/` | Replace assets; `Logo.tsx` maps variants |

**Do not** add new public shows to `src/data/shows.ts` — that file is legacy. The live homepage uses `getPublicShows()` / `getPublicFeaturedShow()`.

**Do not** edit `src/data/music.ts` for album changes — that file is now legacy. The live homepage uses `getPublicAlbums()`. To add or edit albums, use the admin CMS at `/admin/albums`.

Canonical public type:

```ts
// src/lib/shows/queries.ts
export type PublicShow = {
  id: string;
  date: string; // YYYY-MM-DD — safe across RSC → client
  city: string;
  venue: string;
  ticketLink: string | null;
  doorsTime: string | null;
  coverImage: string | null;
  isFeatured: boolean;
  isPast: boolean;
};
```

---

## Environment variables

Frontend-relevant (full list in `.env.example`):

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Metadata, sitemap, robots, structured data (default `https://shazamat.com`) |
| `DATABASE_URL` | Homepage + admin + sitemap (shows queries) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `/admin/login` |
| `ADMIN_SESSION_SECRET` | JWT session |
| `BLOB_READ_WRITE_TOKEN` | Cover image upload/delete |

Copy `.env.example` → `.env` / `.env.local`. Never commit secrets.

---

## Local setup

```bash
npm install
# ensure DATABASE_URL and admin/blob vars are set
npx prisma generate
npx prisma migrate deploy   # or npm run db:migrate in dev
npm run db:seed             # optional
npm run dev                 # http://localhost:3000
```

Admin: `http://localhost:3000/admin/login`

---

## Where to start for common tasks

| Task | Start here |
|---|---|
| Change homepage section order / visibility | `src/app/page.tsx` |
| Edit hero (video, logo, socials) | `src/components/sections/Hero.tsx` |
| Edit featured show UI | `src/components/sections/UpcomingShow.tsx` |
| Edit shows list / cards | `Shows.tsx` + `ShowCard.tsx` |
| Add/edit album | Admin CMS `/admin/albums` (or `src/lib/albums/*` for data layer) |
| Change social URLs | `src/data/social.ts` |
| Brand colors / fonts / motion | `src/app/globals.css` (+ check `design.json`) |
| Nav links | `src/components/layout/nav.ts` (shared config) → consumed by `Header.tsx`, `MobileNav.tsx`, `Footer.tsx` |
| SEO / OG | `src/app/layout.tsx`, `components/seo/StructuredData.tsx` |
| Admin form fields | `ShowForm.tsx` + `src/lib/shows/schemas.ts` |
| Admin table actions | `ShowsTable.tsx` + `src/lib/shows/actions.ts` |
| New UI primitive | Prefer existing brand patterns; shadcn via `components.json` if needed |

---

## Related docs (outdated)

These still exist but describe an **older** architecture (hardcoded shows, missing admin/CMS). Prefer **this folder** + `docs/cms`:

- `src/README.md`
- `src/components/README.md`
- `REFACTORING_SUMMARY.md`
- Root `README.md` (still create-next-app boilerplate)

If you update frontend behavior, update **`docs/frontend/`** — not those legacy files — unless you are intentionally refreshing them.
