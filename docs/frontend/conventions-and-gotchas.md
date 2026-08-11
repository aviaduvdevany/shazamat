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

### Forms

- Admin show forms: RHF + Zod schema in `lib/shows/schemas.ts`
- Login: native form + server action (no RHF)
- Newsletter: stub only — do not pretend it persists without an API

---

## Gotchas

### 1. Contact is off, but SEO still mentions it

Homepage comments out `<Contact />`. Sitemap and StructuredData breadcrumbs still reference `#contact`. If you re-enable or permanently remove Contact, update all three.

### 2. Mandatori vs Emulsi

Brandbook wants Mandatori for display; CSS loads Emulsi for everything. `MandatoryVariable.ttf` is unused. Filename spelling ≠ brand spelling.

### 3. Static shows leftover

`data/shows.ts`, `hooks/useShows.ts`, and `types.Show` (`id: number`) are not the live path. Homepage uses Prisma → `PublicShow`.

### 4. Music is still static

No album CMS. Edits = TypeScript + `public/albums/`.

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

Show covers from Vercel Blob need the `remotePatterns` entry in `next.config.ts` (already present). Local `/…` paths sometimes use `unoptimized` on `next/image`.

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

---

## Quick verification checklist

Before finishing a frontend change:

- [ ] RTL still looks correct (no mirrored-broken layouts)
- [ ] Orange focus rings still visible on new controls
- [ ] Reduced-motion path doesn't break (especially Hero video)
- [ ] Shows still load when DB is configured (`force-dynamic`)
- [ ] Admin flows still toast + refresh after mutate
- [ ] No secrets in client bundles
- [ ] Docs updated if architecture/behavior changed

---

## Primary files cheat sheet

```
Public entry:     src/app/page.tsx
Root chrome:      src/app/layout.tsx
Brand CSS:        src/app/globals.css
Brand blueprint:  design.json
Show reads:       src/lib/shows/queries.ts
Show writes:      src/lib/shows/actions.ts
Show form schema: src/lib/shows/schemas.ts
Sections:         src/components/sections/*
Admin UI:         src/app/admin/shows/*
Auth gate:        src/middleware.ts
Static music:     src/data/music.ts
Static social:    src/data/social.ts
```
