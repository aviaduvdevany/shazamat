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

Not in the barrel (import by path): `SkipLinks`, `Logo`, `VideoBackground`, `HeroImageFallback`, `StructuredData`, all shadcn primitives, all admin colocated components.

---

## Layout

### `Header` — `components/layout/Header.tsx` (`"use client"`)

- Fixed nav, black bar, logo `variant="icon"`
- Links: בית `#home`, הופעות `#shows`, מוזיקה `#music` (no Contact)
- Mobile: hamburger, Escape, focus trap, click-outside, close-on-scroll
- Active/hover → orange

### `Footer` — `components/layout/Footer.tsx` (server)

- Black footer, 3 columns: brand blurb, quick links, email `mulu.records@gmail.com`
- Copyright year currently hardcoded `2024`

---

## Sections (homepage)

### `Hero` — `sections/Hero.tsx` (`"use client"`)

- Full-viewport black hero, `id="home"`
- Mobile: static `HeroImageFallback` (`/images/hero-image.webp`)
- Desktop: dynamic Vimeo `VideoBackground` (`ssr: false`), fades once ready
- Brand signal: large `Logo` wordmark as H1
- Social icon row from `socialPlatforms`
- Scroll cue → `#shows`
- Primary CTAs currently **commented out** in source

### `UpcomingShow` — `sections/UpcomingShow.tsx` (`"use client"`)

```ts
interface UpcomingShowProps {
  featured: PublicShow | null;
}
```

- Returns `null` if no featured show
- Grunge / orange energy treatment
- Shows venue, city, date, doors, cover, ticket link

### `Shows` — `sections/Shows.tsx` (`"use client"`)

```ts
interface ShowsProps {
  shows: PublicShow[];
}
```

- Section `id="shows"`
- Maps to `ShowCard` (past shows styled differently)

### `Music` — `sections/Music.tsx` (`"use client"`)

- No props — reads `albums` from `@/data`
- Year timeline + album covers; Spotify / Apple links inline
- Anchors `#music`, `#album-{id}`

### `Contact` — `sections/Contact.tsx`

- Newsletter + `SocialLinks`
- **Not mounted** on homepage (`{/* <Contact /> */}` in `page.tsx`)
- Still referenced in sitemap / breadcrumb JSON-LD

---

## Brand / feature UI

| Component | Path | Used by | Notes |
|---|---|---|---|
| `ShowCard` | `ui/ShowCard.tsx` | Shows | Hebrew date via `lib/hebrew.ts`; ticket CTA; past = muted/disabled |
| `AlbumCard` | `ui/AlbumCard.tsx` | Music | Cover image presentation |
| `Logo` | `ui/Logo.tsx` | Header, Hero | `logo` \| `icon` variants |
| `SkipLinks` | `ui/SkipLinks.tsx` | Home | A11y skip to main |
| `HeroImageFallback` | `ui/HeroImageFallback.tsx` | Hero | Static hero image |
| `VideoBackground` | `ui/VideoBackground.tsx` | Hero | Vimeo id `1161696100`; reduced-motion → null |
| `SocialLinks` | `ui/SocialLinks.tsx` | Contact only | |
| `NewsletterForm` | `ui/NewsletterForm.tsx` | Contact only | **Stub** — `console.log` + fake success |
| `StreamingPlatforms` | `ui/StreamingPlatforms.tsx` | **Unused** | Music inlines platforms instead |

---

## SEO

### `StructuredData` — `components/seo/StructuredData.tsx`

Props: `shows: PublicShow[]` (future shows for MusicEvent).

Emits JSON-LD for MusicGroup, Organization, BreadcrumbList, MusicAlbum[], MusicEvent[].

---

## Admin colocated components

Under `src/app/admin/`:

| Component | Path | Role |
|---|---|---|
| `LoginForm` | `login/LoginForm.tsx` | Native form → `loginAction`; errors via `?error=1` |
| `ShowsTable` | `shows/ShowsTable.tsx` | List + hide/delete/feature; optimistic local state; sonner toasts |
| `ShowForm` | `shows/ShowForm.tsx` | RHF + Zod; WebP client compress; Blob upload |
| `NewShowDialog` | `shows/NewShowDialog.tsx` | Radix Dialog wrapping `ShowForm` |
| `FeaturedCard` | `shows/FeaturedCard.tsx` | Featured summary + clear/edit |

### `ShowForm` props

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

**Important:** ShowForm uses **native inputs + Tailwind**, not shadcn `Form` / `Input` components — even though those files exist.

---

## shadcn / Radix primitives (`components/ui/`)

Configured by `components.json` (new-york, lucide, CSS variables).

| File | Live usage |
|---|---|
| `dialog.tsx` | **Yes** — `NewShowDialog` |
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
| `lib/shows/queries.ts` | `PublicShow` + fetchers |
| `lib/shows/schemas.ts` | Zod form schema |
| `lib/shows/actions.ts` | Mutations |
| `lib/blob.ts` | Server-side cover delete |
| `data/music.ts`, `data/social.ts` | Static content |

Duplicate month maps may exist in admin table code — prefer consolidating on `lib/hebrew.ts` when touching that area.

---

## Adding a new component

1. Choose layer: `sections/` (page block), `ui/` (reusable), or `app/admin/...` (CMS-only).
2. Type props explicitly; for shows use `PublicShow` from queries, not legacy `types.Show`.
3. Mark `"use client"` only if you need state, effects, or browser APIs.
4. Follow RTL + orange focus + reduced-motion.
5. Export from `components/index.ts` only if the public homepage (or multiple public places) will import it.
6. Update this inventory if the component becomes part of the long-lived surface.
