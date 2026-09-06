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

export const LAYER_BOXES = {
  /** Full canvas — for bodies (include everything) */
  body: { x: 0, y: 0, w: 64, h: 64 },
  /** Pants: hips to shoes */
  pants: { x: 18, y: 42, w: 28, h: 22 },
  /** Shirt: torso + sleeves */
  shirt: { x: 16, y: 24, w: 32, h: 21 },
  /** Hair: scalp + overflow */
  hair: { x: 14, y: 0, w: 36, h: 26 },
  /** Expression: face box — works for both child and adult */
  expression: { x: 22, y: 8, w: 20, h: 11 },
  /** Accessory: full canvas (sparse overlay) */
  accessory: { x: 0, y: 0, w: 64, h: 64 },
  /** Instrument: full canvas */
  instrument: { x: 0, y: 0, w: 64, h: 64 },
} as const;

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

  // Build raw RGBA — all black/opaque, then white the mask region
  const pixels = Buffer.alloc(SIZE * SIZE * 4, 0);
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const idx = (py * SIZE + px) * 4;
      const inMask = px >= x && px < x + w && py >= y && py < y + h;
      const v = inMask ? 255 : 0;
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
  const SIZE = 64;

  const { data } = await sharp(inpaintBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data.buffer);
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const inMask = px >= x && px < x + w && py >= y && py < y + h;
      if (!inMask) {
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
