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
  page.tsx (RSC)
    getPublicShows() + getPublicFeaturedShow()
        │
        ▼
  Neon Postgres (Prisma)     Static: data/music.ts, data/social.ts
```

---

## Server vs client

### Pattern used on the public site

1. **Server Component page** fetches serializable data.
2. Passes plain props into **client section islands** that need interactivity (scroll, video, menus).

```tsx
// src/app/page.tsx — Server Component
export const dynamic = "force-dynamic";

export default async function Home() {
  const [shows, featured] = await Promise.all([
    getPublicShows(),
    getPublicFeaturedShow(),
  ]);
  // ...
  <UpcomingShow featured={featured} />
  <Shows shows={shows} />
}
```

`PublicShow.date` is a **string** (`YYYY-MM-DD`), not a `Date`, so it survives the RSC → client boundary cleanly.

### What is `"use client"`

| Area | Client? | Why |
|---|---|---|
| `Header` | Yes | Mobile menu, focus trap, scroll close |
| `Hero` | Yes | Scroll parallax, video ready state |
| `VideoBackground` | Yes | Vimeo player; loaded with `dynamic(..., { ssr: false })` |
| `UpcomingShow`, `Shows`, `Music` | Yes | Interaction / motion / year scrolling |
| `ShowCard`, `AlbumCard`, `Logo` | Often via parent | Mostly presentational |
| `Footer` | No | Static markup |
| `Contact` | No | But currently unused on homepage |
| `StructuredData` | No | JSON-LD script |
| Admin forms/table/dialog | Yes | Forms, optimistic UI, uploads |
| Admin pages | Mostly Server | Fetch data, pass into client children |

### Admin nested layout quirk

`src/app/admin/layout.tsx` renders its **own** `<html>` and `<body>` in addition to the root layout. Treat the admin chrome as a semi-isolated shell (dark zinc theme, Hebrew RTL, Sonner toaster). Do not assume root `globals.css` brand utilities dominate admin styling — admin mostly uses Tailwind zinc/orange utility classes.

---

## App Router roles

| Path | Responsibility |
|---|---|
| `src/app/layout.tsx` | Global metadata, `lang`/`dir`, import `globals.css` |
| `src/app/page.tsx` | Compose public sections; fetch shows |
| `src/app/admin/*` | CMS UI |
| `src/app/api/admin/upload` | Issue Blob client upload tokens (auth required) |
| `src/middleware.ts` | Protect `/admin/*` except `/admin/login` |

---

## Component layers

```
components/
  layout/     → site chrome (Header, Footer)
  sections/   → homepage blocks (one job each)
  ui/         → reusable pieces (cards, logo, shadcn)
  seo/        → structured data
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
  → queries.ts (getPublicShows / getPublicFeaturedShow / getAllShows / …)
  → page.tsx or admin pages
  → sections / table / form
  → mutations via actions.ts (create/update/delete/toggle/feature)
  → revalidatePath("/") + revalidatePath("/admin/shows")
```

### Music & social (static)

```
src/data/music.ts  → Music section, StructuredData, sitemap album anchors
src/data/social.ts → Hero social icons, SocialLinks (Contact), StructuredData
```

### Legacy (avoid for new work)

| File | Status |
|---|---|
| `src/data/shows.ts` | Static leftover; seed/history only |
| `src/hooks/useShows.ts` | Client hook over static shows — **not** used by homepage |
| `src/types/index.ts` `Show` | Legacy `id: number` shape — use `PublicShow` for live UI |
| `src/lib/shows.ts`, `src/lib/dates.ts` | Helpers for legacy static path |

---

## Caching / rendering

- Homepage: `export const dynamic = "force-dynamic"` — always fresh shows from DB.
- Admin shows pages: also force-dynamic.
- After mutations, actions call `revalidatePath` for `/` and `/admin/shows`.

---

## SEO surface

| Piece | Location |
|---|---|
| Default metadata / OG / Twitter | `src/app/layout.tsx` |
| JSON-LD (MusicGroup, events, albums) | `src/components/seo/StructuredData.tsx` |
| Sitemap | `src/app/sitemap.ts` |
| Robots | `src/app/robots.ts` |
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
