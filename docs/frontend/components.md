# Components Inventory

Quick map of every UI building block and whether it is live, legacy, or unused.

---

## Barrel exports (`src/components/index.ts`)

Exported for clean public imports:

| Export | File |
|---|---|
| `Header`, `Footer` | `layout/` |
| `Hero`, `UpcomingShow`, `Shows`, `Music`, `Contact` | `sections/` |
| `ShowCard`, `AlbumCard`, `NewsletterForm`, `SocialLinks`, `StreamingPlatforms` | `ui/` |

Not in the barrel (import by path): `SkipLinks`, `Logo`, `VideoBackground`, `HeroImageFallback`, `HeroMedia`, `HeroScrollArrow`, `MobileNav`, `YearNav`, `StructuredData`, all shadcn primitives, all admin colocated components.

---

## Layout

### `Header` — `components/layout/Header.tsx` (RSC)

- Fixed nav, black bar, logo `variant="icon"` — rendered server-side as static HTML.
- Links defined in `layout/nav.ts`: בית `#home`, הופעות `#shows`, מוזיקה `#music`, **מרץ׳** (external, new tab, external-link icon).
- Desktop nav and logo are pre-rendered on the server and passed as slots into `MobileNav`.
- All interactive mobile behavior lives in `MobileNav`.

### `MobileNav` — `components/layout/MobileNav.tsx` (`"use client"`)

- Receives `navSlot` (desktop nav markup) and `logoSlot` (logo markup) as React nodes.
- Manages hamburger state, Escape key, focus trap, click-outside, close-on-scroll.
- Active/hover → orange.

### `Footer` — `components/layout/Footer.tsx` (RSC)

- Black footer, 3 columns: brand blurb, quick links, email `mulu.records@gmail.com`
- Copyright year currently hardcoded `2024`

---

## Sections (homepage)

All public sections are **async RSCs** — they fetch their own data from the Next.js Data Cache. `page.tsx` wraps each in a `Suspense` boundary.

### `Hero` — `sections/Hero.tsx` (RSC shell)

- Full-viewport black hero, `id="home"`
- Static shell: large `Logo` wordmark as H1, social icon row from `socialPlatforms` (plain `<img>` tags).
- Scroll cue and video background are delegated to client islands.

### `HeroMedia` — `ui/HeroMedia.tsx` (`"use client"`)

- Manages `videoReady` state.
- Mobile: static `HeroImageFallback` (`/images/hero-image.webp`).
- Desktop: dynamic Vimeo `VideoBackground` (`ssr: false`), fades once ready.

### `HeroScrollArrow` — `ui/HeroScrollArrow.tsx` (`"use client"`)

- Shows scroll indicator arrow; fades out based on `scrollY` position.

### `UpcomingShow` — `sections/UpcomingShow.tsx` (async RSC)

- Calls `getPublicShows()` and derives `featured` internally.
- Returns `null` if no featured show.
- Grunge / orange energy treatment.
- Shows venue, city, date, doors, cover (with blur placeholder), ticket link.
- Ticket button hover handled by CSS class `.btn-featured` (no JS).

### `Shows` — `sections/Shows.tsx` (async RSC)

- Section `id="shows"`
- Calls `getPublicShows()` internally.
- Maps to `ShowCard` (past shows styled differently).

### `Music` — `sections/Music.tsx` (async RSC)

- Calls `getPublicAlbums()` from DB (not static data).
- Year timeline + album cards via `AlbumCard`.
- Blurred background behind each album: `blur(24px) saturate(1.4)`, `quality={35}`, container expanded `-60%` all sides.
- Streaming platform icon links use plain `<img>` tags (SVG icons — no `next/image` overhead).
- `YearNav` client island handles smooth scroll.
- Anchors `#music`, `#album-{id}`.

### `YearNav` — `ui/YearNav.tsx` (`"use client"`)

- Receives album list as props from `Music`.
- Renders year-filter pill row; `scrollIntoView` on click.

### `Contact` — `sections/Contact.tsx`

- Newsletter + `SocialLinks`
- **Not mounted** on homepage (`{/* <Contact /> */}` in `page.tsx`)
- Still referenced in sitemap / breadcrumb JSON-LD

---

## Brand / feature UI

| Component | Path | Used by | Notes |
|---|---|---|---|
| `ShowCard` | `ui/ShowCard.tsx` | Shows | RSC; Hebrew date via `lib/hebrew.ts`; ticket CTA; `.btn-ticket` CSS hover |
| `AlbumCard` | `ui/AlbumCard.tsx` | Music | RSC; `next/image` with `blurDataURL` from DB; `sizes` set for layout |
| `Logo` | `ui/Logo.tsx` | Header, Hero | `logo` \| `icon` variants |
| `SkipLinks` | `ui/SkipLinks.tsx` | Home | RSC; A11y skip to main |
| `HeroImageFallback` | `ui/HeroImageFallback.tsx` | HeroMedia | Static hero image; `priority`, tuned `sizes` + `quality` |
| `VideoBackground` | `ui/VideoBackground.tsx` | HeroMedia | Vimeo id `1161696100`; reduced-motion → null |
| `SocialLinks` | `ui/SocialLinks.tsx` | Contact only | |
| `NewsletterForm` | `ui/NewsletterForm.tsx` | Contact only | **Stub** — `console.log` + fake success |
| `StreamingPlatforms` | `ui/StreamingPlatforms.tsx` | **Unused** | Music inlines platform icons instead |

