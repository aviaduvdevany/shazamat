# Content Authoring Guide

This is the document agents will use most. It covers adding events, stages, sprites, and members without touching the engine.

Always run `npm run game:validate` after any content change. It will catch broken file refs, missing copy, invalid member ids, and choices without effects.

---

## Adding an event

An event is one card in the game — a situation that happened, followed by choices.

### 1. Create the file

Place it in the correct stage folder:

```
src/game/content/events/[stage-id]/[slug].ts
```

Example: `src/game/content/events/army/nahal-or-golani.ts`

### 2. Write the event

```ts
import type { GameEvent } from "../../../schema/events";

export const nahalOrGolaniEvent: GameEvent = {
  id: "army-nahal-or-golani",      // unique across ALL events
  stage: "army",                    // must match a Stage.id
  weight: 1,                        // relative to other events in this stage
  rarity: "common",                 // "common" | "rare" | "ultra"
  oncePerRun: true,                 // almost always true

  scene: "army-base",              // optional — must exist in sprites.ts scenes
  mood: "tense",                   // "neutral"|"tense"|"funny"|"epic"|"sad"

  // Hebrew copy
  kicker: "גיל 18 — מרכז הגיוס",
  headline: "פרופיל 97. אתה הולך לקרבי.",
  body: "הקצין שואל לאן אתה מבקש. לפניך שני אוטובוסים.",

  choices: [
    {
      id: "nahal",
      label: "נח\"ל",
      effects: [
        { type: "affinity", memberId: "aviad", delta: 4 },
        { type: "affinity", memberId: "nimrod", delta: 4 },
        { type: "affinity", memberId: "itay", delta: 4 },
        { type: "setFlag", key: "armyUnit", value: "nahal" },
        { type: "spriteSet", layer: "shirt", partId: "shirt-army-nahal" },
      ],
    },
    {
      id: "golani",
      label: "גולני",
      effects: [
        { type: "affinity", memberId: "shay", delta: 8 },
        { type: "setFlag", key: "armyUnit", value: "golani" },
        { type: "spriteSet", layer: "shirt", partId: "shirt-army-golani" },
      ],
    },
  ],
};
```

### 3. Register it in the pack

Open `src/game/content/pack.ts` and add the import + the event to the `events` array:

```ts
import { nahalOrGolaniEvent } from "./events/army/nahal-or-golani";

export const pack: ContentPack = {
  // ...
  events: [
    // … existing events …
    nahalOrGolaniEvent,
  ],
};
```

### 4. Validate

```bash
npm run game:validate
```

It will confirm the stage exists, the event id is unique, all affinity member ids are canonical, all sprite/scene refs exist on disk, and all copy is non-empty.

---

## Event field reference

### Required fields

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique across the entire event pool. Convention: `[stage]-[slug]` |
| `stage` | `string` | Must match a `Stage.id` in `content/stages.ts` |
| `kicker` | `string` | Short context line (Hebrew). E.g. `"גיל 22 — גואה, הודו"` |
| `headline` | `string` | The event statement (Hebrew). Should read like something that happened, not a question |
| `choices` | `Choice[]` | At least one. Each must have `effects` OR `roll` (not neither) |

### Optional fields

| Field | Default | Notes |
|---|---|---|
| `weight` | `1` | Higher = more likely to be picked relative to peers |
| `rarity` | `"common"` | `"rare"` (~15% effective weight), `"ultra"` (~3%) |
| `oncePerRun` | `true` | Set to `false` for repeatable ambient events |
| `requires` | — | Condition gate. See condition reference below |
| `scene` | — | Background image id from the sprite catalog |
| `mood` | `"neutral"` | `"neutral"` `"tense"` `"funny"` `"epic"` `"sad"` |
| `body` | — | Additional paragraph below the headline |

---

## Choice field reference

Each choice in `choices[]`:

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique within the event |
| `label` | `string` | Button text (Hebrew) — keep short, thumb-friendly |
| `effects` | `Effect[]` | Applied immediately when this choice is picked |
| `roll` | `RollOutcome[]` | Randomly resolved instead of `effects`. Must not mix with `effects` |
| `requires` | `Condition` | If condition fails, choice is hidden from the player |

### Roll outcome

