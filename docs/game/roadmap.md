# Game Roadmap

Phase-by-phase progress tracker. Update this file when a phase is complete or when priorities shift.

The concept doc at [`shazamat-life-simulator-concept.md`](./shazamat-life-simulator-concept.md) defines the full vision. This doc tracks implementation status.

---

## Phase 0 — Infrastructure ✅ COMPLETE

**Goal:** Build the pipe. A fresh agent can add content by dropping files, not by rewriting the engine.

### Completed

- [x] Zod schema for every game primitive (`ContentPack`, `GameEvent`, `GameState`, `Effect`, `Condition`, `SpriteLoadout`, …)
- [x] Pure seeded engine: `createRun`, `selectNextEvent`, `applyChoice`, `advanceStage`, `resolveEnding`
- [x] Mulberry32 seeded RNG — no `Math.random()` in the engine
- [x] Condition evaluator: `all` / `any` / `not` / flag / stat / affinity / stage / seenEvent
- [x] Effect system: stat, affinity, setFlag, spriteSet, advanceStage, gotoEvent
- [x] 14 Vitest unit tests (`npm run game:test`)
- [x] Content integrity validator (`npm run game:validate`): unique ids, file refs, copy, canonical member ids
- [x] Content pack: 7 members with Hebrew copy, 2 stats (מוזיקליות + סוואג), 2 stages (ילדות + בית ספר)
- [x] 4 playable events: choice event, roll event, requires-flag gate event, sprite mutation
- [x] Placeholder pixel-art PNGs generated for all sprite parts, scenes, member portraits
- [x] Prisma `Subscriber` + `GameRun` models, migration applied
- [x] Server actions: `startRun`, `checkpointRun`, `completeRun`, `getCompletedRun`
- [x] Route `/life` with isolated layout + game CSS (no band site contamination)
- [x] Route `/life/r/[runId]` — RSC share page
- [x] OG images: static for `/life`, dynamic per-run for share pages (Satori)
- [x] JSON-LD `VideoGame` schema on `/life`
- [x] Sitemap entry for `/life`
- [x] Nav link "החיים" → `/life` (quiet, not dominant)
- [x] Middleware rewrite: `life.shazamat.com` → `/life` (enable via Vercel domain + CNAME)
- [x] Hebrew RTL, mobile-first, safe-area insets, 48px min touch targets
- [x] HUD (age + stat bars), layered SpritePortrait compositor, EventCard, OutcomeDisplay, StageClear, EndingScreen
- [x] CSS-only animations: stat delta pop, fade-in, `prefers-reduced-motion` respected
- [x] Share button: `navigator.share` → clipboard → WhatsApp fallback
- [x] Email consent checkbox (Israeli privacy)
- [x] Debounced checkpoint after each event
- [x] Game documentation: README, architecture, content-authoring, roadmap

### Explicitly out of scope for Phase 0

- More than 2 life stages
- Real pixel-art (all placeholders)
- Rare/ultra-rare events
- Song/lyric/inside-joke references
- Sound effects (audio stub exists, is no-op)
- Screen-shake or canvas animations
- Shuni ticket CTA
- Admin CMS for game content
- LLM-generated recap prose
- Analytics dashboard

---

## Phase 1 — First Real Game

**Goal:** A game worth sharing. Real copy, real art for all 7 stages.

### Content bible ✅ COMPLETE

- [x] Full 7-stage event map written and reviewed by Aviad — [`docs/game/content-bible.md`](./content-bible.md)
- [x] All event cards drafted with Hebrew copy, affinity routing, flags, and song lore tags
- [x] Flag catalog documented
- [x] Member routing spine locked
- [x] Tone guidance written for sensitive stories (שי, גדעון, ריף)
- [x] **Needs Aviad resolved (2026-09-01):** 5 of 6 questions answered; answer-button jokes deferred (see "Needs Aviad" in bible)

### Content implementation ✅ COMPLETE

- [x] Delete 4 placeholder events in `src/game/content/events/`
- [x] Replace `src/game/content/stages.ts` with 7 real stages from the bible
- [x] Implement childhood events: `childhood-kookilida`, `childhood-ola`
- [x] Implement school events: `school-haver-mevi-haver`, `school-hayom-ani-lo`, `school-tahushat-beten`, `school-sheva-lev-adom`, `school-yeled-maniac`, `school-siahat-litufim` (rare)
- [x] Implement army events: `army-hayda-nitzhonot`, `army-pesek-zman`, `army-rak-litzok`, `army-hitoreinu-meuhar`
- [x] Implement trip events: `trip-tofes-avir`, `trip-mayim-amukim`, all 5 destination color cards, `trip-allen-carr`, `trip-mi-yachol-alay` (rare)
- [x] Implement home events: `home-shirat-hamitparnasim`, `home-ashkenazi-betahana`, `home-rak-litzok-payoff`, `home-shum-davar-hadash`, `home-haverim-arsim`
- [x] Implement career events: `career-achshav-ze-hazman`, `career-tohnit-halive`, `career-blaadenu-en-mishak`, `career-harry-potter` (rare)
- [x] Implement shazamat events: `shazamat-koza-nostra`, `shazamat-toskana`, `shazamat-habayta`, `shazamat-heyterim`, `shazamat-sheva-raot-tovot`, `shazamat-lo-oto-davar`
- [x] Implement מה עם שאזאמאט rare arc (5 variants, `seenMaIm` gate)

