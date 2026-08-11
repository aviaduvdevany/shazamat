# Public Site

Everything about the marketing homepage at `/`.

---

## Composition

[`src/app/page.tsx`](../../src/app/page.tsx) is a **synchronous RSC orchestrator** — it does no data fetching itself. Each section is an async RSC wrapped in a `Suspense` boundary so the static shell (Hero, Header) streams before the DB resolves.

```tsx
// ISR: CDN-cached HTML, revalidated in background every 60 s
export const revalidate = 60;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Async RSC — self-fetches from Data Cache */}
      <Suspense fallback={null}><StructuredData /></Suspense>
      <SkipLinks />
      <Header />
      <main id="main-content">
        {/* Hero has no DB dependency — streams immediately */}
        <Hero />
        <Suspense fallback={<section className="py-20 md:py-32 bg-black" />}>
          <UpcomingShow />
        </Suspense>
        <Suspense fallback={<section className="py-24 md:py-32 bg-white" />}>
          <Shows />
        </Suspense>
        <Suspense fallback={<section className="py-24 md:py-32 bg-black" />}>
          <Music />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
```

### Section order (top → bottom)

1. **Hero** — brand + video/image + socials
2. **UpcomingShow** — featured show only (hidden if none)
3. **Shows** — full list (upcoming + past)
4. **Music** — albums timeline
5. ~~Contact~~ — implemented but commented out

To reorder or toggle sections, edit `page.tsx` only.

---

## Anchors & navigation

| Anchor / URL | Section | In Header? |
|---|---|---|
| `#home` | Hero | Yes (בית) |
| `#shows` | Shows (+ scroll from Hero) | Yes (הופעות) |
| `#music` | Music | Yes (מוזיקה) |
| MerchAdvice store (external) | — | Yes (מרץ׳) — opens in new tab, shows external-link icon |
| `#album-{id}` | Per-album in Music | No (timeline / sitemap) |
| `#contact` | Contact (unmounted) | No — still in sitemap/schema |

Nav items are defined once in `src/components/layout/nav.ts` and shared by `Header.tsx`, `MobileNav.tsx`, and `Footer.tsx`. To add or reorder links, edit only that file.

---

## Data wiring

Each section is a **self-fetching async RSC**. `page.tsx` does not pass data props to any section.

| Section | Data source | Fetch location |
|---|---|---|
| Hero | `socialPlatforms` from `@/data/social.ts` | Static import in RSC |
| UpcomingShow | `getPublicShows()` → derives featured | Self-fetches inside component |
| Shows | `getPublicShows()` | Self-fetches inside component |
| Music | `getPublicAlbums()` from DB | Self-fetches inside component |
| StructuredData | `getPublicShows()` + `getPublicAlbums()` | Self-fetches inside component |

**Data Cache**: both `getPublicShows` and `getPublicAlbums` are wrapped in `unstable_cache` with their respective tags. Since the ISR boundary and the Data Cache share the same in-process memory, DB calls are made **at most once per revalidation cycle** even if multiple sections call the same function.

Public queries exclude `isHidden: true`. Featured public query also requires not hidden.

Past detection: `date < today` (start of local day) → `isPast`.

---

## Hero behavior (detail)

- RSC shell; interactive parts are **client islands**: `HeroMedia` (video state), `HeroScrollArrow` (fade on scroll).
- Image always available (mobile + video-loading state) via `HeroImageFallback`.
- Video only `md+`; uses `@vimeo/player` loaded dynamically (`ssr: false`).
- Dark overlay + noise for readability.
- Social icons: static `<img>` tags (no `next/image` overhead for small SVG icons) from `data/social.ts` + `public/icons/`.
- If you re-enable CTAs, keep brand-first hierarchy: logo remains the hero signal.

---

## Featured show behavior

- Controlled entirely in admin (`isFeatured`). At most one featured (actions clear others in a transaction).
- `UpcomingShow` derives its featured show by filtering `getPublicShows()` (same cached call the Shows section uses — no extra DB hit).
- UI returns `null` when missing — homepage simply skips the block.
- Cover image uses `next/image` with blur placeholder if `coverBlurDataURL` is populated.
- Hover effect on the ticket button is CSS-only (`.btn-featured` in `globals.css`).

---

## Shows list behavior

- Includes past shows (visual treatment differs: strikethrough / disabled ticket).
- Ticket button opens `ticketLink` when present.
- Dates rendered with Hebrew month helpers.
- `ShowCard` is a pure RSC; `.btn-ticket` CSS class handles hover without JS.

---

## Music behavior

- Albums come from the **CMS database** (not a static data file). Edit albums in `/admin/albums`.
- `getPublicAlbums()` is cached with `unstable_cache(tag: 'albums')`.
- The year-filter pill row (`YearNav`) is a **client island** — smooth `scrollIntoView` requires the browser.
- Blurred background behind each album card: a blurred, zoomed `next/image` of the cover (`blur(24px) saturate(1.4)`, `quality={35}`, expanded container `top/left/right/bottom: -60%`).
- Streaming platform links (Spotify, Apple Music) use static `<img>` tags for SVG icons.
- `#album-{id}` anchors are generated from the DB album ID.

---

## SEO & social sharing

Root metadata (`layout.tsx`):

- Title template: `%s | שאזאמאט - Shazamat`
- Locale `he_IL`, OG image `/images/hero-image.webp`
- Twitter `@shazamat_crew`
- `theme-color: #000000`
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`

`StructuredData` builds rich-results entities from shows + albums. It is an **async RSC** that self-fetches — no longer receives props from `page.tsx`.

`sitemap.ts` returns only the homepage URL (`/`). Hash fragments (`#shows`, `#music`, etc.) are not separate indexable URLs and are omitted. Keeping it DB-free avoids a production 500 if the DB is unavailable at crawl time.

`robots.ts` disallows `/admin` from all crawlers.

---

## Accessibility on the public site

- Skip link to `#main-content`
- Semantic `<main>`, section headings
- Icon links with `aria-label`
- Focus visible orange rings (global CSS)
- `prefers-reduced-motion` respected (video null, animations off)

When editing interactive bits (Header menu, Hero scroll), preserve keyboard paths.

---

## Visual / layout conventions for public edits

- One clear composition in the first viewport (brand-first; Hero already does this via Logo)
- Monochrome + orange accent only
- Prefer full-bleed hero media (already edge-to-edge video/image)
- Avoid introducing card-heavy dashboard layouts on marketing sections
- Keep Hebrew copy natural; do not leave English UI strings on public surfaces

---

## Common public-site tasks

### Change social links

Edit `src/data/social.ts` (URLs + icon paths under `public/icons/`).

### Add or edit an album

Use the **admin CMS** at `/admin/albums`. The cover is processed client-side (Canvas → WebP, LQIP blur placeholder) and stored in Vercel Blob.

### Change hero fallback image

Replace `public/images/hero-image.webp` (also used for OG — keep a strong 1200×630-friendly frame if possible). The file was recompressed to WebP (~178 KB); maintaining WebP format is important for LCP.

### Change hero video

Edit Vimeo id inside `components/ui/VideoBackground.tsx`.

### Re-enable Contact

1. Uncomment `<Contact />` in `page.tsx`
2. Add nav item in `Header.tsx` and `MobileNav.tsx`
3. Optionally wire `NewsletterForm` to a real API (currently stub)

### Style tweak across sections

Start from CSS variables in `globals.css`; avoid one-off hex colors unless matching admin orange utilities intentionally.
