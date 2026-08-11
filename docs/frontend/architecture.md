# Frontend Architecture

How the UI is structured, how data reaches the browser, and which pieces are server vs client.

---

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│                                                              │
│  Public /          Admin /admin/*                            │
│  ┌──────────┐      ┌──────────────────────────────────────┐ │
│  │ Header   │      │ Admin layout (zinc dark, Sonner)     │ │
│  │ Hero     │      │ ShowsTable / ShowForm / FeaturedCard │ │
│  │ Upcoming │      └───────────────┬──────────────────────┘ │
│  │ Shows    │                      │ Server Actions         │
│  │ Music    │                      │ + /api/admin/upload    │
│  │ Footer   │                      ▼                        │
│  └────┬─────┘              middleware JWT gate              │
└───────┼────────────────────────────────────────────────────┘
        │
        ▼
  page.tsx (RSC, sync — no awaits)
    Suspense boundaries per section
        │
        ▼
  Each section = async RSC — fetches from Next.js Data Cache
    getPublicShows()   (unstable_cache, tag: 'shows')
    getPublicAlbums()  (unstable_cache, tag: 'albums')
        │
        ▼
  Neon Postgres (Prisma)
  revalidateTag called on every CMS mutation → cache invalidated
```

---

## Server vs client

### Pattern used on the public site

1. **Async RSC sections** fetch their own data from the Next.js Data Cache.
2. **Suspense boundaries** wrap each DB-dependent section so the static shell (Hero, Header) streams first.
3. **Client islands** are the minimum slice that genuinely needs browser APIs or state.

```tsx
// src/app/page.tsx — sync RSC, no data fetching
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Suspense fallback={null}><StructuredData /></Suspense>
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<section className="py-20 bg-black" />}>
          <UpcomingShow />     {/* async RSC, self-fetching */}
        </Suspense>
        <Suspense fallback={<section className="py-24 bg-white" />}>
          <Shows />            {/* async RSC, self-fetching */}
        </Suspense>
        <Suspense fallback={<section className="py-24 bg-black" />}>
          <Music />            {/* async RSC, self-fetching */}
        </Suspense>
      </main>
    </>
  );
}
```

`PublicShow.date` is a **string** (`YYYY-MM-DD`), not a `Date`, so it survives the RSC → client boundary cleanly.

### What is `"use client"`

| Area | Client? | Why |
|---|---|---|
| `MobileNav` | Yes | Hamburger state, focus trap, scroll close |
| `HeroMedia` | Yes | `videoReady` state, dynamic VideoBackground |
| `HeroScrollArrow` | Yes | `scrollY` state for arrow fade |
| `VideoBackground` | Yes | Vimeo player; loaded with `dynamic(..., { ssr: false })` |
| `YearNav` | Yes | `scrollToAlbum` via `window.scrollTo` |
| `Header` | **No** | RSC shell; passes static nav+logo to MobileNav |
| `Hero` | **No** | RSC shell; includes HeroMedia + HeroScrollArrow islands |
| `UpcomingShow` | **No** | Async RSC, self-fetching; CSS hover for button |
| `Shows` | **No** | Async RSC, self-fetching |
| `ShowCard` | **No** | RSC; `.btn-ticket` CSS class replaces JS hover |
| `AlbumCard` | **No** | RSC; supports blur placeholder prop |
| `Music` | **No** | Async RSC, self-fetching; `YearNav` handles scroll |
| `SkipLinks` | **No** | Static HTML only |
| `StructuredData` | **No** | Async RSC, self-fetching |
| `Footer` | **No** | Static markup |
| Admin forms/table/dialog | Yes | Forms, optimistic UI, uploads |
| Admin pages | Mostly Server | Fetch data, pass into client children |

### Admin nested layout quirk

`src/app/admin/layout.tsx` renders its **own** `<html>` and `<body>` in addition to the root layout. Treat the admin chrome as a semi-isolated shell (dark zinc theme, Hebrew RTL, Sonner toaster). Do not assume root `globals.css` brand utilities dominate admin styling — admin mostly uses Tailwind zinc/orange utility classes.

---

## App Router roles

| Path | Responsibility |
|---|---|
| `src/app/layout.tsx` | Global metadata, `lang`/`dir`, import `globals.css` |
| `src/app/page.tsx` | Compose public sections with Suspense; ISR `revalidate = 60` |
| `src/app/loading.tsx` | Full-page skeleton (solid black) while page shell builds |
| `src/app/admin/*` | CMS UI |
| `src/app/api/admin/upload` | Issue Blob client upload tokens (auth required) |
| `src/middleware.ts` | Protect `/admin/*` except `/admin/login` |

---

## Component layers

```
components/
  layout/     → site chrome (Header [RSC], Footer [RSC], MobileNav [client])
  sections/   → homepage blocks; all RSC, all self-fetching
  ui/         → reusable pieces; RSC unless noted
  seo/        → structured data (async RSC, self-fetching)
  index.ts    → public barrel (prefer for homepage imports)
```

**Import preference for the public site:**

```tsx
// Preferred
import { Header, Footer, Hero, Shows, Music } from "@/components";

// Fine for one-offs / admin / deep imports
import ShowForm from "@/app/admin/shows/ShowForm";
import SkipLinks from "@/components/ui/SkipLinks";
```

Admin components under `src/app/admin/shows/` are **route-colocated** (not in `components/`). Keep CMS-specific UI there unless it becomes reusable on the public site.

---

## Data flow

### Shows (live)

```
Prisma Show model
  → queries.ts (unstable_cache wrappers for public; uncached for admin)
  → async RSC sections (UpcomingShow, Shows) or admin pages
  → mutations via actions.ts (create/update/delete/toggle/feature)
  → revalidateTag("shows") + revalidatePath("/") + revalidatePath("/admin/shows")
```

### Albums (live)

```
Prisma Album model
  → queries.ts (unstable_cache wrapper for public; uncached for admin)
  → async RSC section (Music) or admin pages
  → mutations via actions.ts (create/update/delete/toggle)
  → revalidateTag("albums") + revalidatePath("/") + revalidatePath("/admin/albums")
```

### Legacy (static — avoid for new work)

| File | Status |
|---|---|
| `src/data/shows.ts` | Static leftover; seed/history only |
| `src/hooks/useShows.ts` | Client hook over static shows — **not** used by homepage |
| `src/types/index.ts` `Show` | Legacy `id: number` shape — use `PublicShow` for live UI |
| `src/lib/shows.ts`, `src/lib/dates.ts` | Helpers for legacy static path |
| `src/data/music.ts` | Legacy static albums used **only** by `StructuredData` fallback; live music uses DB |

---

## Caching / rendering

- **Homepage ISR**: `export const revalidate = 60` in `page.tsx`.
- **Data Cache**: `getPublicShows` and `getPublicAlbums` are wrapped in `unstable_cache` with `tags: ['shows']` / `tags: ['albums']`.
- **Tag invalidation**: every CMS mutation calls `revalidateTag()` — the cache entry is purged immediately, not on the next 60-second tick.
- **Admin pages**: always fresh (`unstable_cache` not used for admin queries; cache is irrelevant since admin is always behind auth and not CDN-cached).
- **Streaming**: each section is in its own `<Suspense>` boundary. On a cold ISR revalidation, Hero + nav stream first while the DB sections resolve from the (fast) Data Cache.

---

## Image pipeline

All cover images go through a **client-side optimize** step before upload:

```
src/lib/images/client-optimize.ts
  optimizeCoverImage(file, role) → { file (WebP), width, height, blurDataURL }
```

Roles: `show-cover` (max 1600px, quality 0.82) · `album-cover` (max 1200px, quality 0.82).

The LQIP blur placeholder (24 px thumbnail → JPEG base64) is generated in the same Canvas pass and stored in `coverBlurDataURL` on the DB row. Next.js renders it as `placeholder="blur"` on album cards.

Upload route (`/api/admin/upload`) now accepts **WebP only** — the browser must convert before posting.

On cover replace/clear: `updateShow`/`updateAlbum` delete the old Blob URL automatically.

---

## SEO surface

| Piece | Location |
|---|---|
| Default metadata / OG / Twitter | `src/app/layout.tsx` |
| JSON-LD (MusicGroup, events, albums) | `src/components/seo/StructuredData.tsx` (async RSC) |
| Sitemap | `src/app/sitemap.ts` |
| Robots | `src/app/robots.ts` — disallows `/admin` |
| Admin noindex | `src/app/admin/layout.tsx` metadata |

Homepage passes **future** shows into `StructuredData` for MusicEvent entries.

---

## Auth (frontend view)

Full details: [`docs/cms/README.md`](../cms/README.md#authentication).

Short version:

1. Login form posts to `loginAction` (server action).
2. JWT set in httpOnly cookie `admin_session`.
3. `middleware.ts` verifies JWT on `/admin/:path*` (login exempt).
4. Server actions and upload route also call `isAuthenticated()`.

---

## Styling architecture

- **Tailwind v4** via `@import "tailwindcss"` in `globals.css` (no classic `tailwind.config.js`).
- Brand tokens as CSS variables on `:root`.
- Utility classes: `.container-custom`, `.noise-overlay`, `.grunge-overlay`, video helpers, reduced-motion overrides.
- **`.btn-ticket` / `.btn-featured`**: CSS-only hover transforms added to `globals.css` so `ShowCard` and `UpcomingShow` can be RSC without JS mouse handlers.
- Public site leans on CSS variables + custom section CSS.
- Admin leans on Tailwind zinc palette + `orange-500` accents.
- shadcn configured in `components.json` (style: new-york, CSS variables, lucide icons).

See [design-system.md](./design-system.md).

---

## TypeScript

- Strict mode enabled.
- Alias `@/*` → `src/*`.
- Prisma types from `@/generated/prisma/client` (must run `prisma generate` after clone).
- Next 15 dynamic routes: `params` is a **Promise** (see edit page: `await params`).

---

## Testing

No frontend test suite is set up yet (no Jest/Vitest/Playwright in `package.json`). Validate changes manually:

- Public: `/` mobile + desktop, RTL, reduced motion, featured/empty states
- Admin: login, create/edit/delete, feature, hide, image upload
