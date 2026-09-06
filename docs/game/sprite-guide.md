# Sprite Generation Guide — שאזאמאט: החיים

Art bible for generating the complete pixel-art package. Written so an external artist or image-generation agent can deliver every file without reading the engine.

**Companion docs:** [concept](./shazamat-life-simulator-concept.md) · [content bible](./content-bible.md) · [architecture](./architecture.md) · [content authoring](./content-authoring.md) · [roadmap](./roadmap.md)

This doc is the art track. Motion and timing live in [`ux-plan.md`](./ux-plan.md) — do not invent animations or sprite sheets.

---

## Table of contents

1. [What you are making](#1-what-you-are-making)
2. [Hard technical contract](#2-hard-technical-contract)
3. [Art concept](#3-art-concept)
4. [Shared palette](#4-shared-palette)
5. [Character system](#5-character-system)
6. [How the player looks per stage](#6-how-the-player-looks-per-stage)
7. [Master generation prompts](#7-master-generation-prompts)
8. [Asset inventory](#8-asset-inventory)
9. [Event → scene map](#9-event--scene-map)
10. [Member portraits](#10-member-portraits)
11. [Delivery, naming, and QA](#11-delivery-naming-and-qa)
12. [What not to generate](#12-what-not-to-generate)

---

## 1. What you are making

**שאזאמאט: החיים** is a 5-minute Hebrew life simulator. The player lives from childhood to joining the band Shazamat. Choices mutate a layered paper-doll sprite. At the end they discover which of the seven real members they became.

Today every PNG is a solid-color placeholder. Your job is to replace those files and add the missing ones so a full run looks like a real pixel-art game.

Three asset families:

| Family | Role | Size | Count in this pack |
|---|---|---|---|
| **Sprite parts** | Modular layers composited into the player | 64×64 | 39 |
| **Scenes** | Event backgrounds behind the player | 160×144 | 28 |
| **Member portraits** | Ending reveal busts of the real seven | 96×96 | 7 |

Plus 3 optional HUD icons (16×16). **77 files total. Generate Batch A first.**

The player sprite is a **generic Israeli boy who ages**. He is never a specific band member until the ending portrait appears. Decisions leave visible scars (backpack, dog tags, spray stain, stupid hat). The instrument of the ending must stay hidden during the run.

---

## 2. Hard technical contract

Violate any of these and the asset will not drop into the game.

### Sizes (exact, not "around")

| Asset | Canvas | Displayed at | Notes |
|---|---|---|---|
| Sprite part | **64×64 px** | 256×256 (4× CSS scale) | `image-rendering: pixelated` |
| Scene | **160×144 px** | `background-size: cover` on a tall phone viewport | Literal Game Boy resolution |
| Member portrait | **96×96 px** | 120×120 with a 3px `#DB7738` border | Ending + share page |
| HUD icon (optional) | **16×16 px** | 16–20 CSS px | Replaces emoji later |

Do **not** deliver 128×128 @2x unless asked. One size per file.

### File format

- PNG-24 (or indexed PNG) with a **real alpha channel**
- Sprite parts and portraits: transparent background, no matte, no drop-shadow halo
- Scenes: **fully opaque**, no transparency
- sRGB, no weird ICC that shifts `#DB7738`
- No JPEG, no WebP, no SVG
- No anti-aliasing, no blur, no gradients that aren't stepped 2–3 color ramps

### Paths and filenames

Overwrite placeholders in place. New files use the same pattern.

```
public/game/sprites/body/{id}.png
public/game/sprites/pants/{id}.png
public/game/sprites/shirt/{id}.png
public/game/sprites/hair/{id}.png
public/game/sprites/accessory/{id}.png
public/game/sprites/instrument/{id}.png
public/game/sprites/expression/{id}.png
public/game/scenes/{id}.png
public/game/members/{memberId}-portrait.png
public/game/ui/{id}.png
```

`id` is the exact string in the inventory tables. Example: `body-child` → `public/game/sprites/body/body-child.png`.

Existing placeholders you must overwrite (same path, same size, real art):

```
body-child  body-teen
pants-jeans
shirt-basic  shirt-band
hair-short
accessory-band-patch  accessory-drumsticks
instrument-guitar-small  instrument-bass
expression-neutral  expression-happy  expression-worried
childhood-bedroom  school-stage  school-practice-room  school-classroom
aviad-portrait  itay-portrait  nimrod-portrait  shay-portrait
reef-portrait  nir-portrait  gidon-portrait
```

### Compositor (how layers stack)

The game stacks PNGs, all aligned to the same 64×64 canvas, in this order (bottom → top):

```
body → pants → shirt → hair → instrument → expression → accessories[]
```

Accessories stack on top of everything and persist for the rest of the run. Design them as **sparse overlays** (hat crown, shoulder straps, glasses) — never a full-body redraw.

Because accessories draw last, a backpack cannot sit behind the torso. Draw only **straps on the shoulders + pouches peeking on the left/right edges**.

### Scene dimming (critical)

Scenes render at **60% opacity** over a `#0a0a0a` viewport. A naturally dark scene will vanish.

- Paint scenes **one stop brighter and more saturated** than feels correct
- Keep 4–6 large readable shapes
- Put the subject in the **center 100×90** — the edges get cropped on tall phones
- Leave a dimmer "pocket" in the dead center so the 256×256 character still reads

### Character alignment grid (64×64)

All parts share this skeleton. Feet on the bottom. Centered on X.

```
         0        16        32        48        63
       0 ┌────────────────────────────────────────┐
         │            empty / hair overflow        │
       4 │         ┌──────────────────┐            │
         │         │      HEAD        │            │  child head: y=4–22
      18 │         │   (face lives    │            │  adult head: y=6–20
         │         │    in here)      │            │
      22 │         └──────────────────┘            │
      23 │            neck / shoulders             │
      26 │         ┌──────────────────┐            │
         │         │      TORSO       │            │  shirt covers y=24–44
      42 │         └──────────────────┘            │
      43 │         ┌──────────────────┐            │
         │         │   HIPS / THIGHS  │            │  pants cover y=42–63
      52 │         └──────────────────┘            │
      53 │           calves                        │
      61 │           shoes  (y=60–63)              │
      63 └────────────────────────────────────────┘
```

| Region | Adult px | Child px |
|---|---|---|
| Head box | x=20–43, y=6–20 | x=18–45, y=4–22 |
| Face (expression overlay) | x=22–41, y=8–18 | x=20–43, y=6–20 |
| Torso | x=18–45, y=24–44 | x=20–43, y=24–42 |
| Legs + shoes | x=20–43, y=42–63 | x=22–41, y=42–63 |
| Feet contact | y=62–63, no floating | same |

- Front-facing only. No walk cycle, no side view, no sprite sheet.
- Body includes **skin + simple dark underwear** so a missing shirt/pants layer never looks nude.
- Body head is a **bald scalp** (skin-tone dome). Hair is a separate layer.
- Body face is a **neutral base** (simple eyes + mouth). Expression layers redraw the face pixels only.
- 1px outline in `#1A120C`. No second outline. No glow.
- Keep a 1px transparent margin on the canvas edges except the shoes, which may touch y=63.

---

## 3. Art concept

### One-sentence direction

**Israeli street-pixel: Game Boy scenes, Earthbound characters, Tel Aviv night, kiosk fluorescent, IDF olive, and one orange accent. Funny, a bit ugly, never cute.**

This is a hip-hop band's life sim, not a farming game and not an anime.

### Tone

Shazamat's identity is high-energy live hip-hop, ultras culture, monochrome with selective orange, grain, and neighborhood swagger. Album covers are lo-fi film, a wrecked car in tracksuits, seven guys jammed in a bus windshield, dark surreal line work.

Pixel translation:

- Chunky, readable, slightly awkward bodies (Earthbound / Mother 3 overworld — not Stardew cute, not Owlboy HD)
- Israeli-specific props that a local instantly recognizes: kiosk vitrine, שכותר, olive IDF, Tel Aviv graffiti, Wolt bag, fluorescent hostel
- Comedy in the prop, not in a winky face
- Limited palette, hard edges, high contrast
- Night scenes are black + orange sodium, not purple synthwave

### Steal from

- Earthbound / Mother 3 overworld sprites (proportion, ugliness, clarity)
- Recettear / Stardew **layering method only** (paper-doll), not their pastoral look
- The Friends of Ringo Ishikawa (street grit at low res)
- Game Boy Color screens (160×144 discipline)
- Habbo silhouette clarity — then make it dirtier

### Do not steal from

- Anime eyes, chibi blush, sparkle highlights
- Stardew Valley farming softness
- Dead Cells / Owlboy painterly HD pixel
- BitLife clip-art suburbia
- Cyberpunk neon / vaporwave
- Soft "AI pixel art" (bilinear mush, 300 colors, fake scanlines, chromatic aberration)
- Western high-school tropes (lockers, football, pumpkin spice)

### Cultural specificity (required)

If a scene could be "any country," it failed.

| Instead of… | Draw… |
|---|---|
| Generic candy store | Israeli neighborhood kiosk: fluorescent, glass vitrine, ice-cream fridge, handwritten price |
| US high school locker hall | Israeli classroom: fluorescent tubes, backpacks on chairs, Hebrew-shaped scribbles as 2px marks (no readable letters) |
| US army camo | IDF olive, red beret vibe for some units, two buses at לשכת גיוס |
| Generic backpacker beach | Goa night market / Bondi light / Tokyo vending / BA colectivo — one landmark prop each |
| NYC yellow cab cliché | One luxury shop window the player cannot afford |
| Generic studio | Cheap Tel Aviv room: cold coffee, audio interface, blister pack on the desk |

**No readable Hebrew or English in any pixel asset.** At this resolution text becomes noise or a copyright mess. Suggest letter-shapes with 2px ticks, never real words. The Shazamat **logo is black or white only** — never recolor it orange. A merch shirt may use a tiny white shin-like mark, not the official wordmark.

### The player is not a member

During the run the sprite is a stand-in: Mediterranean skin, dark hair (unless an accessory changes it), ordinary face. Age and clothes tell the story. **Do not** give him Nir's ginger hair, a bass, or a known member's beard. Those belong only on ending portraits.

---

## 4. Shared palette

Use this as the world palette. Per-sprite you may use **12–16 colors** from it, plus 1–2 local accents. Do not invent a new orange.

### Brand (do not shift)

| Name | Hex | Use |
|---|---|---|
| Black | `#000000` | Void, night, outline fallback |
| White | `#FFFFFF` | Eyes, highlights, merch print |
| Orange | `#DB7738` | **The** accent — stage light, kiosk sign, merch, portrait frame energy |
| Near-black | `#0A0A0A` | Viewport (scenes sit on this) |
| UI dim | `#1A1A1A` | — |
| UI gray | `#AAAAAA` | — |

### Skin (Mediterranean / Israeli — not peach-pink Northern European)

| Name | Hex |
|---|---|
| Skin light | `#E0A87A` |
| Skin mid | `#C4845C` |
| Skin shadow | `#8F5A3A` |
| Skin deep | `#5C3A24` |

### Hair / outline

| Name | Hex |
|---|---|
| Hair black | `#1A120C` |
| Hair dark | `#2A1F18` |
| Hair brown | `#4A3428` |
| Outline | `#1A120C` |

Nir's portrait only may use ginger: `#C45A2A` / `#E07A3A` / `#8A3A18`.

### Clothes / world

| Name | Hex | Use |
|---|---|---|
| Olive | `#4A5C3A` | IDF |
| Olive light | `#6B7A4E` | IDF highlight |
| Olive dark | `#2F3A24` | IDF shadow |
| Jeans | `#3A4A6A` | Default pants |
| Jeans light | `#5A6A8A` | |
| Tee dirty white | `#D4C8B8` | Basic shirt |
| Tee black | `#1E1E1E` | Stage / musician |
| Golani yellow | `#D4A01A` | Golani tag only |
| Wolt teal | `#00C2B8` | Courier shirt — one local accent |
| Graffiti magenta | `#C43A6A` | Wall + spray stain |
| Sodium night | `#C46A28` | Tel Aviv street light (cousin of brand orange, not the same) |
| Fluorescent | `#E8E06A` | Kiosk / classroom tubes |
| Sky bleach | `#8AB4C8` | Day scenes |
| Dust | `#8A7A62` | Ground, kibbutz, barracks |

---

## 5. Character system

### Layer jobs

| Layer | Job | Persistence |
|---|---|---|
| `body` | Skin, head dome, arms, legs, underwear, shoes | Swaps on stage enter |
| `pants` | From hips to shoes, covers body legs | Stage or job |
| `shirt` | Torso + sleeves. Must not hide the neck seam | Stage, army unit, day job, band |
| `hair` | Scalp + bangs + sides. Overflow into y=2–5 is allowed | Stage (buzz in army) |
| `instrument` | Held in front of torso | Only if they joined a band — **generic guitar**, never the ending instrument |
| `expression` | Redraws eyes, brows, mouth inside the face box | Swaps on outcome (happy / worried) |
| `accessory` | Sparse overlay, stacks, lasts the rest of the run | Choice scars |

### Body progression

Four bodies. Same skeleton, different proportions.

| id | Age | Proportions | Notes |
|---|---|---|---|
| `body-child` | 6–12 | Big head, short legs, rounder belly, sneakers | Soft, not baby-chibi |
| `body-teen` | 13–18 | Lanky, slightly too-long arms, awkward stance | Adam's apple optional as 1px |
| `body-soldier` | 18–21 | Adult, broader shoulders, more upright | Still bald scalp — hair-buzz goes on top |
| `body-adult` | 21+ | Settled adult, same height as soldier, looser stance | Used from trip through Shazamat |

All four: Mediterranean skin, same face structure so the player feels like one person aging.

### Expression language

Tiny. 2–3 pixels of mouth, 2-pixel eyes. Earthbound, not anime.

| id | Face | When the UI will use it |
|---|---|---|
| `expression-neutral` | Flat mouth, open eyes | Default |
| `expression-happy` | Small open grin, squinted eyes | Good stat hits |
| `expression-worried` | Tight mouth, raised inner brows | Bad outcomes, tense cards |
| `expression-shocked` | Round mouth, white-round eyes | Bad trip, rare punch |
| `expression-smug` | Half-smile, half-lidded | High-swag beats |

Expression files are **face pixels only** + transparency. Do not redraw hair or ears.

---

## 6. How the player looks per stage

This is the visual story. Generate parts so these loadouts work.

| Stage | body | pants | shirt | hair | typical accessory | instrument |
|---|---|---|---|---|---|---|
| ילדות (6–12) | `body-child` | `pants-shorts` | `shirt-basic` | `hair-child` | — | — |
| בית ספר (13–18) | `body-teen` | `pants-jeans` | `shirt-basic` or `shirt-band` | `hair-short` | `accessory-band-patch` if they joined | `instrument-guitar-small` if they joined |
| צבא (18–21) | `body-soldier` | `pants-army` | `shirt-army-nahal` or `shirt-army-golani` | `hair-buzz` | `accessory-dog-tags` | — |
| טיול (21–23) | `body-adult` | `pants-travel` | `shirt-travel` | `hair-grown` | `accessory-backpack` | — |
| בחזרה לארץ (23–27) | `body-adult` | `pants-jeans` | `shirt-basic` / `shirt-wolt` / `shirt-hitech` | `hair-short` | spray stain if graffiti | — |
| הקריירה (27–30) | `body-adult` | `pants-casual` | `shirt-musician` | `hair-short` | `accessory-headphones` optional | `instrument-guitar` if music-only path |
| שאזאמאט (now) | `body-adult` | `pants-stage` | `shirt-shazamat` (or `shirt-band`) | `hair-short` | — | **none** — ending portrait carries the instrument |

Default starting loadout the engine already sets: `body-child` + `expression-neutral`. Clothes beyond that are new files the content pack will wire after art lands.

---

## 7. Master generation prompts

Use these as the system prompt / style lock for every image. Then append the per-asset line from the inventory.

### Style lock (paste on every part + portrait)

```
64x64 pixel art game sprite, front-facing, transparent background, 1px dark #1A120C outline,
nearest-neighbor pixel art, limited 12-color palette, no anti-aliasing, no blur, no gradients,
no drop shadow, no scanlines, Earthbound / Mother 3 overworld proportions, slightly awkward,
Israeli Mediterranean male, warm olive-tan skin (#C4845C), not pale, not anime, not chibi,
not cute, not painterly, not HD pixel art, not 3D, not photoreal, isolated on transparency
```

### Style lock (paste on every scene)

```
160x144 pixel art background, Game Boy Color screen, fully opaque, 4 to 6 large readable shapes,
subject centered, brighter and more saturated than realism (will display at 60% opacity),
limited palette, no anti-aliasing, no blur, no readable text, no logos, no UI chrome,
Israeli real-life location, street-pixel grit, brand orange #DB7738 as the single accent,
not anime, not Stardew pastoral, not cyberpunk, not photoreal
```

### Style lock (paste on every member portrait)

```
96x96 pixel art bust portrait, head and shoulders, front-facing, transparent background,
1px #1A120C outline, limited palette, no anti-aliasing, recognizable as a specific person
from the reference notes, Israeli man, hip-hop / live-band energy, not caricature-mean,
not anime, not chibi, not photoreal, isolated on transparency
```

### Negative prompt (always)

```
anti-aliasing, blur, glow, drop shadow, gradient smoothness, scanlines, chromatic aberration,
anime, chibi, sparkle, blush, cute, kawaii, Stardew, pastoral, cyberpunk neon, vaporwave,
photorealistic, 3D render, cinematic lighting, readable text, watermark, logo, wordmark,
female, child face on adult body, pale peach skin as default, extra fingers, extra limbs,
sprite sheet, animation frames, multiple poses, side view
```

### Tool notes for a generation agent

1. Generate at the **exact canvas size**. Do not generate 1024 and downscale with bicubic. If the tool only exports large, downscale with **nearest neighbor** to the target.
2. After downscale: posterize to the shared palette, wipe any semi-transparent edge pixels to full transparent or full outline.
3. Verify canvas size with a script (`64×64`, `160×144`, `96×96`) before delivery.
4. Parts that must align (body/pants/shirt/hair/expression) should be generated as a **set from one base pose**. Best workflow: draw or generate `body-adult` first, then paint clothes on copies. If using a model, generate the body, then inpaint clothes in the torso/leg boxes.
5. Deliver a contact sheet PNG per batch (optional) plus the individual files.

---

## 8. Asset inventory

**Status key:** `REPLACE` = placeholder exists, overwrite the file. `NEW` = file does not exist yet.

**Batch:** `A` = ship the game looking real (do this first). `B` = scars + stage identity. `C` = destination color + extras.

### 8.1 Bodies — `public/game/sprites/body/` — 64×64

| id | batch | status | Prompt seed |
|---|---|---|---|
| `body-child` | A | REPLACE | Age 8 Israeli boy, big head, short legs, dark briefs + undershirt, cheap sneakers, bald scalp, neutral face, arms at sides |
| `body-teen` | A | REPLACE | Age 16 Israeli teen, lanky, awkward, dark briefs, same sneakers worn down, bald scalp, same face aged up |
| `body-soldier` | A | NEW | Age 19, broader shoulders, upright, same underwear rule, combat boots in olive-brown, bald scalp |
| `body-adult` | A | NEW | Age 25–30, settled stance, same face, dark socks + simple black shoes, bald scalp |

### 8.2 Pants — `public/game/sprites/pants/` — 64×64

Cover y=42–63. Transparent above the waist. Must match the body they sit on (generate adult pants against `body-adult`; child shorts against `body-child`).

| id | batch | status | Prompt seed |
|---|---|---|---|
| `pants-shorts` | A | NEW | Kid soccer shorts, dusty blue-gray, sitting on child hips |
| `pants-jeans` | A | REPLACE | Teen/adult blue jeans `#3A4A6A`, simple, slightly too long |
| `pants-army` | A | NEW | IDF olive trousers, straight, bloused onto boots |
| `pants-travel` | B | NEW | Ridiculous backpacker pants — faded maroon or dirty linen, one cargo pocket |
| `pants-casual` | B | NEW | Black cheap chinos, Tel Aviv bartender energy |
| `pants-stage` | B | NEW | Tight black stage jeans, 1px orange stitch as the only accent |

### 8.3 Shirts — `public/game/sprites/shirt/` — 64×64

Cover y=24–44. Neck hole shows body skin. Short sleeves unless noted.

| id | batch | status | Prompt seed |
|---|---|---|---|
| `shirt-basic` | A | REPLACE | Dirty-white / sand tee `#D4C8B8`, no print, slightly too big |
| `shirt-band` | A | REPLACE | Black tee, tiny unreadable white band mark (not a real logo), teenage metal energy |
| `shirt-army-nahal` | A | NEW | IDF olive shirt, small dull unit tag, **no** yellow |
| `shirt-army-golani` | A | NEW | Same olive shirt, **one** Golani yellow `#D4A01A` tag on the chest — this is the only visual difference from Nahal |
| `shirt-travel` | B | NEW | Sun-faded tank or open shirt, backpacker, a bit stupid |
| `shirt-wolt` | B | NEW | Teal-cyan courier shirt / light jacket `#00C2B8`, food-bag strap hint on one shoulder |
| `shirt-hitech` | B | NEW | Pale button-down or navy polo, the "I still have a job" shirt |
| `shirt-musician` | B | NEW | Black faded tee, nothing printed, career musician default |
| `shirt-shazamat` | B | NEW | Black tee, tiny white shin-like mark, one orange `#DB7738` hem tick — official merch energy without using the real logo |

### 8.4 Hair — `public/game/sprites/hair/` — 64×64

Sits on the bald scalp. May overlap the top of the shirt by 1–2px. No face pixels.

| id | batch | status | Prompt seed |
|---|---|---|---|
| `hair-child` | A | NEW | Messy dark kid hair, slightly too long in front |
| `hair-short` | A | REPLACE | Simple dark short hair, teen/adult default |
| `hair-buzz` | A | NEW | Army buzz, scalp shows through, 2–3 pixel stubble |
| `hair-grown` | B | NEW | Grown-out trip hair, a bit greasy, still dark |

### 8.5 Expressions — `public/game/sprites/expression/` — 64×64

Face box only. Must register on both child and adult heads (keep features in the overlapping face rectangle: x=22–41, y=8–18).

| id | batch | status | Prompt seed |
|---|---|---|---|
| `expression-neutral` | A | REPLACE | Flat mouth, two-pixel eyes, calm |
| `expression-happy` | A | REPLACE | Small grin, squinted eyes |
| `expression-worried` | A | REPLACE | Tight mouth, inner brows up |
| `expression-shocked` | B | NEW | Round mouth, white round eyes, one-frame cartoon — still tiny |
| `expression-smug` | B | NEW | Half-lidded, tiny smirk |

### 8.6 Accessories — `public/game/sprites/accessory/` — 64×64

Sparse. Transparent everywhere that is not the prop. Remember: drawn **on top** of face and instrument.

| id | batch | status | Prompt seed |
|---|---|---|---|
| `accessory-band-patch` | A | REPLACE | Small cloth patch on the left chest / sleeve area, not a full shirt |
| `accessory-drumsticks` | A | REPLACE | Pair of sticks in the back pocket or one hand — do **not** imply this is the drummer ending; keep generic |
| `accessory-backpack` | A | NEW | Shoulder straps + side pouches only, olive/dust, front view |
| `accessory-dog-tags` | B | NEW | Tiny chain + two tags on the chest |
| `accessory-stupid-hat` | B | NEW | Ugly bucket hat or crooked sun hat that stays forever — the scar |
| `accessory-sunglasses` | B | NEW | Cheap black wayfarers sitting on the face box |
| `accessory-spray-can` | B | NEW | Mini spray can in one hand + magenta stain on the fingers |
| `accessory-headphones` | C | NEW | Over-ear cans, studio black, sit on hair |

### 8.7 Instruments — `public/game/sprites/instrument/` — 64×64

Held across the body, viewer's left (character's right). Silhouette must read at 64px.

**Do not generate drums, keys, or a mic for the player.** Those reveal the ending.

| id | batch | status | Prompt seed |
|---|---|---|---|
| `instrument-guitar-small` | A | REPLACE | 3/4 kid acoustic, too big for a child, cheap wood |
| `instrument-guitar` | B | NEW | Adult electric or beaten acoustic, generic, not a famous model |
| `instrument-bass` | A | REPLACE | Longer-neck bass silhouette — **catalog only / ending support**, not equipped mid-run |

### 8.8 Scenes — `public/game/scenes/` — 160×144, opaque

Center the landmark. Brighten one stop. No text.

#### Batch A — the game can change rooms

| id | status | Location | What to show (4–6 shapes) |
|---|---|---|---|
| `childhood-bedroom` | REPLACE | Kid's room, north-of-center Israel | Unmade bed, one window, cheap guitar in the corner, afternoon bleach |
| `childhood-kiosk` | NEW | Neighborhood kiosk | Glass vitrine, fluorescent `#E8E06A`, ice-cream fridge, orange price glow, dusty pavement. **This is קוקילידה.** |
| `school-classroom` | REPLACE | Israeli classroom | Fluorescent tubes, rows of chairs, green board as a dark rectangle, backpack on a chair |
| `school-practice-room` | REPLACE | School rehearsal closet | Amp, chairs in a circle, cable mess, one small window, beige walls |
| `school-stage` | REPLACE | School auditorium | Wood stage, two orange `#DB7738` PAR cans, black curtains, empty chairs as dark lumps |
| `school-yard` | NEW | Recess yard | Concrete, a ball, chain fence, harsh sun — **אולה** |
| `school-bedroom` | NEW | Teen bedroom, 06:30 | Dark room, alarm clock glow, blanket lump, one sliver of morning |
| `army-base` | NEW | IDF base dawn | Olive tents/buildings, gravel, flagpole as a 1px stick, cold light |
| `army-recruitment` | NEW | לשכת גיוס | Two buses side by side (the choice), concrete, harsh sun, no logos on the buses |
| `trip-airport` | NEW | Ben Gurion vibe | Glass, night, one plane silhouette, orange sodium, departure hall emptiness |
| `trip-hostel` | NEW | Anywhere-abroad hostel | Bunk, ceiling fan, cigarette pack on a table, ugly curtain |
| `home-apartment` | NEW | Cheap Tel Aviv flat | White walls, laundry, one window on a building shaft, noon |
| `home-graffiti` | NEW | South TLV after midnight | Concrete wall, magenta `#C43A6A` spray, street, no readable word |
| `home-studio` | NEW | Night mix room | Desk, interface, cold coffee cup, blister pack as a tiny foil rectangle, lamp |
| `career-backstage` | NEW | First-gig wings | Black curtains, orange spill from stage-right, cable, nervous empty space |
| `shazamat-stage` | NEW | Real club stage, now | Dark room, orange `#DB7738` wash, mic stand, crowd as a dark mass |

#### Batch B — stage flavor

| id | status | Location | What to show |
|---|---|---|---|
| `night-out` | NEW | Friday night, somewhere stupid | Sodium street, a closed shutter, one neon tick |
| `home-living-room` | NEW | Parents' house, Friday leave | Couch, TV glow, quiet, basketball on the floor optional |
| `home-protest` | NEW | TLV protest | Dumpster fire as the hero shape, crowd lumps, blue-red flicker — cartoon, not news footage |
| `career-classroom` | NEW | Music-school hallway | Lockers-as-rectangles, poster blobs, daylight |
| `shazamat-rehearsal` | NEW | Band room | Seven chair-lumps, amps, daylight through a dirty window |
| `phone-glow` | NEW | Face + phone | Near-black room, a white-blue phone rectangle — for Instagram / WhatsApp cards |

#### Batch C — destination color (one fires per run)

| id | status | Location | One landmark each |
|---|---|---|---|
| `trip-india` | NEW | Goa, 36 hours awake | Night beach market, one orange bulb string, sea as a dark band |
| `trip-south-america` | NEW | Buenos Aires bus | Night window, seat, passing yellow street, a book on the empty seat |
| `trip-usa` | NEW | NYC shop window | Luxury glass, one expensive bag silhouette, the player is outside |
| `trip-australia` | NEW | Bondi | Huge sky, huge sea, tiny people — "too big" is the joke |
| `trip-east-asia` | NEW | Tokyo side street | Vending machine glow, clean pavement, quiet order |
| `shazamat-wedding` | NEW | Tuscany wedding | Cypress + warm lights + a long table — joyful, not fancy-catalog |

### 8.9 Member portraits — `public/game/members/` — 96×96

See [§10](#10-member-portraits). All seven are Batch A.

### 8.10 Optional HUD — `public/game/ui/` — 16×16 — Batch C

| id | Prompt seed |
|---|---|
| `stat-musicianship` | Tiny pixel guitar, orange `#DB7738` on transparency |
| `stat-swag` | Tiny pixel sunglasses, white highlights |
| `dice` | 3×3 pip die, for roll choices |

---

## 9. Event → scene map

Use this when painting so every card has a home. Events currently pointing at the wrong placeholder are marked **repoint** (content change after the file exists — not your job, but generate the correct scene anyway).

### ילדות

| Event | Scene to generate | Today's scene |
|---|---|---|
| `childhood-kookilida` | `childhood-kiosk` | childhood-bedroom · **repoint** |
| `childhood-ola` | `school-yard` | school-classroom · **repoint** |

### בית ספר

| Event | Scene to generate | Today's scene |
|---|---|---|
| `school-haver-mevi-haver` | `school-practice-room` | same |
| `school-hayom-ani-lo` | `school-bedroom` | school-classroom · **repoint** |
| `school-yeled-maniac` | `school-classroom` | same |
| `school-tahushat-beten` | `night-out` | school-stage · **repoint** |
| `school-sheva-lev-adom` | `school-classroom` | same |
| `school-siahat-litufim` | `night-out` | none |
| `school-ma-im-shavat-hamelech` | `school-classroom` | same |

### צבא

| Event | Scene to generate | Today's scene |
|---|---|---|
| `army-hayda-nitzhonot` | `army-recruitment` | school-stage · **repoint** |
| `army-pesek-zman` | `home-living-room` | school-classroom · **repoint** |
| `army-rak-litzok` | `home-protest` | school-stage · **repoint** |
| `army-hitoreinu-meuhar` | `army-base` | school-classroom · **repoint** |
| `army-ma2shazamat` | `army-base` | school-classroom · **repoint** |

### טיול

| Event | Scene to generate | Today's scene |
|---|---|---|
| `trip-tofes-avir` | `trip-airport` | school-stage · **repoint** |
| `trip-mayim-amukim` | `trip-hostel` | none |
| `trip-allen-carr` | `trip-hostel` | none |
| `trip-mi-yachol-alay` | `night-out` | none |
| `trip-destination-india` | `trip-india` | none |
| `trip-destination-south-america` | `trip-south-america` | none |
| `trip-destination-usa` | `trip-usa` | none |
| `trip-destination-australia` | `trip-australia` | none |
| `trip-destination-east-asia` | `trip-east-asia` | none |
| `trip-ma-im-gavia-haesh` | `trip-hostel` | none |

### בחזרה לארץ

| Event | Scene to generate | Today's scene |
|---|---|---|
| `home-shirat-hamitparnasim` | `home-apartment` | school-classroom · **repoint** |
| `home-ashkenazi-betahana` | `home-graffiti` | school-stage · **repoint** |
| `home-rak-litzok-payoff` | `home-protest` | none |
| `home-shum-davar-hadash` | `home-studio` | school-classroom · **repoint** |
| `home-haverim-arsim` | `home-apartment` | none |
| `home-ma-im` | `home-apartment` | school-classroom · **repoint** |

### הקריירה

| Event | Scene to generate | Today's scene |
|---|---|---|
| `career-achshav-ze-hazman` | `career-classroom` | school-stage · **repoint** |
| `career-tohnit-halive` | `career-backstage` | school-stage · **repoint** |
| `career-blaadenu-en-mishak` | `phone-glow` | none |
| `career-harry-potter` | `shazamat-rehearsal` | none |

### שאזאמאט

| Event | Scene to generate | Today's scene |
|---|---|---|
| `shazamat-koza-nostra` | `shazamat-rehearsal` | school-stage · **repoint** |
| `shazamat-toskana` | `shazamat-wedding` | none |
| `shazamat-habayta` | `shazamat-stage` | none |
| `shazamat-heyterim` | `phone-glow` | none |
| `shazamat-sheva-raot-tovot` | `shazamat-stage` | school-stage · **repoint** |
| `shazamat-lo-oto-davar` | `childhood-kiosk` (echo) | none |
| `shazamat-hagashem-lo-yavo` | `shazamat-rehearsal` | none |

---

## 10. Member portraits

These are the product. The ending slams the name, then the portrait pops. Fans must be able to argue "that's him."

**If photo references are attached to the generation job, match them.** The notes below are lore silhouettes for when photos are missing. All seven must still be **visually distinct from each other** at 96×96.

Bust only (head + shoulders + a hint of the instrument or a prop). Transparent ground. Same outline and skin rules as the player, but these are **specific men**, not the generic boy.

| file | Name | Role | Lore silhouette (use if no photo) | Prop in frame |
|---|---|---|---|---|
| `aviad-portrait.png` | אביעד | בסיסט | Center-Israel, the responsible one, dark hair, calmer face, maybe a short beard. Has a daughter; reads as grounded, not pretty-boy. | Bass headstock or strap |
| `itay-portrait.png` | איתי | תופף | Kibbutz Yiftah, always late, Australia. Looser face, slightly tired, drummer shoulders. | Drumstick up |
| `nimrod-portrait.png` | נמרוד | גיטריסט | Also Yiftah, East Asia, guitar years in a room. Sharper / more intense than Itay so they don't twin. | Guitar headstock |
| `shay-portrait.png` | שי | מפיק | Kibbutz Gonen, Golani, India, night-studio. Tired-smart, not a stage pose. The brain. | Cans around the neck or a tiny knob/desk hint |
| `reef-portrait.png` | ריף | קלידן | Kibbutz Shfayim, South America, three weddings to the same woman. Warmer, more romantic, slightly dressed-up. | Keyboard edge or a ring pixel |
| `nir-portrait.png` | ניר | ראפר | Alon HaGalil. **Ginger (`אשכן`)** — this is the one portrait that must read as red hair at 96px. Punchline energy, not mean. | Mic or a magenta spray tick |
| `gidon-portrait.png` | גדעון | ראפר | Kiryat Tivon, stage current, protests. Highest energy of the seven, mouth slightly open or mid-shout, still tiny. | Mic, more motion in the hair |

Do **not** make them identical except for the prop. Hair, face, and color temperature should differ. Nir = ginger. Shay = most tired. Gidon = most kinetic. Aviad = most still.

Portrait prompt add-on:

```
pixel art bust of an Israeli hip-hop band member, head and shoulders, 96x96,
distinct silhouette, instrument prop as specified, same world palette,
orange #DB7738 may appear as a 1px rim light only
```

---

## 11. Delivery, naming, and QA

### Folder to zip

Deliver a zip that unpacks **directly** onto `public/game/`:

```
sprites/body/*.png
sprites/pants/*.png
sprites/shirt/*.png
sprites/hair/*.png
sprites/accessory/*.png
sprites/instrument/*.png
sprites/expression/*.png
scenes/*.png
members/*-portrait.png
ui/*.png                 # only if Batch C icons are included
```

No nested `game/` prefix inside the zip. No `IMG_0231.png`. No spaces.

### Counts

| Batch | Parts | Scenes | Portraits | UI | Total |
|---|---|---|---|---|---|
| **A — ship** | 22 | 16 | 7 | 0 | **45** |
| **B — scars** | 16 | 6 | 0 | 0 | **22** |
| **C — color** | 1 | 6 | 0 | 3 | **10** |
| **Full pack** | 39 | 28 | 7 | 3 | **77** |

**Batch A files (45):**

```
body:        body-child, body-teen, body-soldier, body-adult
pants:       pants-shorts, pants-jeans, pants-army
shirt:       shirt-basic, shirt-band, shirt-army-nahal, shirt-army-golani
hair:        hair-child, hair-short, hair-buzz
expression:  expression-neutral, expression-happy, expression-worried
accessory:   accessory-band-patch, accessory-drumsticks, accessory-backpack
instrument:  instrument-guitar-small, instrument-bass
scenes:      childhood-bedroom, childhood-kiosk, school-classroom,
             school-practice-room, school-stage, school-yard, school-bedroom,
             army-base, army-recruitment, trip-airport, trip-hostel,
             home-apartment, home-graffiti, home-studio, career-backstage,
             shazamat-stage
portraits:   aviad, itay, nimrod, shay, reef, nir, gidon
```

### QA checklist (agent must pass before handoff)

- [ ] Every file is the exact size in the contract
- [ ] Every sprite part has a fully transparent background (no `#000` matte, no white matte)
- [ ] Every scene is fully opaque 160×144
- [ ] No anti-aliased edge (no 50% alpha fringe). Edges are outline or transparent
- [ ] All four bodies share the same foot line (y=62–63) and center X
- [ ] Pants + shirts register on the matching body without a halo gap
- [ ] Hair sits on the scalp without covering the eyes
- [ ] Expressions only touch the face box
- [ ] Accessories are sparse — overlaying all of them at once still reads as a person
- [ ] Nahal vs Golani shirts differ only by the yellow tag
- [ ] No readable letters anywhere
- [ ] No official Shazamat wordmark, no orange logo
- [ ] Player parts do not include ginger hair, a keyboard, drums, or a mic
- [ ] Nir's portrait is the only ginger
- [ ] Scenes still read when you drop a 60% black overlay on them
- [ ] Brand orange `#DB7738` appears as an accent, not a fill
- [ ] Skin is Mediterranean, not peach
- [ ] Contact sheet of the seven portraits: seven different people

### After drop-in (for the implementing agent, not the artist)

1. Overwrite / add files under `public/game/`.
2. Register every **NEW** id in `src/game/content/sprites.ts`.
3. Wire stage `onEnter` loadouts (body-soldier, army shirts, backpack, etc.).
4. Repoint event `scene:` fields per [§9](#9-event--scene-map).
5. Run `npm run game:validate`.
6. Play `/life` and confirm layers sit on each other at 4×.

---

## 12. What not to generate

- Sprite sheets, walk cycles, attack frames, side views
- @2x / 128×128 / 512×512 "masters" as the delivered file
- Particle FX, screen-shake frames, mood overlays (UI does that in CSS)
- WhatsApp/Instagram story cards (1080×1920) — later, not this pack
- Title-screen key art, OG images (those are Satori / HTML)
- Sound, UI chrome, buttons, Hebrew lettering
- Separate child/teen/adult versions of every shirt — one adult shirt should fit `body-teen` and `body-adult` well enough; only shorts are child-specific
- Photoreal portraits or illustrated album-cover recreations
- Female or androgynous player variants (endings are the seven men)
- Extra members, extra instruments that spoil the reveal
- A "Shazamat logo sprite" in orange

---

## Appendix — existing catalog (so you don't invent ids)

These ids already exist in `src/game/content/sprites.ts`. Reuse them. Do not rename.

```
body-child  body-teen
pants-jeans
shirt-basic  shirt-band
hair-short
accessory-band-patch  accessory-drumsticks
instrument-guitar-small  instrument-bass
expression-neutral  expression-happy  expression-worried
scenes: childhood-bedroom  school-stage  school-practice-room  school-classroom
portraits: aviad itay nimrod shay reef nir gidon
```

New ids in this guide are proposed and stable — the implementing agent will add them to the catalog when the PNGs land. Do not freelance alternate slugs (`body_kid`, `ArmyBase`, `kiosk.png`).