```ts
roll: [
  {
    weight: 2,
    label: "הצלחת! זה הלך מעולה.",     // shown to player after the roll
    effects: [{ type: "stat", id: "musicianship", delta: 15 }],
  },
  {
    weight: 1,
    label: "זה לא הלך.",
    effects: [{ type: "stat", id: "swag", delta: -5 }],
  },
],
```

Weight is relative. `2:1` → 66%/33%.

---

## Condition reference

Conditions gate whether an event appears or a choice is shown.

```ts
// Exact flag value
{ type: "flag", key: "armyUnit", value: "nahal" }

// Flag exists (any truthy value)
{ type: "flag", key: "hadFirstInstrument" }

// Stat in range
{ type: "stat", id: "musicianship", min: 30 }
{ type: "stat", id: "swag", max: 20 }

// Affinity in range
{ type: "affinity", memberId: "shay", min: 10 }

// Player has seen a specific event this run
{ type: "seenEvent", eventId: "childhood-first-instrument" }

// Logical combinators
{ type: "all", conditions: [condA, condB] }
{ type: "any", conditions: [condA, condB] }
{ type: "not", condition: condA }
```

---

## Effect reference

Effects are what a choice does to the game state.

```ts
// Visible stat (clamped to min/max)
{ type: "stat", id: "musicianship", delta: 10 }
{ type: "stat", id: "swag", delta: -5 }

// Hidden affinity (floor 0)
{ type: "affinity", memberId: "aviad", delta: 5 }

// Flag (open key-value; can be string, number, or boolean)
{ type: "setFlag", key: "travelDestination", value: "india" }
{ type: "setFlag", key: "tookDrug", value: true }

// Sprite: set a single layer
{ type: "spriteSet", layer: "body", partId: "body-soldier" }
{ type: "spriteSet", layer: "shirt", partId: "shirt-army-nahal" }

// Sprite: add an accessory (stacks, persists for the rest of the run)
{ type: "spriteAddAccessory", partId: "accessory-stupid-hat" }

// Sprite: remove an accessory
{ type: "spriteRemoveAccessory", partId: "accessory-stupid-hat" }

// Advance stage immediately (useful for "trip ended early" events)
{ type: "advanceStage" }

// Force a specific follow-up event next (queue it)
{ type: "gotoEvent", eventId: "post-army-trip-bad-ending" }
```

### Canonical member ids

Always use exactly these when writing affinity effects:

```
aviad  itay  nimrod  shay  reef  nir  gidon
```

The validator will catch typos.

### Canonical stat ids (Phase 0)

```
musicianship   swag
```

Adding a new stat: add it to `src/game/content/stats.ts`, then reference it in events.

---

## Writing good events

### The tone

Every event is something that **happened**, not a question:

```
✗ "מה אתה מעדיף לעשות?"
✓ "גרמת בטעות לשריפה קטנה בחדר החזרות."
```

The body paragraph is optional but useful for color:

```
kicker: "גיל 22 — גואה, הודו"
headline: "מישהו שנקרא פלוריאן אומר שיש לו 'חומר מצויין'."
body: "הוא נשמע אמין מאוד. הוא גם נראה כמו מישהו שמוכר ציוד גנוב בשוק."
```

### Use real Shazamat history

The decisions should mirror real events from the members' lives. Fans will recognize them. New players don't need to.

- Which army unit → most of Shazamat served in Nahal, Shay in Golani
- Post-army travel destinations → match the actual trips
- First instrument choices → match who plays what
- Inside references to songs, nicknames, albums

The concept doc has many examples. When in doubt, ask Aviad.

### Affinity calibration

A typical event should move 1–3 members by 2–8 points each. Big life decisions can go higher. Don't move all 7 members in one event — that flattens all runs to the same result.

Affinities should reflect personality, not just instrument. Ask: which member would have made this choice? Move them up. Which member would never make it? Leave them alone or nudge them slightly down (but the floor is 0).

---

## Adding a stage

### 1. Add the stage definition

In `src/game/content/stages.ts`:

```ts
{
  id: "army",
  label: "צבא",
  ageLabel: "גילאי 18–21",
  eventCount: 3,           // how many events to play before stage-clear
  onEnter: [
    { type: "spriteSet", layer: "body", partId: "body-soldier" },
    { type: "spriteSet", layer: "shirt", partId: "shirt-army-nahal" }, // default
  ],
},
```

Stages are played in array order. Insert the new stage at the correct position.

### 2. Create events for it

