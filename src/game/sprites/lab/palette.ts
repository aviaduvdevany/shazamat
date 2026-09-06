/**
 * Art-bible shared palette (sprite-guide.md §4).
 * Used to generate .sprites/palette.png for forced color reduction,
 * and to supply color_image to Pixflux when generating scenes.
 */

import { join } from "path";
import fs from "fs";

export const PALETTE_COLORS: string[] = [
  // Brand
  "#000000",
  "#FFFFFF",
  "#DB7738",
  "#0A0A0A",
  "#1A1A1A",
  "#AAAAAA",
  // Skin — Mediterranean / Israeli
  "#E0A87A",
  "#C4845C",
  "#8F5A3A",
  "#5C3A24",
  // Hair / outline
  "#1A120C",
  "#2A1F18",
  "#4A3428",
  // Nir ginger (portrait only)
  "#C45A2A",
  "#E07A3A",
  "#8A3A18",
  // Clothes / world
  "#4A5C3A",
  "#6B7A4E",
  "#2F3A24",
  "#3A4A6A",
  "#5A6A8A",
  "#D4C8B8",
  "#1E1E1E",
  "#D4A01A",
  "#00C2B8",
  "#C43A6A",
  "#C46A28",
  "#E8E06A",
  "#8AB4C8",
  "#8A7A62",
];

/** Path of the generated palette swatch image */
export const PALETTE_PNG_PATH = join(process.cwd(), ".sprites", "palette.png");

/** Generate a horizontal swatch PNG using Sharp and write to .sprites/palette.png */
export async function ensurePalettePng(): Promise<void> {
  if (fs.existsSync(PALETTE_PNG_PATH)) return;

  const { default: sharp } = await import("sharp");
  const colors = PALETTE_COLORS;
  const swatchSize = 16;
  const width = colors.length * swatchSize;
  const height = swatchSize;

  // Build raw RGBA buffer
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < colors.length; i++) {
    const hex = colors[i].replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    for (let py = 0; py < swatchSize; py++) {
      for (let px = 0; px < swatchSize; px++) {
        const idx = ((py * width) + (i * swatchSize + px)) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    }
  }

  fs.mkdirSync(join(process.cwd(), ".sprites"), { recursive: true });
  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(PALETTE_PNG_PATH);
}

/** Read palette.png as a base64 string suitable for PixelLab's color_image field */
export function palettePngToBase64(): string {
  if (!fs.existsSync(PALETTE_PNG_PATH)) {
    throw new Error("Palette PNG not found — run ensurePalettePng() first");
  }
  return fs.readFileSync(PALETTE_PNG_PATH).toString("base64");
}
