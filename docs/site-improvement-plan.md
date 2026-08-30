# Shazamat site improvement plan

Action plan from the 18 Aug 2026 desktop + mobile audit. Goal: make shazamat.com the best Israeli band website without sanding off the grit (Emulsi, concert stills, orange, RTL Hebrew).

**Do not** restyle this into a generic dark landing page. Add jobs (listen, tickets, belong). Cut archive.

| Now | Target after this plan |
|---|---|
| Overall 6.4 | 8.5+ |
| Brand 8.5 | Keep |
| Conversion 4.5 | 8+ |
| Fan completeness 4.0 | 7.5+ |

If only one thing ships: **האזין + כרטיסים on the hero.**

---

## How to use this doc

- Phases are sequential. Finish a phase before starting the next.
- Each item lists **why**, **files**, **do**, **verify**.
- Check boxes in PRs. Do not open a “redesign everything” PR.

Related: public site composition in [`docs/frontend/public-site.md`](./frontend/public-site.md). Audit canvas: `shazamat-band-site-audit.canvas.tsx`.

---

## Phase 0 — Conversion honesty (week 1) ✓ shipped 18 Aug 2026

Unblock listen + tickets. Fix lies in the tour list. Nothing new is invented here.

### 0.1 Hero CTAs

**Why.** First fold is logo + four socials. Instagram traffic never hears בקטע טוב or sees שוני.

**Files.** `src/components/sections/Hero.tsx`, `src/data/social.ts` (or a small `src/data/campaign.ts` for the current Spotify + ticket URLs).

**Do.**

- Under the wordmark, two primary buttons: **האזין** (Spotify of בקטע טוב) and **כרטיסים** (featured show ticket, fallback `#upcoming-show`).
- Keep social icons, smaller, secondary.
- Pull the listen URL from the latest public album (`getPublicAlbums()[0].spotify`) so the CMS stays the source of truth. Hero can stay mostly static: pass the URL from a tiny async wrapper, or hardcode the campaign URLs in `campaign.ts` and update them with the album.

**Verify.** Desktop 1440 and iPhone 390: both CTAs fully visible below the logo, above the fold, tappable 44px+.

### 0.2 Stop skipping the money section

**Why.** `HeroScrollArrow` and nav **הופעות** target `#shows`. Featured Shuni lives in `#upcoming-show` and gets skipped.

**Files.** `src/components/ui/HeroScrollArrow.tsx`, `src/components/layout/nav.ts`.

**Do.**

- Arrow → `#upcoming-show` (fallback `#shows` if no featured show).
- Change הופעות `href` to `#upcoming-show`, **or** merge featured into the shows section so one `#shows` anchor includes the ticket block.

**Verify.** Click arrow and הופעות: first thing in view is the orange כרטיסים, not the faded July Barbie row.

### 0.3 Stop freezing `isPast`

**Why.** `getPublicShows` caches `isPast` inside `unstable_cache` with tags only. 15 Aug בית גוברין still looked live on 18 Aug.

**Files.** `src/lib/shows/queries.ts`, `src/components/ui/ShowCard.tsx`, `src/components/sections/Shows.tsx`.

**Do.**

- Cache raw show fields only. Compute `isPast` at render from the date (`src/lib/dates.ts` already has `isPastShow`).
- Optional: `revalidate: 3600` on the cache as a belt.
- In the list: upcoming first; past in a collapsed **הופעות שעברו** (or hide past by default).

**Verify.** A show whose date is yesterday is faded/hidden without an admin save. ISR 60s is not enough — this must work even if Data Cache is warm.

### 0.4 Dead כרטיסים buttons

**Why.** Upcoming shows with no `ticketLink` render an enabled button that does nothing.

**Files.** `src/components/ui/ShowCard.tsx`.

**Do.**

| State | Control |
|---|---|
| Upcoming + URL | `כרטיסים` link (current) |
| Upcoming + no URL | Text `בקרוב` or no control — never a fake button |
| Past | No ticket control. Optional `הסתיימה` |

**Verify.** כרמיאל / צאו בחוץ (no URL) do not look clickable.

### 0.5 Mobile album titles + no Vimeo on phones

**Why.** Year/title overlay is `hidden md:block`. Mid-scroll, covers have no name. Mobile still loads the desktop Vimeo iframe (`hidden` ≠ unmounted).

**Files.** `src/components/sections/Music.tsx`, `src/components/ui/HeroMedia.tsx`, `src/components/ui/VideoBackground.tsx`.