---

## SEO

### `StructuredData` — `components/seo/StructuredData.tsx` (async RSC)

- **No props** — self-fetches `getPublicShows()` + `getPublicAlbums()` from the Data Cache.
- Emits JSON-LD for MusicGroup, Organization, BreadcrumbList, MusicAlbum[], MusicEvent[].
- Wrapped in a `Suspense` at the top of `page.tsx`.

---

## Admin colocated components

Under `src/app/admin/`:

| Component | Path | Role |
|---|---|---|
| `LoginForm` | `login/LoginForm.tsx` | Native form → `loginAction`; errors via `?error=1` |
| `ShowsTable` | `shows/ShowsTable.tsx` | List + hide/delete/feature; optimistic local state; sonner toasts |
| `ShowForm` | `shows/ShowForm.tsx` | RHF + Zod; client-side image optimize + WebP; Blob upload; persists cover metadata |
| `NewShowDialog` | `shows/NewShowDialog.tsx` | Radix Dialog wrapping `ShowForm` |
| `FeaturedCard` | `shows/FeaturedCard.tsx` | Featured summary + clear/edit |
| `AlbumForm` | `albums/AlbumForm.tsx` | RHF + Zod; client-side image optimize + WebP; Blob upload; persists cover metadata |
| `AlbumsTable` | `albums/AlbumsTable.tsx` | List + hide/delete; optimistic local state |
| `NewAlbumDialog` | `albums/NewAlbumDialog.tsx` | Radix Dialog wrapping `AlbumForm` |

### `ShowForm` / `AlbumForm` props

```ts
interface ShowFormProps {
  defaultValues?: Partial<ShowFormData>;
  showId?: string;
  onSubmit: (data: ShowFormData) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

Schema: `src/lib/shows/schemas.ts` (`ShowSchema` / `ShowFormData`).

**Important:** Both forms use **native inputs + Tailwind**, not shadcn `Form` / `Input` components — even though those files exist.

Image processing: both forms call `optimizeCoverImage(file, role)` from `src/lib/images/client-optimize.ts`. This resizes, converts to WebP, and generates a LQIP base64 blur placeholder in one Canvas pass.

---

## shadcn / Radix primitives (`components/ui/`)

Configured by `components.json` (new-york, lucide, CSS variables).

| File | Live usage |
|---|---|
| `dialog.tsx` | **Yes** — `NewShowDialog`, `NewAlbumDialog` |
| `button.tsx` | Indirectly via dialog |
| `form.tsx` | Unused |
| `input.tsx` | Unused |
| `label.tsx` | Unused |
| `textarea.tsx` | Unused |
| `select.tsx` | Unused |
| `switch.tsx` | Unused |
| `table.tsx` | Unused (admin table is custom `<table>`) |
| `card.tsx` | Unused |
| `badge.tsx` | Unused |
| `separator.tsx` | Unused |
| `navigation-menu.tsx` | Unused |
| `sonner.tsx` | Unused — admin imports `Toaster` from `sonner` package directly |

`ui/sonner.tsx` expects `next-themes` ThemeProvider, which is **not** wired in layouts.

**Agent rule:** Prefer existing admin/public patterns. Adding a shadcn primitive is fine if you actually use it; do not assume installed = in use.

---

## Helpers used by UI

| Module | Role |
|---|---|
| `lib/utils.ts` | `cn()` (clsx + tailwind-merge) |
| `lib/hebrew.ts` | Hebrew month labels for ShowCard |
| `lib/shows/queries.ts` | `PublicShow` + cached fetchers |
| `lib/shows/schemas.ts` | Zod form schema (includes cover metadata fields) |
| `lib/shows/actions.ts` | Mutations (with `revalidateTag`) |
| `lib/albums/queries.ts` | `PublicAlbum` + cached fetcher |
| `lib/albums/schemas.ts` | Zod form schema (includes cover metadata fields) |
| `lib/albums/actions.ts` | Mutations (with `revalidateTag`) |
| `lib/blob.ts` | Server-side cover delete |
| `lib/images/client-optimize.ts` | Browser-side Canvas resize + WebP + LQIP |
| `data/music.ts` | Legacy static album list (local `/public/albums/` paths — not the live DB source) |
| `data/social.ts` | Static social platform config |

---

## Adding a new component

1. Choose layer: `sections/` (page block), `ui/` (reusable), or `app/admin/...` (CMS-only).
2. Type props explicitly; for shows use `PublicShow` from queries, not legacy `types.Show`.
3. Mark `"use client"` only if you need state, effects, or browser APIs.
4. Follow RTL + orange focus + reduced-motion.
5. Export from `components/index.ts` only if the public homepage (or multiple public places) will import it.
6. Update this inventory if the component becomes part of the long-lived surface.
