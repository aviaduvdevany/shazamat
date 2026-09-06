# Sprite Lab — Operator Guide

The Sprite Lab is a local generation pipeline that turns the art-bible into real pixel-art PNGs without touching the engine.

**Companion docs:** [sprite-guide.md](./sprite-guide.md) · [content-authoring.md](./content-authoring.md) · [architecture.md](./architecture.md)

---

## Quick start

### 1. Add your PixelLab token

Get a token from [pixellab.ai/account](https://pixellab.ai/account). Paste it into `.env.local` (already gitignored):

```bash
PIXELLAB_API_TOKEN=your_token_here
```

Check your balance before a big batch:

```bash
npm run sprites:balance
```

### 2. See what needs generating

```bash
npm run sprites:status           # all assets
npm run sprites:status -- --batch A   # Batch A only
```

Legend: `○` missing · `◑` drafted · `◉` approved · `●` live

### 3. Generate variants

Always start with `body-adult` — it becomes the style lock for everything else:

```bash
npm run sprites:generate -- --id body-adult --n 4
```

Once `body-adult` is approved, generate other bodies and clothing:

```bash
npm run sprites:generate -- --batch A --family body
npm run sprites:generate -- --batch A --family scene
```

### 4. Review in the studio

Open [http://localhost:3000/admin/game/sprites](http://localhost:3000/admin/game/sprites) in a browser (requires admin login).

- Pick the best variant in the version strip
- Click **Approve selected**
- Click **Promote to game**

Or use the CLI for headless workflows:

```bash
npm run sprites:approve -- --id body-adult --version <versionId>
npm run sprites:promote -- --id body-adult
# promote everything approved at once:
npm run sprites:promote -- --approved
```

### 5. Validate

After any promote, run the content integrity check:

```bash
npm run game:validate
```

This confirms every `part.file` and `scene.file` exists on disk.

---

## How the pipeline works

```
inventory.ts (77-asset table from sprite-guide §8)
    ↓
generate.ts (PixelLab API call, model-specific)
    ↓
process.ts (reduce-colors → correct-pixelart → alpha wipe → QA)
    ↓
.sprites/assets/{id}/versions/{ver}/
    raw.png          ← straight from PixelLab
    processed.png    ← after cleanup
    meta.json        ← model, seed, prompt, cost, QA issues
    ↓ (approve)
.sprites/index.json  ← approved version locked in
    ↓ (promote)
public/game/{destPath}          ← overwrites or creates the PNG
src/game/content/sprites.ts     ← NEW ids get a catalog row appended
```

The `.sprites/` workdir is gitignored. Only promoted files enter version control.

---

## Generation waves (Batch A)

Wave order matters. Assets marked `model: style` or `model: inpaint` need their `styleRef` approved first.

| Wave | Assets | Dependency |
|------|--------|------------|
| 1 | `body-adult`, expressions neutral/happy/worried, all scenes, all accessories, instruments | none |
| 2 | `body-child`, `body-teen`, `body-soldier` | body-adult approved |
| 3 | `hair-child`, `hair-short`, `hair-buzz` | hair-child approved for short |
| 4 | `pants-*`, `shirt-*` | matching body approved |
| 5 | Portraits (aviad, itay, nimrod, shay, reef, nir, gidon) | optional: drop `.sprites/refs/members/{id}.jpg` for photo path |

---

## Optional: member photo references

Drop real member photos here before generating portraits:

```
.sprites/
  refs/
    members/
      aviad.jpg
      itay.jpg
      nimrod.jpg
      shay.jpg
      reef.jpg
      nir.jpg
      gidon.jpg
```

The lab will route those through `POST /image-to-pixelart-pro` (converts the photo to pixel art) instead of generating from the lore prompt. For Nir, confirm ginger reads at 96×96 before approving.

---

## Models and costs

| Model | Endpoint | When | ~Cost per image |
|-------|----------|------|----------------|
| `pixen` | `POST /create-image-pixen` | Default: parts, portraits, accessories | ~$0.007 |
| `pixflux` | `POST /create-image-pixflux` | Scenes 160×144 | ~$0.008–0.013 |
| `style` | `POST /generate-with-style-v2` | Style-locked follow-ups (teen body etc.) | ~$0.095–0.185 |
| `inpaint` | `POST /inpaint-v3` | Layer extraction (pants, shirt, hair, face) | ~$0.095–0.185 |
| `photo` | `POST /image-to-pixelart-pro` | Portrait from photo ref | ~$0.095 |

Batch A with 4 variants each: roughly $3–8 if most assets use Pixen. Style/inpaint endpoints cost ~10× more per call — use them carefully.

---

## Admin Studio features

Navigate to `/admin/game/sprites` while `next dev` is running:

- **Inventory grid** — all 77 assets grouped by family, filtered by batch/family/status
- **Asset detail** — version strip with 4× `image-rendering: pixelated` preview
- **Compositor** — candidate layer overlaid onto current live sprites (orange outline = candidate)
- **Scene preview** — scene at 60% opacity over `#0a0a0a` (the real game viewport color)
- **Generate / Approve / Promote** buttons — all wired to server actions
- **QA panel** — shows size mismatches, high color count warnings, etc.

Large batch generations (multiple assets at once) should use the CLI, not the admin UI — PixelLab jobs can take several minutes and the admin actions are not designed for long-running parallel batches.

---

## File locations

| Path | Purpose |
|------|---------|
| `src/game/sprites/lab/inventory.ts` | 77-asset table (id, batch, canvas, destPath, model, promptSeed) |
| `src/game/sprites/lab/client.ts` | PixelLab v2 fetch client |
| `src/game/sprites/lab/prompts.ts` | Style-lock + negative prompts from sprite-guide §7 |
| `src/game/sprites/lab/palette.ts` | Art-bible palette + palette.png generator |
| `src/game/sprites/lab/process.ts` | Post-process pipeline (palette snap, correct, alpha wipe, QA) |
| `src/game/sprites/lab/extract.ts` | Layer masks and inpaint region isolation |
| `src/game/sprites/lab/store.ts` | Version store (.sprites/ reader/writer) |
| `src/game/sprites/lab/generate.ts` | Orchestrator (picks model, calls API, post-processes, saves) |
| `src/game/sprites/lab/promote.ts` | Copy approved → public/game/ + catalog update |
| `scripts/sprites.ts` | CLI entry point |
| `src/app/admin/game/sprites/` | Admin studio pages + server actions |
| `src/app/api/sprites/image/route.ts` | Authenticated image endpoint for .sprites/ files |

---

## QA checklist before promoting

These match sprite-guide.md §11:

- [ ] Exact canvas: 64×64 (parts), 160×144 (scenes), 96×96 (portraits)
- [ ] Sprite parts have transparent background (RGBA channels)
- [ ] Scenes are fully opaque
- [ ] No AA fringe — edges are outline or transparent
- [ ] All four bodies share the same foot line (y=62–63) and center X
- [ ] Pants + shirts register on the matching body
- [ ] Hair sits on the scalp without covering the eyes
- [ ] Expressions only touch the face box (x=22–41, y=8–18)
- [ ] No readable letters anywhere
- [ ] Player parts have no ginger hair, keyboard, drums, or mic
- [ ] Nir's portrait is the only ginger
- [ ] Scenes still read under 60% black overlay
- [ ] Brand orange `#DB7738` is an accent, not a fill
- [ ] Skin is Mediterranean (`#C4845C`), not peach

Run `npm run game:validate` after all Batch A promotes pass the checklist.
