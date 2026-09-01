# Shazamat Life Simulator — Agent Entry Point

Read this first before touching anything under `src/game/`, `src/app/life/`, `src/lib/game/`, or the `public/game/` assets.

For the band website (nav, homepage, admin CMS, Prisma), read [`docs/frontend/README.md`](../frontend/README.md) and [`docs/cms/README.md`](../cms/README.md).

---

## Table of Contents

1. [What this is](#what-this-is)
2. [The design principle](#the-design-principle)
3. [Stack and key decisions](#stack-and-key-decisions)
4. [15-minute orientation](#15-minute-orientation)
5. [Doc map](#doc-map)
6. [Directory map](#directory-map)
7. [Route map](#route-map)
8. [Data flow](#data-flow)
9. [Environment variables](#environment-variables)
10. [Scripts](#scripts)
11. [Where to start for common tasks](#where-to-start-for-common-tasks)
12. [What Phase 0 does NOT include yet](#what-phase-0-does-not-include-yet)

---

## What this is

**Shazamat Life Simulator** (שאזאמאט: החיים) is a Hebrew, mobile-first, browser life-simulation game at `/life`.

The player lives an entire life as an Israeli musician — childhood, school, army, travel, music career — and their accumulated choices determine which of the seven Shazamat band members they become.

It is simultaneously:
- a replayable game (seeded RNG → different outcomes each run)
- a Shazamat trivia machine (decisions mirror real band member histories)
- an email collection funnel → mailing list → ticket CTA

The concept document lives at [`docs/game/shazamat-life-simulator-concept.md`](./shazamat-life-simulator-concept.md). Read it before writing any content.

---

## The design principle

**Decisions mutate state. The engine selects future events based on that state.**

There is no giant branching tree. Every event is a card drawn from a pool filtered by the current stage and the player's accumulated flags, stats, and affinities. Adding content never requires touching the engine.

The seven hidden "Shazamat affinity" scores drive the ending. Players never see them. The result feels personally meaningful because the choices are based on real events from the band members' lives.

---

## Stack and key decisions

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router | Same app as the band site |
| Game logic | Pure TypeScript (no Phaser/Pixi) | RTL + iterative MVPs would fight a game engine |
| Schema | Zod | Build-time validation of all content |
| Content format | TypeScript files | Validated at build time, reviewed in PRs, CMS-ready later |
| DB | Prisma + Neon Postgres | Subscriber emails + run snapshots for share pages |
| Sprites | Layered PNGs, `image-rendering: pixelated` | Drop-in artist workflow, no runtime generation |
| RNG | Mulberry32 seeded | Reproducible runs for debugging and "same life" share |
| CSS | Isolated `game.css` in `/life` layout | Band site is untouched |
| Language | Hebrew throughout | `lang=he`, `dir=rtl` inherited from root layout |

**Do not** add Phaser, Pixi, or any canvas rendering library. The layered PNG compositor works without them.

**Do not** server-render game state. The game is a client island (`GameShell` is `"use client"`). Only the share page (`/life/r/[runId]`) is an RSC.

**Do not** use `Math.random()` inside the engine. Always pass an `Rng` created from the seed.

---

## 15-minute orientation

Read these files in order:

1. [`docs/game/shazamat-life-simulator-concept.md`](./shazamat-life-simulator-concept.md) — the full vision
2. [`src/game/schema/index.ts`](../../src/game/schema/index.ts) — every Zod type (5 min scan)
3. [`src/game/content/pack.ts`](../../src/game/content/pack.ts) — the assembled content pack (see what's in it)
4. [`src/game/engine/engine.ts`](../../src/game/engine/engine.ts) — `createRun`, `selectNextEvent`, `applyChoice`, `resolveEnding`
5. [`src/game/ui/GameShell.tsx`](../../src/game/ui/GameShell.tsx) — the single client orchestrator
6. [`src/lib/game/actions.ts`](../../src/lib/game/actions.ts) — `startRun`, `checkpointRun`, `completeRun`
7. Skim [`docs/game/architecture.md`](./architecture.md) for the data flow diagram

Then run:

```bash
npm run game:test      # 14 engine unit tests
npm run game:validate  # content integrity check
```

Both should pass before and after any change.

---

## Doc map

| Doc | Use when |
|---|---|
| **[README.md](./README.md)** (this file) | First thing to read |
| [architecture.md](./architecture.md) | Understanding the engine, state machine, RNG, and data flow |
| [content-authoring.md](./content-authoring.md) | Adding events, stages, sprite parts, members — the day-to-day work |
| [roadmap.md](./roadmap.md) | What's built, what's next, phase definitions and progress |
| [shazamat-life-simulator-concept.md](./shazamat-life-simulator-concept.md) | Original design document — tone, philosophy, examples |

---

## Directory map

```
src/game/
├── schema/
│   ├── members.ts       # MemberId union, MemberSchema, MEMBER_IDS const
│   ├── stats.ts         # StatDef (id, label, emoji, min/max/initial)
│   ├── sprites.ts       # SpriteLayer, SpritePart, Scene, SpriteLoadout, SpriteCatalog
│   ├── conditions.ts    # Condition (all/any/not/flag/stat/affinity/stage/seenEvent)
│   ├── effects.ts       # Effect (stat/affinity/setFlag/spriteSet/spriteAdd/goto/…)
│   ├── events.ts        # GameEvent, Choice, RollOutcome — the card unit
│   ├── stages.ts        # Stage (id, label, ageLabel, eventCount, onEnter effects)
│   ├── pack.ts          # ContentPack — the assembled game data
│   ├── state.ts         # GameState — everything that changes during a run
│   └── index.ts         # Re-exports all of the above
│
├── engine/
│   ├── rng.ts           # createRng() — mulberry32 seeded RNG. NEVER use Math.random()
│   ├── conditions.ts    # evaluateCondition(cond, state) → boolean
│   ├── effects.ts       # applyEffects(effects, state, pack) → ApplyResult
│   ├── engine.ts        # createRun / selectNextEvent / applyChoice / advanceStage / resolveEnding
│   ├── engine.test.ts   # Vitest unit tests (run: npm run game:test)
│   └── index.ts         # Re-exports
│
├── content/
│   ├── members.ts       # 7 Member objects with Hebrew copy
│   ├── stats.ts         # [musicianship, swag] StatDef array
│   ├── stages.ts        # [childhood, school, …] Stage array
│   ├── sprites.ts       # SpriteCatalog manifest (part id → file path)
│   ├── sfx.ts           # SfxCatalog (ids only — audio is a no-op in Phase 0)
│   ├── pack.ts          # Assembles everything into ContentPack
│   └── events/
│       ├── childhood/
│       │   ├── first-instrument.ts
│       │   └── talent-show.ts
│       └── school/
│           ├── band-tryout.ts   # requires: hadFirstInstrument flag
│           └── music-class.ts
│
├── audio/
│   └── index.ts         # playSfx(), playMusic() — no-ops in Phase 0
│
├── ui/
│   ├── GameShell.tsx    # "use client" orchestrator — the only stateful component
│   ├── TitleScreen.tsx  # Title + start button
│   ├── EmailGate.tsx    # Email + consent form
│   ├── Hud.tsx          # Age label + stat bars (top of viewport)
│   ├── SpritePortrait.tsx # Layered PNG compositor + scene background
│   ├── EventCard.tsx    # Event copy + choice buttons
│   ├── OutcomeDisplay.tsx # Post-choice outcome + stat deltas + continue button
│   ├── StageClear.tsx   # Between-stage transition screen
│   └── EndingScreen.tsx # Member reveal + recap + share button
│
└── validate.ts          # Integrity checks run by npm run game:validate

src/app/life/
├── layout.tsx           # Isolated game layout (imports game.css, no Header/Footer)
├── page.tsx             # Renders <GameShell /> + JSON-LD VideoGame
├── game.css             # All game styles — isolated, not shared with band site
├── opengraph-image.tsx  # Static OG for /life (Satori — all divs need display:flex)
└── r/[runId]/
    ├── page.tsx         # RSC share landing page
    └── opengraph-image.tsx  # Per-run OG image (member name + stats)

src/lib/game/
└── actions.ts           # startRun / checkpointRun / completeRun / getCompletedRun

public/game/
├── sprites/
│   ├── body/            # body-child.png, body-teen.png, …
│   ├── pants/
│   ├── shirt/
│   ├── hair/
│   ├── accessory/
│   ├── instrument/
│   └── expression/
├── scenes/              # Background images (160×144 px)
├── members/             # Per-member ending portraits (96×96 px)
├── sfx/                 # (empty in Phase 0 — drop mp3s here later)
└── ui/                  # HUD icons, button textures (not yet used)

prisma/schema.prisma     # Subscriber + GameRun models (added in Phase 0)
```

---

## Route map

| Route | File | SSR/Static | Role |
|---|---|---|---|
| `/life` | `src/app/life/page.tsx` | Static | Renders `<GameShell>` (client island) |
| `/life/opengraph-image` | `src/app/life/opengraph-image.tsx` | Static | Satori OG card for `/life` |
| `/life/r/[runId]` | `src/app/life/r/[runId]/page.tsx` | Dynamic RSC | Share landing page |
| `/life/r/[runId]/opengraph-image` | `src/app/life/r/[runId]/opengraph-image.tsx` | Dynamic | Per-run OG image |

Play state is entirely client-side. The URL does **not** change while playing — only `/life` and `/life/r/[runId]` are real routes. No back-button hell.

Subdomain: `life.shazamat.com` → middleware rewrites to `/life`. To enable it: add the domain in Vercel + a CNAME. Zero code changes needed.

---

## Data flow

```
/life  (static)
  └── <GameShell> (client)
        │
        ├── TitleScreen → EmailGate
        │     └── startRun() [server action]
        │           └── upsert Subscriber + create GameRun → returns { runId, seed }
        │
        ├── createRun(runId, seed, pack) → initial GameState
        │
        ├── selectNextEvent(state, pack, rng) → GameEvent | stage-clear | ending
        │
        ├── <EventCard> — user picks a choice
        │     └── applyChoice(state, event, choiceId, rng, pack) → { state, outcomeLabel, statDeltas }
        │           └── checkpointRun(runId, state) [debounced, fire-and-forget]
        │
        └── resolveEnding(state, pack) → MemberId
              └── completeRun(runId, state, memberId) [server action]
                    └── GameRun.memberId set, GameRun.completedAt set
                          └── returns shareUrl: /life/r/[runId]

/life/r/[runId]  (dynamic RSC)
  └── getCompletedRun(runId) → CompletedRunData
        └── Renders recap + member reveal + "Start your life" CTA
              └── opengraph-image.tsx → unique OG card per run (WhatsApp unfurl)
```

---

## Environment variables

The game uses the same `DATABASE_URL` as the rest of the site (Neon Postgres). No additional environment variables are required for Phase 0.

| Variable | Used by |
|---|---|
| `DATABASE_URL` | `startRun`, `checkpointRun`, `completeRun`, `getCompletedRun` |
| `NEXT_PUBLIC_SITE_URL` | Share URL construction |

---

## Scripts

```bash
npm run game:test      # Run Vitest unit tests for the engine
npm run game:validate  # Check content integrity (sprite refs, event ids, copy, affinities)
npm run dev            # Start dev server — game is at http://localhost:3000/life
npm run build          # Full production build (includes prisma generate)
```

Run `game:validate` after every content change. Run `game:test` after any engine change.

---

## Where to start for common tasks

| Task | Start here |
|---|---|
| Add a new life event | [`docs/game/content-authoring.md`](./content-authoring.md#adding-an-event) |
| Add a new life stage | [`docs/game/content-authoring.md`](./content-authoring.md#adding-a-stage) |
| Add a sprite part or scene | [`docs/game/content-authoring.md`](./content-authoring.md#adding-sprite-parts) |
| Replace placeholder art with real art | [`docs/game/content-authoring.md`](./content-authoring.md#replacing-placeholder-art) |
| Change how an event is selected | [`src/game/engine/engine.ts`](../../src/game/engine/engine.ts) → `selectNextEvent` |
| Change how affinities determine the ending | `resolveEnding` in same file |
| Add a new stat (e.g. "freier score") | Add to `src/game/content/stats.ts`, reference in events |
| Add a new visible screen (e.g. recap carousel) | New component in `src/game/ui/`, integrate in `GameShell.tsx` |
| Add real audio | Implement `src/game/audio/index.ts` (no-op today) + drop mp3s in `public/game/sfx/` |
| Add admin CMS for events | New `/admin/game/*` pages; use `ContentPack` Zod schema as the DB shape |
| Enable `life.shazamat.com` subdomain | Add domain in Vercel dashboard + CNAME — middleware already handles the rewrite |
| Add Shuni ticket CTA on ending | `src/game/ui/EndingScreen.tsx` — add after `game-share-actions` |
| Enable LLM-generated recap | `completeRun` server action → call AI SDK before saving |
| Wire real email sending | `startRun` server action → call your email provider after `upsert` |

---

## What Phase 0 does NOT include yet

These are deliberate omissions — the infrastructure supports them but they are not implemented:

- More than 2 life stages (childhood + school). Army, post-army trip, early adulthood, music career, Shazamat are not yet written.
- Real pixel-art (all sprites are placeholder colored blocks)
- Rare and ultra-rare events
- Song/lyric/inside-joke references in event copy
- Real sound effects
- Screen-shake, canvas-based animations beyond CSS
- Shuni ticket CTA on the ending screen
- Admin CMS for managing events without code changes
- LLM-generated personalized recap prose
- Analytics dashboard (run count per member, conversion rate; but raw data is in `GameRun` table)
- WhatsApp/Instagram story share image formatting
