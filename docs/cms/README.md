# Shazamat CMS — Agent Entry Point

This document is the single source of truth for the Shazamat admin CMS. Read this first before touching anything in `/src/app/admin`, `/src/lib/shows`, or `/src/app/api/admin`.

For the public website UI, design system, and component map, see [`docs/frontend/README.md`](../frontend/README.md).

---

## Table of Contents

1. [What the CMS does](#what-the-cms-does)
2. [Architecture overview](#architecture-overview)
3. [File map](#file-map)
4. [Data model](#data-model)
5. [Authentication](#authentication)
6. [Image uploads](#image-uploads)
7. [Server actions reference](#server-actions-reference)
8. [Public site integration](#public-site-integration)
9. [Environment variables](#environment-variables)
10. [Database](#database)
11. [Adding new features](#adding-new-features)
12. [Known constraints & gotchas](#known-constraints--gotchas)

---

## What the CMS does

The CMS lives at `/admin` and lets the band manager:

| Feature | Route |
|---|---|
| Log in | `/admin/login` |
| View & manage all shows | `/admin/shows` |
| Create a new show | Dialog on `/admin/shows` |
| Edit an existing show | `/admin/shows/[id]/edit` |
| Delete a show | Button in shows table |
| Feature a show (homepage highlight) | Toggle in shows table or FeaturedCard |
| Hide a show from the public site | Eye icon in shows table |
| Upload a cover image for a show | Drag-and-drop inside ShowForm |

The public site reads directly from the same database — there is no publish/deploy step. Changes appear immediately.

---

## Architecture overview

```
Browser (admin)
    │
    ├─ /admin/* pages  (Next.js App Router, RSC + Client Components)
    │       ├─ Server Components fetch data via src/lib/shows/queries.ts
    │       └─ Client Components call Server Actions in src/lib/shows/actions.ts
    │
    ├─ /api/admin/upload  (Route Handler — Vercel Blob client upload token)
    │
    └─ Middleware (src/middleware.ts) — JWT gate on every /admin/* request

Database (Neon Postgres via Prisma + @prisma/adapter-pg)
Blob storage (Vercel Blob — images stored at *.public.blob.vercel-storage.com)
```

**Key framework choices:**

- **Next.js 15 App Router** — all admin pages are in `src/app/admin/`.
- **Prisma v7** with `@prisma/adapter-pg` driver adapter (required in v7; no native Prisma engine).
- **`jose`** for JWT session cookies (works in Next.js Middleware/Edge).
- **Shadcn/ui** components throughout the admin UI.
- **`react-hook-form` + Zod** for form validation.
- **Vercel Blob client upload** — the browser uploads directly to Blob; the server only issues a short-lived token.
- **`sonner`** for toast notifications.
- **`next/image`** optimises Blob images via `remotePatterns` in `next.config.ts`.
- RTL (`dir="rtl"`) applied at the admin layout level; all text is Hebrew.

---

## File map

```
src/
├── middleware.ts                        JWT guard — protects all /admin/* routes
├── lib/
│   ├── auth.ts                          Session helpers (createSession, verifySession, isAuthenticated, checkCredentials)
│   ├── blob.ts                          uploadCoverImage / deleteCoverImage (server-side helpers)
│   ├── prisma.ts                        Singleton PrismaClient with @prisma/adapter-pg
│   └── shows/
│       ├── schemas.ts                   Zod ShowSchema + exported types (ShowFormData, ActionResult)
│       ├── queries.ts                   DB read functions (getAllShows, getPublicShows, getFeaturedShow, …)
│       └── actions.ts                   "use server" — createShow, updateShow, deleteShow,
│                                         toggleShowVisibility, setFeaturedShow, clearFeaturedShow
├── app/
│   ├── admin/
│   │   ├── layout.tsx                   Admin shell — header, nav, logout button, <Toaster>
│   │   ├── page.tsx                     Redirects / → /admin/shows
│   │   ├── auth-actions.ts              loginAction / logoutAction server actions
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── LoginForm.tsx            Login card UI
│   │   └── shows/
│   │       ├── page.tsx                 Main shows dashboard (RSC — fetches data, renders FeaturedCard + ShowsTable)
│   │       ├── NewShowDialog.tsx        "הוספת הופעה" dialog — wraps ShowForm, calls router.refresh() on success
│   │       ├── ShowForm.tsx             Shared create/edit form (RHF + Zod, Vercel Blob upload, WebP conversion)
│   │       ├── ShowsTable.tsx           Client component — shows list, delete/edit/hide/feature buttons
│   │       ├── FeaturedCard.tsx         Highlighted card for the currently featured show
│   │       ├── new/
│   │       │   └── page.tsx             Legacy page (kept for direct URL access, not linked from UI)
│   │       └── [id]/edit/
│   │           └── page.tsx             Edit page — fetches show by id, renders ShowForm
│   └── api/
│       └── admin/
│           └── upload/
│               └── route.ts            POST — issues Vercel Blob upload token (auth-gated)
prisma/
├── schema.prisma                        Show model definition
└── seed.ts                              Seeds initial show data
```

---

## Data model

```prisma
model Show {
  id         String   @id @default(cuid())
  date       DateTime @db.Date        // stored as DATE (no time component)
  city       String
  venue      String
  ticketLink String?                  // full URL or null
  doorsTime  String?                  // free text e.g. "20:00"
  coverImage String?                  // Vercel Blob URL or null
  isFeatured Boolean  @default(false) // only ONE show should be featured at a time
  isHidden   Boolean  @default(false) // excluded from public site when true
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([date])
  @@index([isFeatured])
  @@index([isHidden])
}
```

**Invariants enforced in code (not in DB):**
- Only one `isFeatured = true` at a time. `createShow` and `updateShow` use a `$transaction` that resets all others before setting the new one.
- `isHidden` shows are filtered out by all `getPublic*` queries but remain visible in the admin.

---

## Authentication

**Single hardcoded admin user** — credentials stored in env vars, no users table.

Flow:

```
POST /admin/login
  → loginAction (src/app/admin/auth-actions.ts)
  → checkCredentials(username, password)   // compares env vars
  → createSession()                        // signs JWT with ADMIN_SESSION_SECRET (jose, 7d expiry)
  → setSessionCookie()                     // httpOnly cookie "admin_session"
  → redirect /admin/shows
```

Every `/admin/*` request (except `/admin/login`) passes through `src/middleware.ts` which verifies the JWT inline (no DB hit).

Server Actions that mutate data call `await requireAuth()` as their first line, which calls `isAuthenticated()` and redirects to login on failure.

**Relevant files:** `src/lib/auth.ts`, `src/middleware.ts`, `src/app/admin/auth-actions.ts`

---

## Image uploads

Images are stored in **Vercel Blob** (`BLOB_READ_WRITE_TOKEN` env var required).

The upload flow is client-side direct upload to avoid sending large files through the Next.js server:

```
Browser (ShowForm.tsx)
  1. User selects image file
  2. convertToWebP() — Canvas API resizes to max 1200px and converts to WebP (quality 0.85)
  3. upload() from @vercel/blob/client
       → POST /api/admin/upload  (get short-lived token — auth-gated)
       → PUT directly to Vercel Blob CDN
  4. Returns public Blob URL → stored in form field coverImage
  5. On form submit → URL saved to Show.coverImage in DB
```

On **delete**: if `show.coverImage` contains `blob.vercel-storage.com`, `deleteCoverImage(url)` is called before the DB row is deleted.

Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif` — max 10 MB (post-conversion WebP is typically well under 500 KB).

**Relevant files:** `src/lib/blob.ts`, `src/app/api/admin/upload/route.ts`, `src/app/admin/shows/ShowForm.tsx` (see `convertToWebP` and the `upload()` call)

---

## Server actions reference

All in `src/lib/shows/actions.ts` (`"use server"`). All require authentication.

| Action | Signature | Notes |
|---|---|---|
| `createShow` | `(data: ShowFormData) → ActionResult` | Wraps in transaction if `isFeatured: true` |
| `updateShow` | `(id, data: ShowFormData) → ActionResult` | Same transaction logic for featured |
| `deleteShow` | `(id) → ActionResult` | Deletes Blob image first if present |
| `toggleShowVisibility` | `(id) → ActionResult` | Flips `isHidden` |
| `setFeaturedShow` | `(id) → ActionResult` | Clears all others, sets this one featured |
| `clearFeaturedShow` | `() → ActionResult` | Sets all `isFeatured = false` |

All actions call `revalidatePath("/")` and `revalidatePath("/admin/shows")` on success.

`ActionResult` type:
```ts
type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string }
```

---

## Public site integration

The public site reads show data server-side. There is **no static data file** — everything comes from the DB.

| Query function | Where used | Filters |
|---|---|---|
| `getPublicShows()` | `src/app/page.tsx` → `Shows` component | `isHidden: false`, sorted ascending by date |
| `getPublicFeaturedShow()` | `src/app/page.tsx` → `UpcomingShow` component | `isFeatured: true`, `isHidden: false` |

**Relevant files:** `src/lib/shows/queries.ts`, `src/app/page.tsx`, `src/components/sections/Shows.tsx`, `src/components/sections/UpcomingShow.tsx`, `src/app/sitemap.ts`

---

## Environment variables

Required in `.env.local` (local dev) and Vercel project settings (production):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (pooled, `sslmode=require`) |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SESSION_SECRET` | Secret used to sign/verify JWT session tokens |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token — must start with `vercel_blob_rw_` |

`ADMIN_SESSION_SECRET` should be a long random string in production. Change it to invalidate all existing sessions.

The Prisma CLI picks up `.env.local` via `prisma.config.ts` (uses `dotenv` with `override: true`).

---

## Database

**Neon Postgres** (serverless). Prisma schema at `prisma/schema.prisma`.

Useful commands:

```bash
# Apply schema changes (creates migration file)
npm run db:migrate

# Inspect DB in browser
npm run db:studio

# Seed initial show data
npm run db:seed

# Regenerate Prisma client after schema change
npx prisma generate
```

The Prisma client is generated into `src/generated/prisma/`. Import it as:
```ts
import { PrismaClient } from "@/generated/prisma/client";
```

The singleton instance is at `src/lib/prisma.ts` — always import from there:
```ts
import { prisma } from "@/lib/prisma";
```

---

## Adding new features

### Add a new field to Show

1. Add the field to `prisma/schema.prisma`.
2. Run `npm run db:migrate` and name the migration.
3. Add the field to `ShowSchema` in `src/lib/shows/schemas.ts`.
4. Update `createShow` and `updateShow` in `src/lib/shows/actions.ts` to read/write the new field.
5. Update `ShowForm.tsx` to render the new input.
6. Update `queries.ts` return types if the public site needs the field.

### Add a new admin section (e.g. "Media")

1. Create `src/app/admin/media/page.tsx`.
2. Add a nav link in `src/app/admin/layout.tsx`.
3. The middleware already protects all `/admin/*` routes — no extra config needed.

### Change admin credentials

Update `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars. No code change required.

---

## Known constraints & gotchas

- **`"use server"` files cannot export non-async values.** `ShowSchema` and types live in `schemas.ts` (not `actions.ts`) for this reason.
- **`useState` + `router.refresh()`**: `ShowsTable` uses a `useEffect` to sync its local `items` state when the server re-renders with fresh `shows` props after a mutation. Do not remove this effect.
- **Single `isFeatured`**: enforced by transactions in `createShow`/`updateShow`/`setFeaturedShow`. The DB has no unique constraint — the invariant is purely in application code.
- **Prisma v7 requires a driver adapter.** `src/lib/prisma.ts` initialises `PrismaClient` with `new PrismaPg(pool)`. If you see "driver adapter not provided" errors, check that file.
- **`DATE` vs `DateTime`**: `Show.date` is `@db.Date` (date-only, no timezone). `queries.ts` serialises it to `YYYY-MM-DD` strings for the public site to avoid hydration mismatches between server and client timezones.
- **Vercel Blob token format**: must be `vercel_blob_rw_...`. The shorter `BLOB_STORE_ID` and `BLOB_WEBHOOK_PUBLIC_KEY` values are not valid upload tokens.
- **`/admin/shows/new` page**: still exists but is no longer linked from the UI. New shows are created via the dialog on `/admin/shows`. The page can be removed in a future cleanup.
