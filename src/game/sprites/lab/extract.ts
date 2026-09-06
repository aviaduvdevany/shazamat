/**
 * Layer extraction helpers for the paper-doll sprite system.
 *
 * PixelLab generates a full body image for inpaint; we then need to isolate
 * only the relevant layer pixels (shirt region, pants region, face region, etc.)
 * by applying the alignment masks from sprite-guide.md §2.
 *
 * Strategy:
 *   1. Build a white mask that covers only the target region.
 *   2. Feed the body image + mask to /inpaint-v3 with the layer-specific prompt.
 *   3. The result has the generated pixels in the masked region + transparency elsewhere.
 *
 * This file also exports mask-builders so the CLI and admin can call inpaint correctly.
 */

import type { PixelLabImage } from "./client";

// ── Alignment boxes from sprite-guide.md §2 ────────────────────────────────
// All values are pixel coordinates in the 64×64 canvas.

/**
 * All layer boxes use the full 64×64 canvas.
 *
 * For edit-diff generation the pixel diff already provides exact alignment —
 * only pixels that actually changed are kept. Restricting to a sub-box would
 * silently discard valid pixels at the edges of each region. Full canvas + diff
 * threshold is both simpler and more correct, and works for every body type
 * (child / teen / adult) without any per-body coordinate calculation.
 *
 * The FACE_CARVE_OUT below is the one exception: it prevents hair pixels from
 * bleeding onto the face area (since hair and face can overlap geometrically).
 */
export const LAYER_BOXES = {
  body:       { x: 0, y: 0, w: 64, h: 64 },
  pants:      { x: 0, y: 0, w: 64, h: 64 },
  shirt:      { x: 0, y: 0, w: 64, h: 64 },
  hair:       { x: 0, y: 0, w: 64, h: 64 },
  expression: { x: 0, y: 0, w: 64, h: 64 },
  accessory:  { x: 0, y: 0, w: 64, h: 64 },
  instrument: { x: 0, y: 0, w: 64, h: 64 },
} as const;

/**
 * Regions to carve OUT of a layer's mask — these areas are managed by
 * another layer and must stay transparent in the current layer's PNG.
 * Applied in both buildMaskPng (so inpaint never touches them) and
 * isolateLayer (so any bleed from the original body is zeroed out).
 *
 * Hair carve-out uses a generous face box that covers both adult (x:14–51, y:7–26)
 * and child (x:16–41, y:9–20) faces so hair never bleeds onto the face region.
 */
const FACE_CARVE_OUT = { x: 13, y: 7, w: 39, h: 20 } as const;
const LAYER_CARVE_OUTS: Partial<
  Record<keyof typeof LAYER_BOXES, Array<{ x: number; y: number; w: number; h: number }>>
> = {
  hair: [FACE_CARVE_OUT],
};

export type LayerName = keyof typeof LAYER_BOXES;

/**
 * Build a minimal valid 64×64 PNG containing a white rectangle over `layer`
 * and black everywhere else. This is the mask for /inpaint-v3
 * (white = generate, black = keep).
 */
export async function buildMaskPng(layer: LayerName): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  const SIZE = 64;
  const { x, y, w, h } = LAYER_BOXES[layer];

  const carveOuts = LAYER_CARVE_OUTS[layer] ?? [];

  // Build raw RGBA — all black/opaque, then white the mask region
  const pixels = Buffer.alloc(SIZE * SIZE * 4, 0);
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const idx = (py * SIZE + px) * 4;
      const inBox = px >= x && px < x + w && py >= y && py < y + h;
      const inCarve = carveOuts.some(
        (r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h
      );
      const v = inBox && !inCarve ? 255 : 0;
      pixels[idx] = v;
      pixels[idx + 1] = v;
      pixels[idx + 2] = v;
      pixels[idx + 3] = 255;
    }
  }

  return sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png()
    .toBuffer();
}

/**
 * After inpaint returns the full 64×64 composited image, isolate only the
 * mask region: pixels outside the region become fully transparent.
 * This gives us the sparse overlay the compositor expects.
 */
