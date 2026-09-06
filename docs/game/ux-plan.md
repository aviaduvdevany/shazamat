# UX Experience Plan — שאזאמאט: החיים

A phased plan for the **feel** of the game: UI, transitions, timing, motion, and emotional pacing.

This is not an art brief. Sprites, portraits, and scene pixels are out of scope. When real art lands, it drops into the motion language defined here.

**Companion docs:** [concept](./shazamat-life-simulator-concept.md) · [architecture](./architecture.md) · [content bible](./content-bible.md) · [roadmap](./roadmap.md)

---

## Table of contents

1. [What this document is for](#what-this-document-is-for)
2. [What ships today](#what-ships-today)
3. [Research — what similar games get right](#research--what-similar-games-get-right)
4. [Experience principles](#experience-principles)
5. [Motion language](#motion-language)
6. [The full-life journey](#the-full-life-journey)
7. [Mood, risk, and rarity](#mood-risk-and-rarity)
8. [Timing bible](#timing-bible)
9. [Phased plan](#phased-plan)
10. [Implementation notes](#implementation-notes)
11. [Success metrics](#success-metrics)
12. [Explicitly out of scope](#explicitly-out-of-scope)

---

## What this document is for

The engine already plays a life. The UI currently *displays* that life. This plan turns display into a performance.

A 5-minute Hebrew life-sim on a phone has one job: make every tap feel like something happened to *you*, then slam the identity reveal hard enough that sharing is the obvious next move.

The north-star metric stays the same as the concept doc: **New Life rate**. Juice exists to raise that number, not to decorate.

---

## What ships today

Honest audit of `src/game/ui/` + `src/app/life/game.css` as of this writing.

| Surface | What the player gets | What's missing |
|---|---|---|
| Title | Static headline + CTA | No idle life, no entrance, no exit |
| Email gate | Form + "טוען..." | The "life is being created" copy is a label, not a moment |
| Event card | All copy and buttons appear at once | No enter choreography, no reading beat |
| Choice press | 80ms squash, orange fill | Other buttons stay live; no commit lock; no risk cue |
| Outcome | Label + deltas pop 400ms + Continue | Instant dump; HUD bar tweens but does not announce; no roll drama |
| Stage clear | Static title + Continue | No chapter ceremony, no age tick, no breath |
| Ending | Everything on screen at once | No anticipation, no name slam, no count-up |
| Share page | Static recap card | No theater for the friend; CTA is just a link |
| Mood field | Authored on every event (`neutral` / `tense` / `funny` / `epic` / `sad`) | Unused by UI |
| Rarity | `common` / `rare` / `ultra` in schema | Unused by UI |
| Audio | Stub exists | No-op — define sync points now, files later |
| Reduced motion | Stat pop + button squash disabled | Centralized contract live (UX-0): tokens remap to instant in game.css; `usePrefersReducedMotion` hook in `src/game/ui/`; shake/stagger stubs forward-declared |

A full run is roughly **title → email → ~18 events × (choice + continue) → 6 stage clears → ending**. That is ~45 taps. The current loop is readable and legal. It does not yet feel like a life passing.

---

## Research — what similar games get right

These are the games and talks this plan steals from. Steal mechanisms, not skins.

### BitLife — the year is a verb

BitLife's genius is not the menus. It is the **Age** button: a ritual that commits the year, resolves chaos, and returns a new state. Stats sit permanently at the top. Random events interrupt. The player is always managing fallout while planning the next year.

**Steal:** life must *advance*, not just *swap cards*. Stage clears are our Age button. The HUD is a permanent scoreboard, not chrome.

**Do not steal:** open-world menus, year-by-year grinding, death-as-failure. Our run is a closed 5-minute arc with a destined ending.

### Reigns — four icons you watch with your gut

Reigns puts Health / Wealth / Power / People as icons along the top. Every swipe is felt in peripheral vision as a bar fills or empties. Death is a bar hitting zero. The card physically slides. The player learns the language in one swipe.

**Steal:** HUD changes must be readable without reading. Pulse the bar that moved. Ghost the old fill for a beat so loss is visible. Keep the top strip sacred — never hide it during play.

**Do not steal:** swipe-left/swipe-right as the only input. Hebrew choice copy is sentences, not yes/no. Thumb-zone stacked buttons stay. Peeking future stat deltas on hover is optional later; never peek hidden affinities.

### Florence — timing *is* the emotion

Ann//apurna's Florence makes each interaction a unique micro-verb (drag letters together, pack a suitcase). Emotion lives in how long you wait and how the UI resists or yields.

**Steal:** comedy is fast, grief is slow, tension holds. We already author `mood` on every card — that field is the timing director.

**Do not steal:** a unique minigame per event. That is unmaintainable. We get five interaction *templates* (standard / roll / keystone / rare / ceremony), not forty toys.

### Visual novels + The Voice / talent-show reveals

Typewriter text, choice fade-in, then a drumroll before the name. People remember the hold before "you are…" more than the name itself. Kahneman's **peak-end rule**: memory is the most intense moment plus the ending.

**Steal:** the ending is a show with a held breath. The first juicy outcome of the run is the teaching peak. Everything between is rhythm.

**Do not steal:** unskippable 20-second typewriter. This is a phone, in WhatsApp-between-stops time. Every ceremony is skippable by tap after it starts.

### Juice It or Lose It (Purho / Jonasson) + Game Feel (Swink)

Juice is synchronized feedback, not decoration. Visual + haptic + audio must fire on the **same frame**. 50ms of drift and the brain files them as separate events. Input acknowledgement must be instant; drama is allowed only *after* the tap is confirmed.

**Steal:**

- Button squash on pointer-down (already started — keep it)
- Overshoot pops on rewards
- Screen shake only on *bad* or *huge* beats, mapped to intensity
- A shared motion vocabulary so new screens do not invent new physics

**Do not steal:** particle spam, chromatic chaos on every tap, shake on mundane +1s. Unrestrained juice reads as a slot machine and kills the band's tone.

### Wordle + Wu-Tang Name Generator — share is the product

Wordle won because the result was a portable joke. Wu-Tang won because identity was instant and brag-able. Our concept already names this: the share text is the punchline.

**Steal:** the ending must produce a sentence a friend can argue with. The share landing page is a second performance of that sentence, then a dare: התחל חיים.

### Mobile narrative (Netflix tarot / story decks)

Mobile attention wants 5–9 micro-beats per chapter, each with one job (curiosity, laugh, risk, insight). CTAs convert at emotional peak, not after the feeling has cooled.

**Steal:** each event card has one emotional job. Stage clears reset the palate. The ticket CTA waits until after the name slam — it is the punchline, never the cold open.

### RTL / Hebrew-specific

Kahoot, Material, and RTL localization guides agree: flip layout, not time. Do not mirror logos, numbers, or brand marks. Isolate `dir="ltr"` on email and URLs (already done). Progress through a life is **top → bottom**, not left → right. Stagger and slide use logical properties (`inline-start` / `block-end`), never `left` / `right`.

---

## Experience principles

These override taste arguments during implementation.

1. **Acknowledge the tap in under 80ms.** Drama happens after commit, never before. A delayed button is a broken button.
2. **Life moves forward in space.** Old beats exit toward the top. New beats enter from below. Stage names slam. Time does not slide sideways.
3. **The HUD is the body.** Stat changes are felt in the top strip, not only as text in the outcome well. If the player can miss a +8 without looking at the card, the juice failed.
4. **Mood directs tempo.** `funny` snaps. `tense` holds. `epic` widens. `sad` slows and desaturates. `neutral` is the house beat.
5. **Hidden things stay hidden.** Affinities never flicker. No "this choice loves שי" tell. Risk (a roll) *may* be telegraphed with a 🎲. Identity is revealed once, at the end.
6. **Skip is respect.** Any sequence longer than 400ms can be skipped by tap. Reduced motion skips choreography and keeps meaning.
7. **One vocabulary.** New screens pick from the motion tokens below. Inventing a new easing for one screen makes the rest feel unfinished.
8. **Comedy timing is a mechanic.** A funny outcome that arrives 600ms late is not funny. A tense roll that resolves in 80ms is not tense.
9. **The ending is the product.** Budget polish here first after the loop works. Peak-end rule is not optional.
10. **45 taps is too many.** Auto-advance outcomes and stage clears after a readable beat. Keep the tap as a skip, not a chore.

---

## Motion language

All values live as CSS custom properties on `.game-root`. Screens do not hardcode durations.

### Duration tokens

| Token | Value | Use |
|---|---|---|
| `--g-t-instant` | 0ms | Reduced-motion swap, skip |
| `--g-t-ack` | 80ms | Pointer-down squash, commit lock |
| `--g-t-fast` | 120ms | Hover/focus, small fades |
| `--g-t-base` | 200ms | Card enter, HUD pulse, standard crossfade |
| `--g-t-slow` | 320ms | Screen change, scene crossfade |
| `--g-t-hold` | 450ms | Outcome settle, stat count |
| `--g-t-ceremony` | 700ms | Stage name slam, email "creation" |
| `--g-t-drama` | 1100ms | Ending "אתה הוא..." hold |

Aligns with the site tokens (120 / 200 / 320) and adds game-only ceremony steps. Do not add a ninth duration without a new class of moment.

**HUD bar fill note:** The timing bible specifies 400ms for HUD fill. The nearest token is `--g-t-hold` (450ms) and that is what `game.css` uses. Do **not** add a `--g-t-400` or similar — the 50ms difference is imperceptible and keeping one fewer token matters more.

### Easing tokens

| Token | Curve | Use |
|---|---|---|
| `--g-ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Enters, fades — matches site `--easing-standard` |
| `--g-ease-emphasize` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | HUD pulse, stage slam — matches site `--easing-emphasized` |
| `--g-ease-overshoot` | `cubic-bezier(0.34, 1.4, 0.64, 1)` | Stat pops, name reveal, rare kicker |
| `--g-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving upward |
| `--g-ease-linear` | `linear` | Holds, count-ups, roll tickers |

Overshoot is for *rewards and reveals only*. Never overshoot a screen exit or a sad beat.

### Spatial grammar

```
EXIT     ↑  old event / old stage / title  (block-start)
ENTER    ↓  new event / new stage / outcome (block-end)
SLAM        stage name, member name         (scale 0.86 → 1.06 → 1)
PULSE       HUD bar that changed            (scale 1 → 1.08 → 1)
SQUASH      any pressable                   (scale 1 → 0.97 → 1)
SHAKE       bad outcome / ultra surprise    (2–6px, 180–280ms, decaying)
FLASH       reveal / rare                   (opacity or contrast, 80–120ms)
```

Direction is logical. In RTL the reading edge is `inline-start` (right). Choice stagger rises from the thumb zone (block-end), not from the "left."

### Reduced-motion contract

When `prefers-reduced-motion: reduce`:

- Durations collapse to `--g-t-instant` or a 80ms fade
- No shake, no overshoot, no stagger, no count-up
- Meaning stays: deltas still appear, name still appears, aria-live still fires
- Auto-advance still works; the wait is shorter (600ms instead of 1400ms)
- Haptics off

Do not ship a motion that has no reduced-motion twin.

---

## The full-life journey

Choreography for every screen the player already has. Copy in Hebrew is a draft — shorten freely; timing is the spec.

### 1. Title — the dare

**Job:** make "חיה חיים" feel like a door, not a landing page.

| Beat | t | Motion |
|---|---|---|
| Band kicker | 0 | Fade + 6px rise |
| החיים | 80 | Slam (0.9 → 1.04 → 1), 320ms |
| Subtitle | 200 | Fade |
| CTA | 320 | Fade; one gentle pulse at 900ms, then rest |
| Meta line | 400 | Fade |

Idle: grain already lives on the brand site — a *very* slow opacity breath on the headline (6s loop, ±2%) is enough. No floating particles.

Exit on tap: acknowledge 80ms, title block exits up 200ms, email rises from below. Do not cut.

### 2. Email gate — a ritual, not a newsletter

**Job:** the legal form is real; the *feeling* is "your life is being assembled."

The form stays. Consent stays. What changes is the **submit → first event** gap.

| Beat | t | What they see |
|---|---|---|
| Submit ack | 0 | Button squash, label → "יוצרים את החיים…" |
| Assemble | 80–900 | Three short lines stack and tick, like a character sheet being filled |
| Smash cut | 900 | Hard cut (80ms black) into childhood event enter |

Draft assemble lines (rotate or pick 3):

- מוצא: █░░
- כלי ראשון: █░░
- סוואג: 0

Bars do not reveal the real hometown. They are theater. If the server action takes longer than 900ms, hold the last line and keep a subtle tick — never show a generic spinner as the hero.

Error: the form shakes once (4px, 180ms) and the existing red message appears. No assemble sequence on failure.

### 3. Event enter — something happened

**Job:** the card is an event, not a quiz question. The player should feel arrived before they decide.

| Beat | t | Motion |
|---|---|---|
| Scene | 0 | Crossfade 320ms if scene changed; hold if same |
| Kicker | 40 | Fade, orange |
| Headline | 100 | Fade + 8px rise |
| Body | 180 | Fade |
| Choices | 260 + 40n | Stagger from below; thumb-zone first |

Total enter ≈ 400ms. The player can start reading at 100ms. Do not typewriter the body on common cards — too slow for 18 events.

**First event of the run only:** add a 200ms extra hold after the headline. This is the "your life has started" breath. Never repeat it.

Choices are disabled until the last button has entered (plus 40ms). Prevents mis-taps during stagger.

### 4. Choice press — commit

**Job:** the decision feels spent. You cannot take it back.

1. Pointer-down: squash 80ms (already exists — keep).
2. On click: **lock the well**. Unchosen buttons fade to 35% and ignore input. Chosen button fills orange and holds 120ms.
3. Only then start the outcome transition.

If the choice has a `roll`, show a small 🎲 on the button *before* press (always visible, not a surprise). Risk is honest. Outcome is not.

### 5. Outcome — the dopamine (or the flinch)

**Job:** prove the decision mutated the world.

| Beat | t | Motion |
|---|---|---|
| Event well exits | 0 | 160ms up + fade |
| Outcome label in | 160 | Fade + 8px rise |
| Each stat delta | 240 + 80n | Overshoot pop; color green/orange for +, `#e05555` for − |
| HUD | same frame as its delta | Bar fill 400ms ease-out; container pulse 200ms; ghost old fill 300ms on losses |
| Continue / auto | after last delta + 350ms | Button fades in; or auto-advance at 1400ms from outcome start |

**Ghost bar (Reigns/Souls lesson):** on a loss, the previous fill stays as a dim remnant and drains, so the eye sees *how much* left. On a gain, the new fill sweeps.

**Flying number (optional in UX-1, required in UX-7):** a duplicate `+8` originates on the delta and dies on the matching HUD stat. Same-frame start.

If there are no stat deltas (flavor-only outcome), skip the delta beats. Outcome label still enters. Auto-advance shortens to 1100ms.

Continue stays available as a skip the moment the label is visible. Auto-advance is the default; the button is for impatient thumbs and keyboard users (`autoFocus` already exists — keep it).

### 6. Stage clear — the Age button

**Job:** the player should feel a year-block end. This is how a 5-minute game gets a life-shaped memory.

Do **not** keep the event well and stamp a title on it. Full-surface ceremony, HUD stays (age label will change on the other side).

| Beat | t | Motion |
|---|---|---|
| Dim scene | 0 | Viewport drops to 20% in 200ms |
| Kicker | 120 | `סוף · [current stage]` fade |
| Breath | 400 | 200ms black hold |
| New name | 600 | Slam the next stage label |
| Age | 780 | Age range fades under it |
| Advance | 1600 | Auto into next event enter; tap skips |

Draft copy:

- Kicker: `סוף ילדות`
- Name: `בית ספר`
- Age: `גילאי 13–18`

Last stage → ending does **not** use this template. It uses the ending show.

### 7. Ending — the product

**Job:** a held breath, a name, a dare. This is the peak. Everything else exists to earn this.

HUD fades out at the start. The player is no longer managing a run. They are being told who they were.

| Beat | t | Motion |
|---|---|---|
| Fade world | 0–400 | Scene + HUD out, black |
| Preamble | 400 | `החיים שלך הסתיימו.` |
| Hold | 900 | Nothing. This silence is the feature. |
| Prompt | 1300 | `אתה הוא...` |
| Hold | 2100 | Longer than is comfortable. |
| Flash | 2200 | 80ms white/orange flash (8% opacity, not a strobe) |
| Name | 2280 | Member name slam + overshoot |
| Portrait | 2480 | Pop (scale 0.8 → 1.06 → 1). Art can be placeholder. |
| Role | 2680 | Fade, orange |
| Stats | 2860 | Numbers count from 0 to final over 400ms |
| Blurb | 3200 | Fade |
| Recap | 3500 | First 5 log lines stagger 60ms |
| Actions | 3800 | Share primary, New Life secondary |

Tap anywhere after t=400 skips to **name already visible** (t=2280 state), then the rest may continue or appear at once. Never skip the name itself — that is the product.

Share button does not appear until the name has been on screen for 400ms. We do not ask them to share a blank.

**New Life** is visually equal to Share in weight after first play? No. First ending: Share is primary (orange), New Life is secondary. After they share *or* after 6 seconds, pulse New Life once. The metric we want is replay, but the *feeling* we want first is "I have to show someone."

Shuni ticket CTA (roadmap Phase 3) sits **below** both, after the blurb, as the punchline. It does not appear before the name. It does not compete with Share.

### 8. Share landing — the friend's show

`/life/r/[runId]` is not a screenshot of the ending. It is a shorter cover of the same song.

| Beat | t | Motion |
|---|---|---|
| Band | 0 | Fade |
| אתה הוא / הפכת ל | 80 | Fade |
| Name | 160 | Slam (same as ending, faster) |
| Role + stats | 360 | Fade |
| Dare | 500 | `מה אתה תהיה?` |
| CTA | 600 | התחל חיים — primary, full width |

Recap is collapsed by default (`החיים שלהם בקצרה ▸`). The friend should want their *own* life, not finish reading someone else's.

OG image stays instant and complete — crawlers do not watch animation.

### 9. Restart

New Life is not a browser refresh. Crossfade 200ms to title. Do not replay the email gate if we already have a subscriber on this device (if that path exists later). For now, returning to title is correct; the second-run email ask should feel lighter when we get there — that is a copy A/B, not a motion task.

---

## Mood, risk, and rarity

Content already authors these. The UI must finally listen.

### Mood → tempo and grade

Applied as `data-mood` on `.game-surface`. CSS variables override the house beat.

| Mood | Enter | Choice delay | Outcome | Grade | Extra |
|---|---|---|---|---|---|
| `neutral` | house (400ms) | 40ms | house | none | — |
| `funny` | 300ms, slight bounce on choices | 0 | snap; deltas 60ms stagger | warm (+4% orange wash on well) | punchline lands faster than the player expects |
| `tense` | 520ms, no bounce | 160ms extra hold before choices enable | 200ms extra before label | vignette 12%, cooler | roll uses the long dice beat |
| `epic` | 560ms, headline tracking +0.04em | 80ms | flash 80ms then label | +8% contrast | stage-clear-like slam on headline |
| `sad` | 640ms, no overshoot | 120ms | slow fade, no pop | desaturate scene 20% | no shake even on negative deltas |

Reduced motion: grade (color) may remain; tempo collapses.

### Risk — rolls

A choice with `roll` is a different template.

1. Button shows 🎲 before press.
2. After commit lock: well holds, a 🎲 ticks 3–5 times over 450–700ms (`tense` uses 700, `funny` uses 450).
3. Tick rate eases in (faster at the end) — slot-machine rule, then stop.
4. Outcome label lands on the stop frame. Deltas follow.

Never show both roll outcomes. The unchosen universe does not exist.

### Rarity — a whisper, not a banner

Do **not** stamp `נדיר` on the card. Superfan bait dies if you label it.

| Rarity | Tell |
|---|---|
| `common` | House motion |
| `rare` | Kicker uses overshoot; 80ms orange flash on enter; +80ms hold |
| `ultra` | Same as rare + 2px shake on enter + slightly longer hold. Still no badge. |

Players who know will feel it. Players who don't just think this card was cooler.

### Keystone events

The routing spine (קוקילידה, היידה ניצחונות, תופס אוויר, שירת המתפרנסים, עכשיו זה הזמן) should use the `epic` enter even if authored `neutral`/`funny` — **or** we add `weight >= 10` as a UI hint for "this one matters." Prefer reading `weight >= 10` so content stays the source of truth. No copy change required.

---

## Timing bible

Quick reference. If a PR disagrees with this table, the table wins until this doc is updated.

| Moment | Duration | Skip? |
|---|---|---|
| Button squash | 80ms | no (reduced-motion: color only) |
| Event enter (neutral) | 400ms | no — it's the read |
| Event enter (sad) | 640ms | tap after 200ms |
| Choice lock hold | 120ms | no |
| Roll ticker | 450–700ms | tap |
| Outcome → auto-advance | 1400ms from outcome start | tap Continue |
| Flavor-only outcome auto | 1100ms | tap |
| Stage clear | 1600ms | tap |
| Title → email | 200ms | no |
| Email assemble | 900ms (or until server returns, whichever later) | no |
| Ending hold before name | 2200ms | tap → jump to name |
| Name slam | 320ms | no |
| Stat count-up | 400ms | reduced-motion: instant |
| Share page name | 200ms | n/a |
| HUD bar fill | 400ms | reduced-motion: instant |
| HUD pulse | 200ms | reduced-motion: skip |
| Ghost drain | 300ms | reduced-motion: skip |
| Screen shake (bad) | 180–280ms, 4–6px | reduced-motion: skip |
| Screen shake (ultra enter) | 180ms, 2px | reduced-motion: skip |
| Rare flash | 80ms | reduced-motion: skip |

**Budget:** a typical event (enter + read + choose + outcome) should stay in the 8–14 second pocket. Ceremony (stage, ending) is extra and rare. If juice pushes a common event over ~16s of *waiting*, cut the juice, not the copy.

---

## Phased plan

Phases are UX-only. They can run in parallel with art and content. Each phase is shippable alone and must respect reduced motion.

Suggested order is **felt impact per day**, not narrative order.

### UX-0 — Motion system ✅ COMPLETE (2026-09-06)

**Goal:** every later phase has tokens and hooks. Nothing new should invent a duration.

**Player-visible change:** almost none, except slightly more consistent button/HUD easing.

- [x] Add `--g-t-*` and `--g-ease-*` tokens on `.game-root` and `.game-share-page` in `game.css`
- [x] Add `data-screen`, `data-mood`, `data-rarity` on `.game-surface` from `GameShell`
- [x] Centralize `prefers-reduced-motion` so one block kills travel/shake/stagger
- [x] Small helper: `usePrefersReducedMotion()` for JS sequences (ending, assemble, roll)
- [x] Document in this file if a token changes

**Implementation notes:**
- Tokens live on `.game-root, .game-share-page` (shared selector at top of `game.css`).
- Hook and `GAME_DURATION` const at `src/game/ui/usePrefersReducedMotion.ts`.
- HUD bar fill maps to `--g-t-hold` (450ms) — timing bible says 400ms; closest token is hold. Do **not** add a separate 400ms token.
- All existing hardcoded durations (`0.08s`, `0.12s`, `0.15s`, `0.3s`, `0.4s`) are now tokens.
- Squash scale corrected to `0.97` per motion language spec (was `0.98`).
- `globals.css` nuclear kill uses `:not(.game-root *):not(.game-share-page *)` to exempt game elements; game.css manages its own reduce contract entirely.
- Forward-looking stubs for `.game-shake` and `.game-stagger` in the reduce block so UX-1+ cannot ship them without a reduce twin.

**Done when:** a new animation can be written using only tokens; reduced-motion has a single source of truth. ✓

**Maps to:** foundation for roadmap Phase 1 polish.

---

### UX-1 — The decision loop

**Goal:** the 90% of play time feels like a game. Highest New Life leverage after the ending.

**Player-visible change:** cards arrive, choices commit, numbers hit the body.

- [ ] Event enter choreography (kicker → headline → body → staggered choices)
- [ ] Disable choices until enter completes
- [ ] Choice commit lock (unchosen fade, chosen holds)
- [ ] Outcome well transition (old exits up, new enters)
- [ ] Stat delta stagger + existing pop, wired to tokens
- [ ] HUD: pulse + fill + ghost-on-loss, same frame as the matching delta
- [ ] Auto-advance outcome at 1400ms; Continue is a skip (`autoFocus` kept)
- [ ] First-event extra 200ms hold
- [ ] Screen-shake token class for negative deltas ≥ 8 (roadmap already lists this)

**Done when:** playing three events with eyes on the HUD, the player can tell what changed without reading the well.

**Maps to:** roadmap Phase 1 polish (shake, delta pop).

---

### UX-2 — Mood, risk, rarity

**Goal:** the content's personality reaches the thumb.

- [ ] `data-mood` drives tempo + grade table above
- [ ] 🎲 on roll choices
- [ ] Roll ticker template (450–700ms, mood-scaled, skippable)
- [ ] Rare / ultra enter whisper (no badge)
- [ ] `weight >= 10` uses epic headline slam
- [ ] Sad path: no overshoot, no shake on small losses

**Done when:** `trip-mayim-amukim` (tense + roll) and `school-hayom-ani-lo` (funny) feel like different games without different layouts.

**Maps to:** unused schema fields finally earning their keep.

---

### UX-3 — Chapter ceremony

**Goal:** seven stages feel like a life, not a playlist.

- [ ] Full-surface stage-clear sequence (dim → סוף X → hold → slam next → auto)
- [ ] Age label on the HUD updates *after* the slam, with a 200ms pulse
- [ ] Scene crossfade when `event.scene` changes (320ms)
- [ ] Last stage does not use this template — it hands off to the ending
- [ ] Optional: a 3-tick age rumble (`13 · 16 · 18`) only if it stays under 400ms. Cut if it feels like a slot.

**Done when:** a player asked "what stage are you in?" can answer from memory of the slam, not the tiny uppercase strip.

**Maps to:** the BitLife "Age" ritual.

---

### UX-4 — Birth (title + email)

**Goal:** the funnel feels like the opening cutscene.

- [ ] Title enter / idle breath / exit to email
- [ ] Email assemble sequence on successful submit
- [ ] Hold assemble if `startRun` is slow; never a lonely spinner
- [ ] Error shake + existing message
- [ ] Smash cut into first event (pairs with UX-1 first-event hold)

**Done when:** a playtester describes the email step as "the game starting," not "a signup form."

**Maps to:** concept doc email framing; roadmap "prettier spinner" — replaced by this sequence.

---

### UX-5 — Ending show

**Goal:** the peak. Ship this the moment UX-1 is in.

- [ ] Full ending timeline (silence → אתה הוא... → flash → name slam → portrait pop → role → count-up → blurb → recap → actions)
- [ ] Tap-to-skip-to-name
- [ ] Share withheld until name has been visible 400ms
- [ ] New Life pulse once after share or 6s
- [ ] Slot reserved below actions for Shuni CTA (copy already in the concept doc) — implement when Phase 3 says so
- [ ] `aria-live` polite on the name; assertive not needed

**Done when:** watching a first-time player, there is a visible pause *before* they tap Share — they are still arriving.

**Maps to:** roadmap Phase 1 "better ending animation" and Phase 3 virality.

---

### UX-6 — Share landing and replay hook

**Goal:** the friend feels dared, not briefed.

- [ ] Share-page mini-reveal (faster ending grammar)
- [ ] Recap collapsed by default
- [ ] Primary CTA: התחל חיים
- [ ] Share text stays the punchline: `חייתי חיים שלמים והפכתי ל[name]. מה אתה תהיה?`
- [ ] After New Life, skip or soften email on known subscriber (product decision — flag it, don't silently drop consent)
- [ ] WhatsApp / stories image formats stay a Phase 3 art+layout task; this phase only makes the *on-page* landing feel like a show

**Done when:** a shared link played on a second phone makes someone tap the CTA before scrolling.

**Maps to:** roadmap Phase 3 share experience.

---

### UX-7 — Completeness (haptics, sync, scars)

**Goal:** the loop feels finished. Do this after 1–6, not instead.

- [ ] `navigator.vibrate` patterns (Android; no-op on iOS Safari): 10ms tap, 20ms gain, 30ms loss, `[10, 40, 30]` on name slam. Off under reduced motion.
- [ ] SFX sync points in the audio stub — fire on the same frame as the visual, even if files are silent. IDs already listed in the roadmap: `stat-up`, `stat-down`, `choice-select`, `stage-clear`. Add `roll-tick`, `reveal-slam`, `rare-enter`.
- [ ] Flying stat numbers well → HUD
- [ ] Recap lines as a readable life (stage dots, not a raw dump of the first five choices)
- [ ] Keyboard: arrows move between choices, Enter commits, Space skips ceremony
- [ ] Focus rings stay 3px orange (brand rule)
- [ ] Accessibility pass: contrast on `#aaa` body text, live regions, tap targets already 52px — keep them
- [ ] A/B hooks for email assemble copy and ending hold length (900 vs 1300 vs 2200) if analytics land

**Done when:** turning sound and haptics off still works; turning them on makes the same moments feel thicker, not different.

---

## Implementation notes

Constraints from [architecture](./architecture.md) still apply.

| Do | Don't |
|---|---|
| CSS + Web Animations API inside the game island | Phaser, Pixi, canvas animation libraries |
| Keep motion in `game.css` + small hooks in `GameShell` | Import Framer Motion / GSAP unless a sequence truly cannot be WAAPI |
| Drive sequences from `screen` + `data-*` | Scatter `setTimeout` in five components with magic numbers |
| One `playBeat(name)` helper that no-ops under reduced motion | Per-component `prefers-reduced-motion` copies |
| View Transitions API as progressive enhancement for screen swaps | Depend on it for meaning |
| Logical CSS properties | `left` / `right` in new motion |
| Keep the engine pure — UI sequences read `GameState`, they never write it | Animate by mutating stats toward the target inside the engine |

### Suggested shell hooks (do not implement in this doc)

```
data-screen="title | email | playing | outcome | stage-clear | ending"
data-mood="neutral | tense | funny | epic | sad"
data-rarity="common | rare | ultra"
data-beat="enter | lock | roll | deltas | slam | reveal"
```

`GameShell` already owns `screen`. Mood and rarity come from `currentEvent`. A thin `useGameMotion()` can wait, skip, and respect reduced motion so `EndingScreen` is not a pile of timeouts.

### What not to animate

- Affinity numbers (they are invisible forever)
- Checkpoint / network status (debounced, fire-and-forget)
- Pixel-art nearest-neighbor scaling (crisp stays crisp; do not bilinear-filter a sprite to "smooth" a transition)
- The legal consent row

---

## Success metrics

Juice that cannot be felt in a metric is optional.

| Signal | How we'll know UX worked |
|---|---|
| **New Life rate** | ≥ 20% tap התחל חיים חדשים on the ending (concept / roadmap target) |
| **Completion rate** | Email-submit → ending. If this drops after UX-1, we added friction — roll back auto-advance waits |
| **Time-to-first-choice** | Title tap → first choice visible. Assemble + enter should land ~2s, not ~6s |
| **Share rate** | Ending → successful share intent. If name slam is skippable too early, this falls |
| **Drop-off by stage** | If school → army falls off, ceremony is too long or army enter is cold |
| **Qualitative** | Playtesters laugh *on the tap*, not after they have already moved on. They can retell two stages by name. They argue about who they became. |

Instrument in roadmap Phase 3 analytics. Until then, sit behind three phones and watch thumbs.

---

## Explicitly out of scope

- Sprite work, portraits, scene illustration, expression frames (art track)
- New events, copy rewrites, affinity math (content track)
- LLM recap prose (roadmap later)
- Admin CMS
- English localization
- Swipe-to-choose as a replacement for buttons
- Per-event minigames
- Unskippable cinematic longer than the timing bible
- Motion that ignores `prefers-reduced-motion`
- Showing hidden affinities "just for juice"

When art lands, expressions and screen-shake pair naturally with UX-1 / UX-7. The motion language does not change.
