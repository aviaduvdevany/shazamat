# Conventions & Gotchas

Rules of the road for agents working on this frontend, plus traps that burn time.

---

## Conventions

### Do

- Keep the public site **Hebrew + RTL**
- Use `PublicShow` from `@/lib/shows/queries` for live show UI
- Fetch shows on the server; pass serializable props into client islands
- Prefer `@/components` barrel for homepage sections
- Put CMS-only UI under `src/app/admin/...`
- Match nearby styling: public → brand CSS vars / grunge utilities; admin → zinc + orange
- Use orange `#DB7738` / `orange-500` as the only accent
- Respect `prefers-reduced-motion`
- After CMS/data behavior changes, update `docs/frontend/` and/or `docs/cms/`
- Run through mobile + desktop when touching Hero/Header/Shows

### Don't

- Don't add shows via `src/data/shows.ts` (legacy)
- Don't invent a second brand accent or purple/gradient marketing look
- Don't put orange inside the logo
- Don't assume every file in `components/ui` is used
- Don't wire `ui/sonner.tsx` without also adding a ThemeProvider — use `sonner` package like admin does
- Don't commit `.env` secrets
- Don't skip `prisma generate` after clone when touching typed Prisma imports

### Naming

| Kind | Convention | Example |
|---|---|---|
| Components | PascalCase files | `ShowCard.tsx` |
| Data modules | camelCase | `music.ts` |
| Server actions | camelCase verbs | `createShow`, `setFeaturedShow` |
| CSS utilities | kebab-case | `container-custom` |

### Client directive

Add `"use client"` only when the file needs hooks, browser APIs, or event handlers. Keep data fetching in Server Components whenever possible.

The public site follows a **server-first, client islands** model: sections are async RSCs that self-fetch from the Next.js Data Cache; only small interactive slices (`MobileNav`, `HeroMedia`, `HeroScrollArrow`, `YearNav`) are client components.

### Forms

- Admin show forms: RHF + Zod schema in `lib/shows/schemas.ts`
- Login: native form + server action (no RHF)
- Newsletter: stub only — do not pretend it persists without an API

---

## Gotchas

### 1. Contact is off, but SEO still mentions it

Homepage comments out `<Contact />`. Sitemap and StructuredData breadcrumbs still reference `#contact`. If you re-enable or permanently remove Contact, update all three.

### 2. Mandatori vs Emulsi

Brandbook wants Mandatori for display; CSS loads Emulsi for everything. `MandatoryVariable.ttf` was unused and has been **deleted** from the repo to reduce bundle size. Filename spelling ≠ brand spelling.

### 3. Static shows leftover

`data/shows.ts`, `hooks/useShows.ts`, and `types.Show` (`id: number`) are not the live path. Homepage uses Prisma → `PublicShow`.

### 4. Music is CMS-driven

Albums live in the **Prisma `Album` table**, managed via `/admin/albums`. `getPublicAlbums()` is cached with `unstable_cache`. Cover images go through the same client-side optimize pipeline (Canvas → WebP + LQIP) as shows. Edits = admin UI, not TypeScript files.

`src/data/music.ts` still exists with local `/public/albums/` paths but is **not** consumed by the live Music section. It may be used as a fallback reference only.

### 5. Newsletter is fake

`NewsletterForm` logs and shows success without a backend.

### 6. Nested admin `<html>` / `<body>`

Admin layout nests another document shell under the root layout. Unusual for App Router; don't “fix” it casually without checking hydration/metadata behavior.

### 7. shadcn Form kit unused

Many primitives are installed for future use. ShowForm is custom. Installing ≠ integrating.

### 8. Two Sonner entry points

Admin uses `import { Toaster, toast } from "sonner"`. `components/ui/sonner.tsx` is unused and theme-dependent.

### 9. Auth secret mismatch (dev)

Middleware falls back to a hardcoded dev secret if `ADMIN_SESSION_SECRET` is missing; `lib/auth.ts` may throw instead. Set the env var in all real environments.

