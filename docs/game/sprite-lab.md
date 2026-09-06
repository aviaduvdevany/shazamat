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

Always start with `look-adult` — a complete clothed adult. It becomes the style lock / edit input for every other look:

```bash
npm run sprites:generate -- --id look-adult --n 4
```

Once `look-adult` is approved, generate age jumps and outfit edits:

```bash
npm run sprites:generate -- --batch A --family look
npm run sprites:generate -- --batch A --family scene
```

### 4. Review in the studio

Open [http://localhost:3000/admin/game/sprites](http://localhost:3000/admin/game/sprites) in a browser (requires admin login).

- Pick the best variant in the version strip
- Click **Approve selected**
- Click **Promote to game**

Or use the CLI for headless workflows:

```bash
npm run sprites:approve -- --id look-adult --version <versionId>
npm run sprites:promote -- --id look-adult
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
inventory.ts (looks + scenes + portraits from sprite-guide)
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

Wave order matters. Edit assets need a parent version on disk (approved if you picked one, otherwise the latest draft). The CLI generates waves in order and skips already-approved assets on a batch run.

| Wave | Assets | Dependency |
|------|--------|------------|
| 1 | `look-adult`, all scenes | none |
| 2 | `look-child`, `look-teen`, `look-soldier-nahal` | look-adult |
| 3 | `look-teen-band`, `look-soldier-golani` | look-teen / look-soldier-nahal |
| 4 | Batch B looks (`look-trip`, `look-wolt`, `look-hitech`, `look-career`, `look-shazamat`) | look-adult |
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
| `pixen` | `POST /create-image-pixen` | Hero look + portraits + UI | ~$0.007 |
| `pixflux` | `POST /create-image-pixflux` | Scenes 160×144 | ~$0.008–0.013 |
| `edit` | `POST /edit-image-pixen` | Age jumps + outfit / hair variants; **keep the full sprite** | ~$0.007 |
| `photo` | `POST /image-to-pixelart-pro` | Portrait from photo ref | ~$0.095 |

Batch A with 4 variants each: roughly a few dollars if most assets use Pixen / edit. Do not extract layers from edits.

---

## Admin Studio features

Navigate to `/admin/game/sprites` while `next dev` is running:

- **Inventory grid** — all 77 assets grouped by family, filtered by batch/family/status
- **Asset detail** — version strip with 4× `image-rendering: pixelated` preview
- **In-scene preview** — candidate look over a 60% scene (the real game viewport)
- **Scene preview** — scene at 60% opacity over `#0a0a0a` (the real game viewport color)
- **Generate / Approve / Promote** buttons — all wired to server actions
- **QA panel** — shows size mismatches, high color count warnings, etc.

Large batch generations (multiple assets at once) should use the CLI, not the admin UI — PixelLab jobs can take several minutes and the admin actions are not designed for long-running parallel batches.

---

## File locations

| Path | Purpose |
|------|---------|
| `src/game/sprites/lab/inventory.ts` | Looks + scenes + portraits table (id, batch, canvas, destPath, model, promptSeed) |
| `src/game/sprites/lab/client.ts` | PixelLab v2 fetch client |
| `src/game/sprites/lab/prompts.ts` | Style-lock + negative prompts from sprite-guide §7 |
| `src/game/sprites/lab/palette.ts` | Art-bible palette + palette.png generator |
| `src/game/sprites/lab/process.ts` | Post-process pipeline (palette snap, correct, alpha wipe, QA) |
| `src/game/sprites/lab/extract.ts` | Legacy layer-mask helpers (unused by the look pipeline) |
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
- [ ] All looks share the same foot line (y=62–63) and center X
- [ ] Every look is fully clothed with hair and a face
- [ ] No readable letters anywhere
- [ ] Player looks have no ginger hair, keyboard, drums, or mic
- [ ] Nir's portrait is the only ginger
- [ ] Scenes still read under 60% black overlay
- [ ] Brand orange `#DB7738` is an accent, not a fill
- [ ] Skin is Mediterranean (`#C4845C`), not peach

Run `npm run game:validate` after all Batch A promotes pass the checklist.