**Do.**

- Title + year under every cover on small screens (visible, not overlay-only).
- Mount `VideoBackground` only when `md+` (client `matchMedia`, or CSS is not enough — do not render the iframe below the breakpoint).

**Verify.** iPhone: every album shows its Hebrew title. Network panel: no `player.vimeo.com` on a 390px viewport.

**Phase 0 done when:** a new fan can listen and buy Shuni from the first screen; the tour list does not lie; the phone catalog is labeled. ✓

---

## Phase 1 — Campaign homepage (week 2)

Now that the funnel is honest, make the page a campaign for בקטע טוב / מכה בכנף instead of a visual archive.

### 1.1 Rewrite the music section

**Why.** Music is 5,597 px (~65% of the page). Six full-bleed covers. No in-page play.

**Files.** `src/components/sections/Music.tsx`, `src/components/ui/YearNav.tsx`, `src/components/ui/AlbumCard.tsx`, `src/components/ui/StreamingPlatforms.tsx`.

**Do.**

1. **Featured release** (latest album): large cover, title, year, `subtitle` from the DB (currently unused), Spotify embed **or** one primary Play, Apple as secondary.
2. **Catalog:** compact 2-up (desktop) / list (mobile). Cover thumbnail + title + year + stream icons. No 450px square per album.
3. Year nav: small chips, not `text-5xl` × 6 eating a viewport.

Keep the blur/grunge language on the featured block only.

**Verify.** Music section < ~1,800 px on desktop with 6 albums. First album Play is visible without scrolling past a year wall.

### 1.2 Featured show copy

**Why.** Poster says השקת אלבום / מכה בכנף. Type next to it only says אמפי שוני.

**Files.** `src/components/sections/UpcomingShow.tsx`. Admin: optional `subtitle` on Show, or reuse album title.

**Do.** Eyebrow or line under the venue: **השקת אלבום** / campaign name. Do not invent copy in CSS.

**Verify.** Someone who does not read the poster still knows this is the launch.

### 1.3 Live newsletter

**Why.** `Contact` + `NewsletterForm` exist and are unmounted. Submit is `console.log`. No owned audience.

**Files.** `src/app/page.tsx`, `src/components/sections/Contact.tsx`, `src/components/ui/NewsletterForm.tsx`, new API route.

**Do.**

- Mount Contact after Shows (before Music) or after Music — after tickets either way.
- Wire to a real list (Resend audience, Mailchimp, or Loops). No fake success.
- Visible error + success (not `sr-only` only).

**Verify.** A test address lands in the provider. Empty/invalid email fails in Hebrew.

### 1.4 RTL header chrome

**Why.** Logo on the left, menu on the right, 30px nav, hamburger never becomes X. LTR chrome on an RTL site.

**Files.** `src/components/layout/Header.tsx`, `src/components/layout/MobileNav.tsx`, `src/app/globals.css`.

**Do.**

- Shin logo on the **right** (RTL start). Hamburger on the left (end).
- Nav ~18–22px, not 30px.
- Open menu: icon swaps to X. Optional overlay.
- Optional: shrink/transparent bar after scroll.

**Verify.** Hebrew user instinct: brand on the right. Menu open state is obvious.

### 1.5 Footer that finishes the job

**Why.** About column is a title with no copy. © 2024. Facebook is Mulu Records. No streams.

**Files.** `src/components/layout/Footer.tsx`, `src/data/social.ts`.

**Do.**

- One-line bio + socials + Spotify/Apple.
- `new Date().getFullYear()` for copyright.
- Point Facebook at the band, or drop it until a band page exists.
- Repeat merch + email.

**Verify.** Footer is a close, not an empty three-column grid.

**Phase 1 done when:** the homepage is a campaign (new record + launch show + email), discography is browsable, chrome feels Hebrew-native.

---

## Phase 2 — Depth (week 3)

Identity and shareability. Do not start this while Phase 0/1 leaks conversion.

### 2.1 About

**Why.** Wikipedia exists. The site has no “who is this.” Seven faces on the poster, zero names.

**Files.** New `src/components/sections/About.tsx`, `src/app/page.tsx`, `src/components/layout/nav.ts`.

**Do.** One screen: two sentences of myth, seven named members, optional press quote. Still Emulsi, still black/white/orange. Nav: **עלינו**.

**Verify.** A Reels visitor can answer “who are they?” without leaving.

### 2.2 Watch

