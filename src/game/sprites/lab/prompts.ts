/**
 * Style-lock prompts from sprite-guide.md §7.
 * Compose the full generation prompt for any asset.
 */

import type { LabAsset } from "./inventory";

// ── Style locks ──────────────────────────────────────────────────────────────

/** Prepended to every sprite part and portrait generation */
export const STYLE_LOCK_PART = [
  "64x64 pixel art game sprite, front-facing, transparent background,",
  "1px dark #1A120C outline, nearest-neighbor pixel art, limited 12-color palette,",
  "no anti-aliasing, no blur, no gradients, no drop shadow, no scanlines,",
  "Earthbound / Mother 3 overworld proportions, slightly awkward,",
  "Israeli Mediterranean male, warm olive-tan skin (#C4845C), not pale,",
  "not anime, not chibi, not cute, not painterly, not HD pixel art, not 3D,",
  "not photoreal, isolated on transparency",
].join(" ");

/** Used for 96×96 portraits (same style, different canvas call-out) */
export const STYLE_LOCK_PORTRAIT = [
  "96x96 pixel art bust portrait, head and shoulders, front-facing,",
  "transparent background, 1px #1A120C outline, limited palette,",
  "no anti-aliasing, recognizable as a specific person,",
  "Israeli man, hip-hop / live-band energy, not caricature-mean,",
  "not anime, not chibi, not photoreal, isolated on transparency",
].join(" ");

/** Appended to member portrait prompts */
export const PORTRAIT_ADDON = [
  "pixel art bust of an Israeli hip-hop band member, head and shoulders, 96x96,",
  "distinct silhouette, instrument prop as specified, same world palette,",
  "orange #DB7738 may appear as a 1px rim light only",
].join(" ");

/** Prepended to every scene */
export const STYLE_LOCK_SCENE = [
  "160x144 pixel art background, Game Boy Color screen, fully opaque,",
  "4 to 6 large readable shapes, subject centered, brighter and more saturated",
  "than realism (will display at 60% opacity), limited palette, no anti-aliasing,",
  "no blur, no readable text, no logos, no UI chrome, Israeli real-life location,",
  "street-pixel grit, brand orange #DB7738 as the single accent,",
  "not anime, not Stardew pastoral, not cyberpunk, not photoreal",
].join(" ");

/** Always added as negative_description */
export const NEGATIVE_PROMPT = [
  "anti-aliasing, blur, glow, drop shadow, gradient smoothness, scanlines,",
  "chromatic aberration, anime, chibi, sparkle, blush, cute, kawaii, Stardew,",
  "pastoral, cyberpunk neon, vaporwave, photorealistic, 3D render, cinematic",
  "lighting, readable text, watermark, logo, wordmark, female, child face on",
  "adult body, pale peach skin as default, extra fingers, extra limbs,",
  "sprite sheet, animation frames, multiple poses, side view",
].join(" ");

// ── Prompt composer ──────────────────────────────────────────────────────────

export interface ComposedPrompt {
  description: string;
  negativeDescription: string;
}

export function composePrompt(asset: LabAsset): ComposedPrompt {
  const seed = asset.promptSeed;

  switch (asset.family) {
    case "portrait": {
      return {
        description: [STYLE_LOCK_PORTRAIT, seed, PORTRAIT_ADDON].join(". "),
        negativeDescription: NEGATIVE_PROMPT,
      };
    }
    case "scene": {
      return {
        description: [STYLE_LOCK_SCENE, seed].join(". "),
        negativeDescription: NEGATIVE_PROMPT,
      };
    }
    default: {
      return {
        description: [STYLE_LOCK_PART, seed].join(". "),
        negativeDescription: NEGATIVE_PROMPT,
      };
    }
  }
}