### Art

Brief and full file list: [`docs/game/sprite-guide.md`](./sprite-guide.md).

- [ ] Generate real 64×64 looks from `look-adult` (child, teen, soldiers, trip, career, shazamat, jobs)
- [ ] Real scene backgrounds for: childhood-bedroom, school-stage, school-practice-room, school-classroom, army-base
- [ ] Real member portraits (96×96) for all 7 members

### Audio (optional but high-impact)

- [ ] Implement `src/game/audio/index.ts` (currently no-op)
- [ ] Add `stat-up.mp3`, `stat-down.mp3`, `choice-select.mp3`, `stage-clear.mp3`
- [ ] Drop files in `public/game/sfx/`

### Polish

Motion, timing, and feel are specified in [`docs/game/ux-plan.md`](./ux-plan.md). Do not invent new durations — use that document's tokens and phase checklists.

- [x] Screen-shake CSS animation for bad outcomes (UX-1: `.game-shake` on `.game-surface`, decaying 220ms, fires on delta ≤ −8)
- [ ] Sprite expression swap on outcome (happy/worried face)
- [x] Loading state for email gate → replaced by UX-4 assemble theater (900ms three-line sequence, never a spinner)
- [x] Better ending screen animation (member portrait appears with a pop) — full UX-5 ending show: beat ceremony, name slam, portrait pop, count-up, gated Share, New Life pulse

---

## Phase 2 — Full Life Arc

**Goal:** Enough events per stage that players get meaningfully different runs on replay.

> All 7 stages and their initial event pools are defined in [`docs/game/content-bible.md`](./content-bible.md). Phase 1 implements one pool per stage. Phase 2 deepens each pool.

### Deepen event pools

| Stage | Phase 1 pool | Phase 2 target |
|---|---|---|
| childhood | 2–3 | 5 |
| school | 5–6 | 8 |
| army | 3–4 | 6 |
| טיול | 4 + 5 destination cards | 6 + destination variants |
| בחזרה לארץ | 4–5 | 7 |
| הקריירה | 3–4 | 6 |
| שאזאמאט | 5–6 | 8 |

### Rare/ultra events

- [ ] At least 5 rare events across all stages (already drafted: `trip-mi-yachol-alay`, `career-harry-potter`, `school-siahat-litufim`, מה עם שאזאמאט arc)
- [ ] At least 2 ultra-rare events (~3%) for superfan discovery
- [ ] Example ultra-rare: "You accidentally played the correct note at soundcheck"

---

## Phase 3 — Virality and Polish

**Goal:** Make it impossible not to share. Optimize the "New Life" rate.

### Share experience

- [ ] Auto-generate a beautiful share image (beyond the current Satori OG)
- [ ] WhatsApp story card format (1080×1920)
- [ ] Instagram stories export button
- [x] The share text should feel like the punchline: "חייתי חיים שלמים והפכתי ל[name]. מה הפכת?"

### Shuni CTA

- [ ] Add Shuni ticket CTA to the ending screen as the final punchline
- [ ] "כל הכבוד. אתה רשמית בשאזאמאט. יש לכם הופעה בשוני ב-26 בספטמבר. כדאי שתגיע."
- [ ] GET TICKETS → button

### Replay hooks

- [ ] Track "New Life" rate (% who press restart immediately)
- [ ] If <20% replay → add one more ending variant or a joke about replaying
- [ ] "New Life" button is prominent at the end

### Analytics

- [ ] Simple count dashboard: endings per member, daily runs, completion rate
- [ ] Query is already possible: `SELECT memberId, COUNT(*) FROM GameRun WHERE completedAt IS NOT NULL GROUP BY memberId`
- [ ] Add a `/admin/game` page with basic stats (no fancy charts needed)

---

## Phase 4 — CMS and Scale

**Goal:** Non-developer content updates. Aviad adds an event without touching code.

### Admin CMS for game content

- [ ] `/admin/game/events` — list + edit events
- [ ] `/admin/game/events/new` — create event with the same Zod schema (same fields as the TS format)
- [ ] Events stored in a new `GameEvent` Prisma model (same shape as the TypeScript schema)
- [ ] Engine reads from DB instead of static TypeScript (or merges both)
- [ ] Validate on save (server-side Zod parse)

### Content versioning

- [ ] `GameRun.contentVersion` already stored — use it to handle breaking content changes gracefully
- [ ] Old runs on the share page use the content version they were played with

---

## Ongoing / Evergreen

These have no phase — they can be done anytime:

- [ ] A/B test email gate copy
- [ ] Add more flags to the Known Flags Catalog in `content-authoring.md`
- [ ] Add Vitest tests for new engine behavior when added
- [ ] Update member ending blurbs with specific run-based details (currently generic)
- [ ] Localization: English version for non-Hebrew speakers? (low priority)
- [ ] Accessibility audit: keyboard navigation through choices, aria-live for stat changes