At least one event with `stage: "army"` must exist or the validator will fail.

### 3. Add sprite parts for the new life phase

See [Adding sprite parts](#adding-sprite-parts) below.

### 4. Validate

```bash
npm run game:validate
```

---

## Adding sprite parts

### 1. Create the PNG

- Sprite parts: **64×64 px** (or 128×128 for @2x)
- Scene backgrounds: **160×144 px**
- Member portraits: **96×96 px**
- Format: PNG with transparency
- Tool: Aseprite, Photoshop, or any pixel editor

Name the file with the layer prefix for clarity: `body-soldier.png`, `shirt-army-nahal.png`, `accessory-stupid-hat.png`.

### 2. Place the file

```
public/game/sprites/[layer]/[filename].png
public/game/scenes/[filename].png
public/game/members/[memberId]-portrait.png
```

### 3. Register in the catalog

Open `src/game/content/sprites.ts` and add one entry:

```ts
parts: [
  // … existing parts …
  {
    id: "body-soldier",
    layer: "body",
    file: "game/sprites/body/body-soldier.png",
    label: "גוף חייל",   // optional, for admin UI later
  },
],
```

For scenes:

```ts
scenes: [
  // … existing scenes …
  { id: "army-base", file: "game/scenes/army-base.png", label: "בסיס צבאי" },
],
```

### 4. Reference from an event

```ts
{ type: "spriteSet", layer: "body", partId: "body-soldier" }
// or as a scene:
scene: "army-base"
```

### 5. Validate

```bash
npm run game:validate
```

The validator checks every `part.file` and `scene.file` exists on disk at build time. Missing files fail the build.

---

## Replacing placeholder art

The full art brief — sizes, palette, alignment grid, prompts, and every filename — is [`docs/game/sprite-guide.md`](./sprite-guide.md). Hand that file to an external artist or generation agent.

Phase 0 shipped with colored block placeholders. Replacing them does not require any engine or code changes.

1. Create the real PNG at the exact dimensions (64×64 for parts, 160×144 for scenes, 96×96 for portraits).
2. Drop it at exactly the same path as the placeholder — e.g. `public/game/sprites/body/body-child.png`.
3. The game picks it up immediately on next load.
4. Run `npm run game:validate` to confirm.

---

## Adding a new member ending

Only needed if the band lineup changes. Seven is the current count.

1. Add the new id to `MEMBER_IDS` in `src/game/schema/members.ts`.
2. Add a `Member` object to `src/game/content/members.ts`.
3. Add an affinity entry with that id to `createRun` (it initialises from `pack.members` automatically).
4. Add a portrait PNG at `public/game/members/[id]-portrait.png`.
5. Update `src/game/content/sprites.ts` `memberPortraits` map.
6. Reference the new affinity id in events.
7. Validate.

---

## The known flags catalog

Flags are an open `Record<string, string | number | boolean>`. There is no enforcement, but known keys are documented here to avoid conflicts between events:

| Key | Type | Set by |
|---|---|---|
| `hometown` | `"north" \| "far-north" \| "center"` | `childhood-kookilida` |
| `joinedFirstBand` | `boolean` | `school-haver-mevi-haver` |
| `alwaysLate` | `boolean` | `school-hayom-ani-lo` |
| `romantic` | `boolean` | `school-sheva-lev-adom` |
| `seenMaIm` | `boolean` | any מה עם שאזאמאט variant |
| `armyUnit` | `"nahal" \| "golani"` | `army-hayda-nitzhonot` |
| `protestSeed` | `boolean` | `army-rak-litzok` |
| `travelDestination` | `"india" \| "south-america" \| "east-asia" \| "usa" \| "australia"` | `trip-tofes-avir` |
| `tookDrug` | `boolean` | `trip-mayim-amukim` |
| `quitSmoking` | `boolean` | `trip-allen-carr` |
| `didGraffiti` | `boolean` | `home-ashkenazi-betahana` |
| `gotArrested` | `boolean` | `home-ashkenazi-betahana` (30% roll), `home-rak-litzok-payoff` |
| `dayJob` | `"wolt" \| "hitech" \| "music-only"` | `home-shirat-hamitparnasim` |
| `musicSchool` | `"rimon" \| "bpm" \| "academy" \| "none"` | `career-achshav-ze-hazman` |

When you add a new flag, document it here.
