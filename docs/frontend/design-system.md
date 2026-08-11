# Design System

Brand identity for the public site. Source blueprint: [`design.json`](../../design.json). Runtime tokens: [`src/app/globals.css`](../../src/app/globals.css).

---

## Brand at a glance

| Token | Value | Role |
|---|---|---|
| Black | `#000000` | Primary dark bg / text |
| White | `#FFFFFF` | Primary light bg / text |
| Orange accent | `#DB7738` | CTAs, focus, hover emphasis — **never inside the logo** |
| Language | `he-IL` | Hebrew copy |
| Direction | RTL | `dir="rtl"` on `<html>` |

**Identity vibe:** high-energy live hip-hop, ultras culture, monochrome with selective orange, subtle grain/noise.

---

## CSS variables (runtime)

Defined in `globals.css` `:root`:

```css
--shazamat-white: #ffffff;
--shazamat-black: #000000;
--shazamat-orange: #db7738;

--font-display: "Emulsi", system-ui, -apple-system, sans-serif;
--font-body: "Emulsi", system-ui, -apple-system, sans-serif;

--spacing-xs: 4px;   /* through */
--spacing-3xl: 64px;

--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;

--duration-fast: 120ms;
--duration-base: 200ms;
--duration-slow: 320ms;
--easing-standard: cubic-bezier(0.2, 0, 0, 1);
--easing-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
```

Use these (or Tailwind mapped utilities) instead of inventing new accent colors.

---

## Typography

### What ships today

- **Emulsi** is loaded via `@font-face` (variable font + weight fallbacks) and applied to **body and headings**.
- Heading scale uses fluid `clamp()` sizes matching `design.json` (h1–h3).
- Body line-height `1.45`; display line-height `1.1`.

### What design.json says (discrepancy)

| Role | design.json | Actual CSS |
|---|---|---|
| Display / H1–H3 | **Mandatori** | Emulsi |
| Album titles only | Emulsi | Emulsi (site-wide already) |
| Body | system-ui / Heebo / Noto Sans Hebrew | Emulsi |

Font file on disk: `public/fonts/MandatoryVariable.ttf` (**Mandatory** spelling) — **not referenced** in CSS. Brandbook name is **Mandatori**.

**Agent rule:** Prefer matching **current CSS** unless the task is explicitly “wire Mandatori for display.” Do not mix random third fonts (Inter, Roboto as brand voice, etc.).

---

## Logo rules

From brandbook / `design.json`:

| Do | Don't |
|---|---|
| Black or white only | Recolor logo (no orange in logo) |
| Use **either** wordmark **or** round icon in a given area | Place wordmark + icon adjacent |
| Keep proportions | Stretch / distort |

Component: `src/components/ui/Logo.tsx`

| `variant` | Asset |
|---|---|
| `"logo"` (default) | `/shazamat-assets/logo-official.png` |
| `"icon"` | `/shazamat-assets/logo-shin.png` |

Header uses `icon`; Hero uses `logo` as the H1 visual.

Other assets live in `public/shazamat-assets/` (stroke, square, stylized, etc.). Note typo filename: `loho-stroke.png`.

---

## Layout & spacing

| Token | Value |
|---|---|
| Max content width | `1280px` (`.container-custom`) |
| Outer padding | `--spacing-md` (16px) via container |
| Breakpoints (design) | xs 360 · sm 640 · md 768 · lg 1024 · xl 1280 |

Whitespace should feel generous against the monochrome palette.

---

## Motion

- Durations: 120 / 200 / 320ms
- Hero scroll arrow: `.animate-scroll-arrow`
- Global `prefers-reduced-motion: reduce` block in `globals.css` kills animations/transitions and scroll-behavior

When adding motion: respect reduced-motion; keep motion purposeful (presence/hierarchy), not decorative noise.

---

## Focus & accessibility

- Focus rings: **3px solid orange** (`--shazamat-orange`) on links, buttons, inputs
- Skip links: `SkipLinks` → `#main-content`
- Contrast: black/white pairs; secondary text helpers `--text-contrast-min` / `--text-contrast-secondary`
- Interactive controls need Hebrew `aria-label`s where icons alone are shown

---

## Brand CSS utilities

| Class | Purpose |
|---|---|
| `.container-custom` | Centered max-width container |
| `.noise-overlay` | SVG noise via `::before` |
| `.grain-texture` | Grain blend |
| `.grunge-overlay` | Speckle / grit layers (UpcomingShow aesthetic) |
| `.rough-edge` / `.rough-border` | Clip-path edge treatment |
| `.text-grunge-shadow` | Heavy outlined text shadow |
| `.video-background` | Full-bleed cover video positioning |
| `.sr-only` | Screen-reader only |
| `.skip-link(s)` | Accessibility skip navigation |

---

## Buttons (design intent vs code)

`design.json` defines primary / secondary / ghost with orange primary hover → black.

In practice:

- **Public site:** mostly custom Tailwind/CSS in sections (and some CTAs currently commented out in Hero).
- **Admin:** orange primary (`bg-orange-500`), zinc dark surfaces — not the public CSS variables.
- shadcn `button.tsx` exists but is barely used (mainly dialog close).

When adding public CTAs, follow design.json primary (orange bg, black text, bold) unless matching a nearby existing pattern.

---

## Imagery guidelines

- Prefer B&W live / crowd / performance shots, high contrast
- Orange as UI accent overlays, not as a second photo grade
- Subtle grain is on-brand
- Avoid polished stock, low-contrast gray-on-gray
- Show covers: uploaded WebP via admin (Blob) or local `/…` paths (`unoptimized` used for local paths in places)

Remote images allowed: `*.public.blob.vercel-storage.com` (`next.config.ts`).

---

## Admin visual language

Separate from public brand tokens:

- Background: `zinc-950`
- Borders: `zinc-800`
- Accent: `orange-500`
- Text: `zinc-100` / muted `zinc-400–500`
- Toasts: Sonner `theme="dark"`, `position="bottom-left"`

Keep admin usable and dense; do not force grunge/noise textures into CMS forms.

---

## RTL checklist for UI work

- Root and admin layouts set `dir="rtl"`
- Logical spacing: prefer `ms`/`me`/`ps`/`pe` or rely on RTL-aware Tailwind where possible; existing code often uses physical `left`/`right` — match surrounding code carefully
- Force `dir="ltr"` on URL inputs (ticket links) so URLs edit naturally
- Icons that imply direction (chevrons, arrows) may need mirroring — check visually
- Hebrew copy for user-facing strings and Zod errors

---

## Changing the design system

1. Update CSS variables in `globals.css` if the change is runtime.
2. Update `design.json` if documenting brand intent.
3. Grep for hardcoded `#db7738` / `orange-500` / hex blacks so public + admin stay coherent where intended.
4. Do **not** introduce a second accent color.
