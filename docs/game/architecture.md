# Game Architecture

How the engine works, how state flows, how the RNG produces deterministic outcomes, and where the seams are for future extension.

---

## The three-layer model

```
ContentPack  (static data, validated at build time)
     │
     ▼
Engine       (pure functions, no React, no side effects)
     │
     ▼
GameShell    (React client island, drives UI, calls server actions)
```

These layers never cross upward. The engine never imports React. The UI never manipulates state directly — it always calls an engine function and gets back a new immutable `GameState`.

---

## ContentPack

`ContentPack` is the compiled game data. It is assembled in `src/game/content/pack.ts` and imported directly by the client. There is no API call to fetch it.

```ts
ContentPack {
  version: number          // bump when schema breaks; stored in GameRun for migration
  members: Member[]        // 7 endings
  stats: StatDef[]         // visible stats (musicianship, swag, …)
  stages: Stage[]          // ordered life stages
  events: GameEvent[]      // all event cards across all stages
  sprites: SpriteCatalog   // part id → file path manifest
  sfx: SfxCatalog          // sfx id list (no-op player in Phase 0)
}
```

Because `ContentPack` is client-side, superfans can inspect affinities. This is intentional — it's the Wu-Tang Name Generator energy. Do not move it server-side to "hide" it.

---

## GameState

`GameState` is the full snapshot of one player run. It is serializable to JSON (stored in `GameRun.state` in Postgres).

```ts
GameState {
  runId: string            // matches GameRun.id
  seed: number             // drives all randomness
  rngCursor: number        // advances with every random draw
  contentVersion: number   // matched against pack.version on resume

  stageIndex: number       // current stage in pack.stages
  eventsPlayedInStage: number

  stats: Record<string, number>       // musicianship, swag, …
  affinities: Record<string, number>  // aviad, itay, nimrod, shay, reef, nir, gidon
  flags: Record<string, string|number|boolean>  // open; use Flags catalog for autocomplete

  sprite: SpriteLoadout    // which complete look PNG is showing
  seenEventIds: string[]   // enforces oncePerRun

  log: LogEntry[]          // choice + outcome per event; drives recap text
  pendingEventId: string | null  // forces a specific follow-up event

  phase: "playing" | "outcome" | "stage-clear" | "ending"
  endingMemberId: MemberId | null
  completedAt: string | null
}
```

`GameState` is **immutable inside the engine** — every function returns a new object, never mutates.

---

## The engine functions

All in `src/game/engine/engine.ts`. All are pure.

### `createRun({ runId, seed, contentVersion }, pack) → GameState`

Initialises stats from `pack.stats[].initial`, sets all affinities to 0, applies `pack.stages[0].onEnter` effects (e.g. sets the child look).

### `selectNextEvent(state, pack, rng) → SelectResult`

```
SelectResult =
  | { type: "event"; event: GameEvent }
  | { type: "stage-clear" }
  | { type: "ending" }
```

Selection algorithm:

1. If `state.pendingEventId` is set → forced follow-up event.
2. If `eventsPlayedInStage >= stage.eventCount` → `stage-clear`.
3. Filter `pack.events` by: correct stage + `requires` condition passes + not in `seenEventIds` (if `oncePerRun`).
4. No candidates → `stage-clear` (exhausted).
5. Weight by `event.weight × rarityWeight[event.rarity]` (common 1×, rare 0.15×, ultra 0.03×).
6. `rng.weightedPick` → chosen event.

### `applyChoice(state, event, choiceId, rng, pack) → ChoiceOutcome`

1. Find choice by id. Throw if not found.
2. If `choice.roll` exists → `rng.weightedPick` from roll outcomes → selected outcome's effects.
3. Otherwise → `choice.effects`.
4. `applyEffects(effects, state, pack)` → mutated state copy.
5. Record event in `seenEventIds`. Append to `log`. Advance `rngCursor`. Handle `pendingGoto` and `advanceStage`.

### `advanceStage(state, pack) → GameState`

Increments `stageIndex`. If beyond last stage → `phase: "ending"`. Applies `onEnter` effects for the new stage (look swap, etc.).

### `resolveEnding(state, pack) → MemberId`

Finds the member with the highest affinity score. Ties broken by seeded RNG (cursor position 9999 — isolated from gameplay RNG).

---

## Seeded RNG

`src/game/engine/rng.ts` — mulberry32 algorithm.

```ts
createRng(seed, cursor) → { next(), nextInt(min, max), pick(arr), weightedPick(items) }
```

The `cursor` advances every time a random number is drawn during `applyChoice`. `GameState.rngCursor` tracks this across events.

`stateRng(state)` creates a fresh `Rng` positioned at the correct cursor for the current state — call it once per engine function, not once per session.

**Rule:** `Math.random()` is banned inside the engine. Lint or PR review should catch violations.

---

## Condition system

`src/game/schema/conditions.ts` — fully recursive.