**Why.** Hero video is muted wallpaper. No official clip.

**Files.** New section or a block in About/Music. YouTube `@Shazamat`.

**Do.** One embed: official video or live excerpt. Not autoplay. Poster frame = still, not a gray box.

**Verify.** Play works on iOS Safari (no unexpected autoplay, controls visible).

### 2.3 Merch preview

**Why.** מרץ׳ dumps to merchadvice.com with no preview.

**Files.** `src/components/layout/nav.ts`, new `Merch` teaser, or 3 product stills + **לחנות**.

**Do.** Three products max, then the existing external URL. Do not rebuild a store.

**Verify.** Merch looks like Shazamat before the hop.

### 2.4 Shareable URLs + SEO

**Why.** Empty H1 (logo only, alt “Shazamat”). Generic meta. OG is the concert still, not the launch. No `/shows` or `/music` to share.

**Files.** `src/app/layout.tsx`, `src/components/sections/Hero.tsx`, `src/components/seo/StructuredData.tsx`, `src/app/sitemap.ts`, optional `src/app/shows/page.tsx` and `src/app/music/page.tsx` (or keep SPA hashes but give Google real paths).

**Do.**

- H1 accessible Hebrew text (visually hidden if the logo stays the visual h1).
- Title/description name **בקטע טוב** and **אמפי שוני** while that campaign is live.
- OG image = launch poster.
- Fix Apple Music `?l=vi` on בקטע טוב in admin.
- Event JSON-LD on real URLs if `/shows` exists.

**Verify.** View source: H1 text, OG image is the poster, description is campaign-specific.

### 2.5 Weight

**Why.** ~2.4–2.5 MB transfer. `next/image` quality warnings (35 / 80 / 85 not in `images.qualities`).

**Files.** `next.config.ts`, `HeroImageFallback.tsx`, `UpcomingShow.tsx`, `Music.tsx`.

**Do.**

- First fold budget **< 1 MB** (hero still + logo + CSS/JS).
- Configure `images.qualities`.
- Lazy-load catalog art; `priority` only on hero + featured show + featured album.
- Vimeo: Phase 0 already unmounts on mobile; on desktop load after idle/in-view.

**Verify.** Chrome Network, disable cache, 390px: first fold under 1 MB. Lighthouse mobile performance does not crater on the catalog.

**Phase 2 done when:** a new fan can belong (about + watch + email + merch preview), Google gets a campaign snippet, the phone is fast.

---

## Phase 3 — Optional polish (after the campaign)

Only if Phases 0–2 are live.

| Item | Note |
|---|---|
| Sticky mobile כרטיסים after featured | Recovers drop-off on long music scroll |
| `/shows/[id]` per event | Stronger Event schema + share cards |
| Press / EPK | PDF + high-res stills for bookers |
| Booking vs fan email | Split `mulu.records@gmail.com` if it mixes both |
| `StreamingPlatforms` | Component exists; buttons have no hrefs — delete or wire |
| Skip links | Add skip to `#upcoming-show` / `#music` |
| Admin: featured = nearest upcoming | Or warn when featured is later than a closer dated show |

---

## Suggested homepage order (after Phase 1)

1. Hero — wordmark + האזין + כרטיסים + socials
2. Featured show — launch ticket
3. Shows — upcoming honest list; past collapsed
4. Contact / newsletter
5. Music — featured release + compact catalog
6. About + Watch (Phase 2)
7. Merch teaser (Phase 2)
8. Footer

Edit order only in `src/app/page.tsx`.

---

## Guardrails

- Keep Emulsi, `#db7738`, grain, RTL. No Inter/generic dark UI.
- CMS remains source of truth for shows and albums. Do not hardcode tour dates in components (campaign CTAs may point at “latest album” / “featured show” queries).
- No new section until Phase 0 ticket/listen bugs are gone.
- Newsletter success must mean a real subscriber.

---

## Test plan (every phase)

Desktop 1440×900 and iPhone 390×844 (Safari if possible):

- [x] First fold: listen + tickets visible
- [x] Arrow / הופעות land on featured ticket
- [x] Past shows are not bookable
- [x] No-URL upcoming shows are not fake buttons
- [x] Mobile: album titles visible; no Vimeo request
- [ ] RTL: logo on the right (from Phase 1)
- [ ] Newsletter actually subscribes (from Phase 1)
- [ ] Reduced motion: hero video stays paused
- [ ] Keyboard: skip link, menu Escape, focus rings (orange already in `globals.css`)