export async function isolateLayer(
  inpaintBuffer: Buffer,
  layer: LayerName
): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  const { x, y, w, h } = LAYER_BOXES[layer];
  const carveOuts = LAYER_CARVE_OUTS[layer] ?? [];
  const SIZE = 64;

  const { data } = await sharp(inpaintBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data.buffer);
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const inBox = px >= x && px < x + w && py >= y && py < y + h;
      const inCarve = carveOuts.some(
        (r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h
      );
      if (!inBox || inCarve) {
        const idx = (py * SIZE + px) * 4;
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }

  return sharp(Buffer.from(pixels), {
    raw: { width: SIZE, height: SIZE, channels: 4 },
  })
    .png()
    .toBuffer();
}

/**
 * Approach A — edit-image-pixen diff:
 * Compare the edited image against the original base sprite and keep only
 * pixels that changed significantly within the layer box (minus carve-outs).
 * Works because edit-image-pixen preserves all non-edited pixels verbatim.
 */
export async function extractLayerByDiff(
  editedBuffer: Buffer,
  baseBuffer: Buffer,
  layer: LayerName,
  diffThreshold = 20
): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  const { x, y, w, h } = LAYER_BOXES[layer];
  const carveOuts = LAYER_CARVE_OUTS[layer] ?? [];
  const SIZE = 64;

  const { data: edited } = await sharp(editedBuffer)
    .resize(SIZE, SIZE, { kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data: base } = await sharp(baseBuffer)
    .resize(SIZE, SIZE, { kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(SIZE * SIZE * 4);

  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const idx = (py * SIZE + px) * 4;
      const inBox = px >= x && px < x + w && py >= y && py < y + h;
      const inCarve = carveOuts.some(
        (r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h
      );

      if (!inBox || inCarve) {
        pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = pixels[idx + 3] = 0;
        continue;
      }

      const dr = Math.abs(edited[idx] - base[idx]);
      const dg = Math.abs(edited[idx + 1] - base[idx + 1]);
      const db = Math.abs(edited[idx + 2] - base[idx + 2]);
      const delta = Math.max(dr, dg, db);

      if (delta >= diffThreshold) {
        pixels[idx] = edited[idx];
        pixels[idx + 1] = edited[idx + 1];
        pixels[idx + 2] = edited[idx + 2];
        pixels[idx + 3] = 255;
      } else {
        pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = pixels[idx + 3] = 0;
      }
    }
  }

  return sharp(Buffer.from(pixels), {
    raw: { width: SIZE, height: SIZE, channels: 4 },
  })
    .png()
    .toBuffer();
}

/**
 * Approach B — standalone wig:
 * Paste a small part PNG (e.g. 36×26 hair piece) onto a 64×64 transparent
 * canvas at the layer's origin. Then zero out any carve-out regions.
 */
export async function pasteOntoCanvas(
  partBuffer: Buffer,
  layer: LayerName,
  canvasSize = 64
): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  const { x, y } = LAYER_BOXES[layer];
  const carveOuts = LAYER_CARVE_OUTS[layer] ?? [];

  // Start with transparent canvas and composite the part at the layer origin
  let composite = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: partBuffer, left: x, top: y }])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(composite.data.buffer);

  // Zero out carve-out regions
  for (const r of carveOuts) {
    for (let py = r.y; py < r.y + r.h; py++) {
      for (let px = r.x; px < r.x + r.w; px++) {
        const idx = (py * canvasSize + px) * 4;
        pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = pixels[idx + 3] = 0;
      }
    }
  }

  return sharp(Buffer.from(pixels), {
    raw: { width: canvasSize, height: canvasSize, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** Encode a raw PNG buffer as a PixelLabImage with size annotation */
export function toInpaintImage(
  buf: Buffer,
  size: { width: number; height: number }
): { image: PixelLabImage; size: { width: number; height: number } } {
  return {
    image: {
      type: "base64",
      base64: buf.toString("base64"),
      format: "png",
    },
    size,
  };
}