```ts
Condition =
  | { type: "all"; conditions: Condition[] }   // AND
  | { type: "any"; conditions: Condition[] }   // OR
  | { type: "not"; condition: Condition }       // NOT
  | { type: "flag"; key; value? }              // flag present or equals value
  | { type: "stat"; id; min?; max? }           // stat in range
  | { type: "affinity"; memberId; min?; max? } // affinity in range
  | { type: "stage"; stageId }                 // current stage id
  | { type: "seenEvent"; eventId }             // event was seen this run
```

`evaluateCondition(cond, state)` in `src/game/engine/conditions.ts` is a pure recursive function.

Events use `requires` to gate their appearance. Choices can also use `requires` to hide specific options from the player.

---

## Effect system

`src/game/schema/effects.ts` — discriminated union, all handled in `applyEffects`.

| Effect type | What it does |
|---|---|
| `stat` | `stats[id] += delta` (clamped to min/max) |
| `affinity` | `affinities[memberId] += delta` (floor 0) |
| `setFlag` | `flags[key] = value` |
| `spriteSet` | Swaps the complete player look (`look-child`, `look-soldier-golani`, …) |
| `advanceStage` | Triggers stage advance immediately after this event |
| `gotoEvent` | Forces a specific event next (sets `pendingEventId`) |

---

## Sprite compositor

`src/game/ui/SpritePortrait.tsx` draws **one complete 64×64 look** over the scene. No paper-doll layers.

Grid contract: every look PNG is **64×64 px**. Displayed at **4× scale** via CSS (`width: 256px`, `image-rendering: pixelated`). Scene backgrounds are **160×144 px**.

The `SpriteCatalog` in `src/game/content/sprites.ts` maps every look id to a file path under `public/game/sprites/looks/`. The validator checks that every referenced file exists.

---

## Persistence

Two Prisma models (added in Phase 0 migration `20260901173637`):

```prisma
model Subscriber {
  email            String   @unique
  source           String   @default("game")  // "game" | "site"
  marketingConsent Boolean  @default(false)
  runs             GameRun[]
}

model GameRun {
  subscriberId   String?
  seed           Int
  contentVersion Int
  state          Json      // full GameState snapshot
  memberId       String?   // null until completeRun()
  completedAt    DateTime? // null until completeRun()
}
```

`GameRun.state` stores the entire `GameState` as JSONB. This means:
- Checkpoint-on-each-event → resume after refresh (not yet wired to UI, but `checkpointRun` exists)
- The full run is available for the share page RSC without recomputing
- Analytics: `SELECT memberId, COUNT(*) FROM GameRun WHERE completedAt IS NOT NULL GROUP BY memberId`

`GameRun.id` is the share slug (`/life/r/[id]`). It is a cuid.

---

## The share loop

```
GameShell completes run
  → completeRun(runId, state, memberId) [server action]
  → returns shareUrl: /life/r/[runId]

Player taps "שתף את התוצאה"
  → navigator.share({ text: "חייתי חיים שלמים והפכתי ל[name]! → shazamat.com/life" })
  → fallback: navigator.clipboard.writeText(...)
  → fallback: open WhatsApp wa.me/?text=...

Friend opens /life/r/[runId]
  → RSC: getCompletedRun(runId) → member + recap
  → Unique OG image: opengraph-image.tsx (Satori — every div needs display:flex explicitly)
  → CTA: "התחל חיים" → /life
```

The share URL is indexable but has `canonical: /life` so search engines consolidate authority on the game page, not on thousands of result pages.

---

## The screen state machine

Inside `GameShell`, the `screen` state drives which component renders:

```
title
  └──[user taps "התחל חיים"]──► email
                                  └──[server action OK]──► playing
                                                             │
                                          ┌──────────────────┘
                                          │
                                   user picks choice
                                          │
                                          ▼
                                       outcome
                                          │
                                   user taps "המשך"
                                          │
                            ┌─────────────┴─────────────┐
                            │                           │
                      (more events)               (stage done)
                            │                           │
                          playing                  stage-clear
                            │                           │
                            │                    user taps "המשך"
                            │                           │
                            └───────────(next stage)────┘
                                          │
                                  (last stage done)
                                          │
                                        ending
```

---

## Adding content vs changing the engine

| You want to | Files to touch |
|---|---|
| Add an event | New file in `src/game/content/events/[stage]/` + register in `pack.ts` |
| Add a stage | `src/game/content/stages.ts` + add events for it |
| Add a sprite part | `public/game/sprites/[layer]/[id].png` + one line in `sprites.ts` |
| Add a visible stat | `src/game/content/stats.ts` |
| Add a member (only if lineup changes) | `src/game/content/members.ts` + update `MEMBER_IDS` in schema |
| Change selection logic | `src/game/engine/engine.ts` → `selectNextEvent` |
| Change ending logic | `src/game/engine/engine.ts` → `resolveEnding` |
| Add a new effect type | `src/game/schema/effects.ts` + `src/game/engine/effects.ts` + tests |
| Add a new screen | New component in `src/game/ui/` + new `screen` value in `GameShell` |

The validator (`npm run game:validate`) must pass after every content change. Tests (`npm run game:test`) must pass after every engine change.
