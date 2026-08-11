# Admin UI (Frontend Layer)

UI patterns for `/admin`. For auth, Prisma, Blob, and server actions, read [`docs/cms/README.md`](../cms/README.md) — this doc covers only what a frontend agent needs to edit screens safely.

---

## Shell

[`src/app/admin/layout.tsx`](../../src/app/admin/layout.tsx):

- Own `<html lang="he" dir="rtl">` + dark `body`
- Sticky top bar: brand chip, links to הופעות + אלבומים, logout form (`logoutAction`)
- `<Toaster />` from **`sonner`** (not `@/components/ui/sonner`)
- `robots: noindex,nofollow`

Login page sits under this layout too (logout still visible — acceptable).

---

## Screens

| Route | UI pieces |
|---|---|
| `/admin/login` | `LoginForm` — native `<form action={loginAction}>`, password field, `?error=1` banner |
| `/admin/shows` | `FeaturedCard` + `NewShowDialog` + `ShowsTable` |
| `/admin/shows/new` | Full-page `ShowForm` + `createShow` |
| `/admin/shows/[id]/edit` | `ShowForm` with defaults from `showToFormData` + `updateShow` |
| `/admin/albums` | `NewAlbumDialog` + `AlbumsTable` |
| `/admin/albums/[id]/edit` | `AlbumForm` with defaults from `albumToFormData` + `updateAlbum` |

Prefer the **dialog create** path on the list page for both shows and albums.

---

## Form pattern

**Stack:** `react-hook-form` + `@hookform/resolvers` + Zod (`ShowSchema`).

```ts
// src/lib/shows/schemas.ts
export const ShowSchema = z.object({
  date: z.string().min(1, "תאריך הוא שדה חובה"),
  city: z.string().min(1, "עיר היא שדה חובה"),
  venue: z.string().min(1, "מקום הוא שדה חובה"),
  ticketLink: z.string().url("קישור לא תקין").optional().or(z.literal("")),
  doorsTime: z.string().optional(),
  coverImage: z.string().optional(),
  coverWidth: z.number().optional(),
  coverHeight: z.number().optional(),
  coverBlurDataURL: z.string().optional(),
  isFeatured: z.boolean(),
});
```

`ShowForm`:

- Validates with `zodResolver(ShowSchema)`
- Submits via `useTransition` + `onSubmit` prop (page wires server action)
- Toasts success/error with `sonner`
- Cover upload: calls `optimizeCoverImage(file, role)` from `src/lib/images/client-optimize.ts` — Canvas API resize → WebP + LQIP base64 blur placeholder → `@vercel/blob/client` `upload` with `handleUploadUrl: "/api/admin/upload"` (WebP only)
- `coverWidth`, `coverHeight`, `coverBlurDataURL` are stored as hidden inputs and persisted to DB
- Ticket URL inputs use `dir="ltr"`
- Styling: raw inputs + Tailwind zinc/orange — **not** shadcn Form kit

When adding fields:

1. Extend Zod schema + Prisma model (migration) + actions mapping
2. Add input in `ShowForm` (and `AlbumForm` if it applies to albums too)
3. Update table/card display if the field is user-visible
4. Keep Hebrew validation messages
5. If adding cover-related metadata, follow the `coverWidth`/`coverHeight`/`coverBlurDataURL` pattern already wired for both forms

---

## Table pattern (`ShowsTable`)

- Receives initial shows from RSC
- Keeps local React state for optimistic hide/delete/feature updates
- Calls server actions; rolls back / toasts on failure
- Actions: edit link, toggle visibility, set featured, delete (confirm)

Hebrew month formatting may be duplicated vs `lib/hebrew.ts` — consolidate when editing.

---

## Dialog pattern (`NewShowDialog`)

- Uses shadcn/Radix `Dialog`
- Embeds `ShowForm`
- On success: close dialog + `router.refresh()` (or equivalent) so RSC data reloads

---

## Featured card

- Shows current featured show summary
- Clear featured → `clearFeaturedShow`
- Edit navigates to edit route

---

## Visual conventions (admin)

| Element | Class tendency |
|---|---|
| Page bg | `bg-zinc-950` |
| Panels | `bg-zinc-900` / borders `border-zinc-800` |
| Primary button | `bg-orange-500 hover:bg-orange-600` |
| Destructive | red/zinc hover patterns already in table |
| Muted text | `text-zinc-400`–`500` |

Do not port public grunge/noise textures into admin forms.

---

## Auth UX notes

- Unauthenticated `/admin/*` → redirect `/admin/login` (middleware)
- Failed login → `/admin/login?error=1`
- Logout is a POST form button in the header (not a client fetch)

Frontend agents should not weaken middleware checks or move secrets client-side.

---

## What not to reinvent

| Need | Existing approach |
|---|---|
| Validation | Zod in `src/lib/shows/schemas.ts` / `src/lib/albums/schemas.ts` |
| Mutations | `src/lib/shows/actions.ts` / `src/lib/albums/actions.ts` |
| Upload | Blob client + `/api/admin/upload` (shared; WebP only) |
| Image optimize + LQIP | `src/lib/images/client-optimize.ts` (`optimizeCoverImage`) |
| Feedback | `toast` from `sonner` |
| Refresh after mutate | `revalidateTag` + `revalidatePath` in actions + client `router.refresh()` where needed |

Deep CMS reference: [`docs/cms/README.md`](../cms/README.md).
