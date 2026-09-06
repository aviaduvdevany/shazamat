/**
 * Post-process a generated PNG through the PixelLab cleanup pipeline,
 * then run local sharp-based QA checks.
 *
 * Pipeline:
 *   1. reduce-colors → snap to art-bible palette (shared across a batch)
 *   2. correct-pixelart → remove AA fringe
 *   3. Local: wipe semi-transparent edge pixels (< 128 alpha → 0)
 *   4. Local: assert exact canvas dimensions
 *   5. For sprite parts: nearest-neighbor resize to confirm 64×64 grid
 */

import type { PixelLabClient, PixelLabImage } from "./client";
import { bufferToPixelLabImage, pixelLabImageToBuffer } from "./client";
import type { LabAsset } from "./inventory";
import { PALETTE_PNG_PATH, ensurePalettePng, palettePngToBase64 } from "./palette";

export interface ProcessOptions {
  /** Skip palette reduction (useful for portraits where you want to keep ginger hair) */
  skipPaletteReduction?: boolean;
  /** sharp correction strength 0-1 (default: 0.1 = light tidy) */
  correctionStrength?: number;
}

export interface ProcessResult {
  processedBuffer: Buffer;
  width: number;
  height: number;
}

/**
 * Run the full post-process pipeline on a raw PNG buffer.
 * Returns the final buffer ready to write to .sprites/.
 */
export async function processSprite(
  rawBuffer: Buffer,
  asset: LabAsset,
  client: PixelLabClient,
  opts: ProcessOptions = {}
): Promise<ProcessResult> {
  const { default: sharp } = await import("sharp");

  let current = rawBuffer;

  // Step 1 — palette reduction (scene: opaque; parts: skip if opted out)
  if (!opts.skipPaletteReduction) {
    await ensurePalettePng();
    const paletteBase64 = palettePngToBase64();
    const reducedRes = await client.reduceColors({
      images: [bufferToPixelLabImage(current)],
      palette_image: {
        type: "base64",
        base64: paletteBase64,
        format: "png",
      },
      dithering: "none",
    });
    if (reducedRes.images.length > 0) {
      current = pixelLabImageToBuffer(reducedRes.images[0]);
    }
  }

  // Step 2 — correct pixel art (light strength by default)
  const correctedRes = await client.correctPixelart({
    images: [bufferToPixelLabImage(current)],
    strength: opts.correctionStrength ?? 0.1,
  });
  if (correctedRes.images.length > 0) {
    current = pixelLabImageToBuffer(correctedRes.images[0]);
  }

  // Step 3 — local: wipe semi-transparent edge pixels for parts
  if (asset.noBackground) {
    current = await wipeAlphaFringe(current, sharp);
  }

  // Step 4 — verify and resize to exact canvas
  const [targetW, targetH] = asset.canvas;
  const meta = await sharp(current).metadata();
  const actualW = meta.width ?? 0;
  const actualH = meta.height ?? 0;

  if (actualW !== targetW || actualH !== targetH) {
    // Nearest-neighbor resize to target
    current = await sharp(current)
      .resize(targetW, targetH, { kernel: "nearest", fit: "fill" })
      .png()
      .toBuffer();
  }

  return { processedBuffer: current, width: targetW, height: targetH };
}

/** Strip pixels with alpha < 128 to full transparent (remove AA fringe) */
async function wipeAlphaFringe(
  buf: Buffer,
  sharp: typeof import("sharp").default
): Promise<Buffer> {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data.buffer);
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 128) {
      pixels[i - 3] = 0;
      pixels[i - 2] = 0;
      pixels[i - 1] = 0;
      pixels[i] = 0;
    }
  }

  return sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/**
 * Quick local QA check — returns a list of issues (empty = pass).
 */
export async function qaCheck(
  processedBuffer: Buffer,
  asset: LabAsset
): Promise<string[]> {
  const { default: sharp } = await import("sharp");
  const issues: string[] = [];
  const [targetW, targetH] = asset.canvas;

  const meta = await sharp(processedBuffer).metadata();
  if (meta.width !== targetW || meta.height !== targetH) {
    issues.push(
      `Size mismatch: expected ${targetW}×${targetH}, got ${meta.width}×${meta.height}`
    );
  }
  if (meta.format !== "png") {
    issues.push(`Format must be PNG, got ${meta.format}`);
  }
  if (asset.noBackground && meta.channels !== 4) {
    issues.push(`Expected RGBA (4 channels) for transparent sprite, got ${meta.channels}`);
  }

  // Count colors — warn if > 16 for sprite parts
  if (asset.family !== "scene") {
    const { data, info } = await sharp(processedBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const colorSet = new Set<string>();
    const ch = info.channels;
    for (let i = 0; i < data.length; i += ch) {
      // Skip fully transparent pixels
      if (ch === 4 && data[i + 3] === 0) continue;
      colorSet.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
    }
    if (colorSet.size > 20) {
      issues.push(
        `High color count (${colorSet.size}) — art bible allows 12–16 per sprite`
      );
    }
  }

  return issues;
}
