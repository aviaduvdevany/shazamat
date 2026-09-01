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
- [x] Effect system: stat, affinity, setFlag, spriteSet, spriteAddAccessory, spriteRemoveAccessory, advanceStage, gotoEvent
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

**Goal:** A game worth sharing. Real copy, real art for the two existing stages, plus the army stage.

### Content

- [ ] Audit and enrich `childhood-first-instrument` event (Shazamat-specific references)
- [ ] Audit and enrich `childhood-talent-show` event
- [ ] Audit and enrich `school-band-tryout` and `school-music-class`
- [ ] Add 2–4 more childhood events (total ~5)
- [ ] Add 2–4 more school events (total ~5)
- [ ] Add army stage (`stages.ts`) with events:
  - [ ] `army-nahal-or-golani` (Nahal vs Golani — Shay real history)
  - [ ] `army-base-musician` (band in the army? — affects musicianship)
  - [ ] `army-combat-leave` (how do you spend leave?)
  - [ ] At least one rare army event

### Art

- [ ] Commission/create real 64×64 pixel-art sprite parts for: body-child, body-teen, body-soldier
- [ ] Real scene backgrounds for: childhood-bedroom, school-stage, school-practice-room, school-classroom, army-base
- [ ] Real member portraits (96×96) for all 7 members

### Audio (optional but high-impact)

- [ ] Implement `src/game/audio/index.ts` (currently no-op)
- [ ] Add `stat-up.mp3`, `stat-down.mp3`, `choice-select.mp3`, `stage-clear.mp3`
- [ ] Drop files in `public/game/sfx/`

### Polish

- [ ] Screen-shake CSS animation for bad outcomes
- [ ] Sprite expression swap on outcome (happy/worried face)
- [ ] Loading state for email gate → prettier spinner
- [ ] Better ending screen animation (member portrait appears with a pop)

---

## Phase 2 — Full Life Arc

**Goal:** All 8 life stages. Enough events that players get meaningfully different runs.

### Stages to add (after army)

- [ ] `post-army-trip` — travel destinations (India, South America, East Asia, US)
  - [ ] India-specific events (classic Shazamat)
  - [ ] "Suspicious stranger" roll event (from concept doc)
  - [ ] Rare: bad trip → trip ends early (advanceStage effect)
- [ ] `early-adulthood` — coming back to Israel, what now
- [ ] `music-career` — first gigs, recording, grinding
- [ ] `shazamat` — the band forms; ending events that set up the final reveal

### Target event counts

| Stage | Min events | Target |
|---|---|---|
| childhood | 4 | 8 |
| school | 4 | 8 |
| army | 3 | 6 |
| post-army-trip | 4 | 10 |
| early-adulthood | 3 | 6 |
| music-career | 3 | 6 |
| shazamat | 2 | 4 |

### Rare/ultra events

- [ ] At least 5 rare events (5–15% probability) across all stages
- [ ] At least 2 ultra-rare events (~3%) for superfan discovery
- [ ] Examples: "You accidentally played the right note at soundcheck", a specific lyric reference

### Shazamat song lore

- [ ] Identify 5–10 song/lyric references to weave into event copy
- [ ] They should not feel like ads — just part of the universe

---

## Phase 3 — Virality and Polish

**Goal:** Make it impossible not to share. Optimize the "New Life" rate.

### Share experience

- [ ] Auto-generate a beautiful share image (beyond the current Satori OG)
- [ ] WhatsApp story card format (1080×1920)
- [ ] Instagram stories export button
- [ ] The share text should feel like the punchline: "חייתי חיים שלמים והפכתי ל[name]. מה הפכת?"

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