### 10. Hero CTAs commented out

Don't assume buttons in Hero are live — read the file.

### 11. StreamingPlatforms unused

Music hardcodes Spotify/Apple. `StreamingPlatforms` export is dead weight unless you rewire it.

### 12. Legacy READMEs lie

`src/README.md` and `src/components/README.md` still describe hardcoded shows / missing admin. **Trust `docs/frontend` + `docs/cms`.**

### 13. Generated Prisma client

`src/generated/prisma` is gitignored. Without `prisma generate`, imports fail.

### 14. Blob image hosts

Show and album covers from Vercel Blob need the `remotePatterns` entry in `next.config.ts` (already present). All images uploaded via admin are WebP (enforced at the upload route). Local `/…` paths no longer use `unoptimized` — they are served through `next/image` normally.

### 15. Next 15 `params` Promise

```ts
// edit page
const { id } = await params;
```

### 16. Featured uniqueness

Only one featured show; actions enforce via transaction. UI should not assume multiple featured rows.

### 17. Logo filename typo

`public/shazamat-assets/loho-stroke.png` — not `logo-stroke.png`.

### 18. Vercel CLI (environment)

Hooks may warn the global Vercel CLI is outdated; unrelated to app runtime but useful if deploying via CLI.

### 19. CSS-only hover effects on RSC buttons

`ShowCard` and `UpcomingShow` are RSCs — no JS event handlers. Button hover effects are handled by `.btn-ticket` and `.btn-featured` classes in `globals.css`. If you add a new interactive button on an RSC, follow this pattern rather than adding `"use client"` just for hover.

### 20. Cover metadata fields

`Show` and `Album` rows may have `coverWidth`, `coverHeight`, and `coverBlurDataURL` populated (nullable). These are set by the admin forms when uploading a new cover. Use them as `width`, `height`, and `placeholder="blur" blurDataURL` on `next/image` — but handle the `null` case gracefully (older rows or manually-entered records may not have them).

### 21. `getPublicShows` is called multiple times per page

Both `UpcomingShow` and `Shows` (and `StructuredData`) independently call `getPublicShows()`. This is intentional and safe: `unstable_cache` deduplicates the DB hit within the same render pass. Do **not** try to share data by lifting it up to `page.tsx` — that would break the Suspense streaming model.

---

## Quick verification checklist

Before finishing a frontend change:

- [ ] RTL still looks correct (no mirrored-broken layouts)
- [ ] Orange focus rings still visible on new controls
- [ ] Reduced-motion path doesn't break (especially Hero video)
- [ ] Shows still load from cache (`unstable_cache` + `revalidateTag` wired)
- [ ] Admin flows still toast + refresh after mutate
- [ ] No secrets in client bundles
- [ ] Docs updated if architecture/behavior changed

---

## Primary files cheat sheet

```
Public entry:     src/app/page.tsx           (sync RSC, ISR revalidate=60)
Root chrome:      src/app/layout.tsx
Brand CSS:        src/app/globals.css
Brand blueprint:  design.json
Show reads:       src/lib/shows/queries.ts   (unstable_cache wrappers)
Show writes:      src/lib/shows/actions.ts   (revalidateTag + revalidatePath)
Show form schema: src/lib/shows/schemas.ts
Album reads:      src/lib/albums/queries.ts  (unstable_cache wrappers)
Album writes:     src/lib/albums/actions.ts  (revalidateTag + revalidatePath)
Album form schema:src/lib/albums/schemas.ts
Image util:       src/lib/images/client-optimize.ts
Sections:         src/components/sections/*  (all async RSC, self-fetching)
Client islands:   MobileNav, HeroMedia, HeroScrollArrow, YearNav
Admin UI:         src/app/admin/shows/*
                  src/app/admin/albums/*
Auth gate:        src/middleware.ts
Static social:    src/data/social.ts
Legacy music:     src/data/music.ts          (not used by live Music section)
```
