# Public Site

Everything about the marketing homepage at `/`.

---

## Composition

[`src/app/page.tsx`](../../src/app/page.tsx):

```tsx
export const dynamic = "force-dynamic";

export default async function Home() {
  const [shows, featured, albums] = await Promise.all([
    getPublicShows(),
    getPublicFeaturedShow(),
    getPublicAlbums(),
  ]);

  const futureShows = shows.filter((s) => !s.isPast);

  return (
    <div className="min-h-screen">
      <StructuredData shows={futureShows} albums={albums} />
      <SkipLinks />
      <Header />
      <main id="main-content">
        <Hero />
        <UpcomingShow featured={featured} />
        <Shows shows={shows} />
        <Music albums={albums} />
        {/* <Contact /> */}
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

To reorder or toggle sections, edit this file only.

---

## Anchors & navigation

| Anchor | Section | In Header? |
|---|---|---|
| `#home` | Hero | Yes (בית) |
| `#shows` | Shows (+ scroll from Hero) | Yes (הופעות) |
| `#music` | Music | Yes (מוזיקה) |
| `#album-{id}` | Per-album in Music | No (timeline / sitemap) |
| `#contact` | Contact (unmounted) | No — still in sitemap/schema |

---

## Data wiring

| Section | Data | Fetch location |
|---|---|---|
| Hero | `socialPlatforms` | Client import from `@/data` |
| UpcomingShow | `featured: PublicShow \| null` | Server → prop |
| Shows | `shows: PublicShow[]` | Server → prop |
| Music | `albums` | Client import from `@/data` |
| StructuredData | future shows + static albums/social | Server props + data imports |

Public queries exclude `isHidden: true`. Featured public query also requires not hidden.

Past detection: `date < today` (start of local day) → `isPast`.

---

## Hero behavior (detail)

- Image always available (mobile + loading state).
- Video only `md+`; uses `@vimeo/player`.
- Dark overlay + noise for readability.
- Social icons: Facebook, Instagram, YouTube, TikTok from `data/social.ts` + `public/icons/`.
- If you re-enable CTAs, keep brand-first hierarchy: logo remains the hero signal; do not overpower it with a bigger headline.

---

## Featured show behavior

- Controlled entirely in admin (`isFeatured`). At most one featured (actions clear others in a transaction).
- UI returns `null` when missing — homepage simply skips the block.
- Cover may be Blob URL or local path.

---

## Shows list behavior

- Includes past shows (visual treatment differs: strikethrough / disabled ticket).
- Ticket button opens `ticketLink` when present.
- Dates rendered with Hebrew month helpers.

---

## Music behavior

- Static catalog in `src/data/music.ts`.
- Covers in `public/albums/`.
- Streaming: Spotify + Apple Music fields on each album.
- Adding an album = edit data file + drop image + optionally update StructuredData/sitemap consumers (they import `albums` already).

---

## SEO & social sharing

Root metadata (`layout.tsx`):

- Title template: `%s | שאזאמאט - Shazamat`
- Locale `he_IL`, OG image `/images/hero-image.webp`
- Twitter `@shazamat_crew`
- `theme-color: #000000`
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`

`StructuredData` builds rich results entities from shows + albums.

`sitemap.ts` includes hash routes and DB shows (show entries currently all point at `#shows` — low granularity).

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

Align with repo frontend design rules and brand:

- One clear composition in the first viewport (brand-first; Hero already does this via Logo)
- Monochrome + orange accent only
- Prefer full-bleed hero media (already edge-to-edge video/image)
- Avoid introducing card-heavy dashboard layouts on marketing sections
- Keep Hebrew copy natural; do not leave English UI strings on public surfaces

---

## Common public-site tasks

### Change social links

Edit `src/data/social.ts` (URLs + icon paths under `public/icons/`).

### Add an album

1. Add cover to `public/albums/`
2. Append entry in `src/data/music.ts` (`Album` type in `src/types/index.ts`)
3. Verify Music section + sitemap album anchors

### Change hero fallback image

Replace `public/images/hero-image.webp` (also used for OG — keep a strong 1200×630-friendly frame if possible).

### Change hero video

Edit Vimeo id inside `components/ui/VideoBackground.tsx`.

### Re-enable Contact

1. Uncomment `<Contact />` in `page.tsx`
2. Add nav item in `Header.tsx`
3. Optionally wire `NewsletterForm` to a real API (currently stub)

### Style tweak across sections

Start from CSS variables in `globals.css`; avoid one-off hex colors unless matching admin orange utilities intentionally.
