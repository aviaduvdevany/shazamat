/**
 * High-level sprite generation orchestrator.
 * Called by both the CLI (scripts/sprites.ts) and the admin server actions.
 *
 * Flow per asset:
 *   1. Determine model (pixen / pixflux / style / inpaint / photo)
 *   2. Call PixelLab API
 *   3. Post-process (palette snap, correct, alpha wipe)
 *   4. QA check
 *   5. Save to .sprites/ store
 *
 * Layer extraction (inpaint) assets also need:
 *   - The approved processed PNG of their styleRef body
 *   - A generated white mask for the target layer region
 */

import path from "path";
import fs from "fs";
import type { LabAsset } from "./inventory";
import { getAsset } from "./inventory";
import {
  PixelLabClient,
  bufferToPixelLabImage,
  pixelLabImageToBuffer,
  type PixelLabImage,
} from "./client";
import { composePrompt } from "./prompts";
import { processSprite, qaCheck } from "./process";
import { buildMaskPng, isolateLayer, toInpaintImage } from "./extract";
import {
  saveVersion,
  getApprovedBuffer,
  type VersionMeta,
} from "./store";
import { ensurePalettePng, palettePngToBase64 } from "./palette";

export interface GenerateOptions {
  seed?: number;
  /** Number of variants to generate (applied at CLI level; generate() produces one) */
  n?: number;
}

export interface GenerateResult {
  versionId: string;
  qaIssues: string[];
  costUsd?: number;
}

/**
 * Generate one version of `asset` and save it to the store.
 * Returns the versionId so callers can optionally approve it.
 */
export async function generateOne(
  asset: LabAsset,
  client: PixelLabClient,
  opts: GenerateOptions = {}
): Promise<GenerateResult> {
  const seed = opts.seed ?? Math.floor(Math.random() * 1_000_000);
  const { description, negativeDescription } = composePrompt(asset);

  let rawBuffer: Buffer;
  let jobId: string | undefined;
  let costUsd: number | undefined;

  const [w, h] = asset.canvas;

  switch (asset.model) {
    case "pixen": {
      const res = await client.createImagePixen({
        description,
        image_size: { width: w, height: h },
        outline: "single color black outline",
        detail: "highly detailed",
        direction: "south",
        no_background: asset.noBackground,
        background_removal_task: "remove_complex_background",
        seed,
      });
      rawBuffer = pixelLabImageToBuffer(res.image);
      costUsd = res.usage?.usd ?? undefined;
      break;
    }

    case "pixflux": {
      await ensurePalettePng();
      const paletteBase64 = palettePngToBase64();
      const res = await client.createImagePixflux({
        description,
        image_size: { width: w, height: h },
        text_guidance_scale: 8,
        no_background: false,
        color_image: { type: "base64", base64: paletteBase64, format: "png" },
        seed,
      });
      rawBuffer = pixelLabImageToBuffer(res.image);
      costUsd = res.usage?.usd ?? undefined;
      break;
    }

    case "style": {
      if (!asset.styleRef) {
        throw new Error(`Asset "${asset.id}" has model=style but no styleRef`);
      }
      const styleBuffer = getApprovedBuffer(asset.styleRef);
      const styleRefAsset = getAsset(asset.styleRef);
      const [styleW, styleH] = styleRefAsset?.canvas ?? [64, 64];
      const job = await client.generateWithStyle({
        style_images: [
          { image: bufferToPixelLabImage(styleBuffer), width: styleW, height: styleH },
        ],
        description,
        no_background: asset.noBackground,
        seed,
      });
      jobId = job.background_job_id;
      const result = await client.waitForJob(jobId);
      const imgData = result.image as PixelLabImage | undefined;
      if (!imgData?.base64) {
        throw new Error(`generateWithStyle job ${jobId} returned no image`);
      }
      rawBuffer = pixelLabImageToBuffer(imgData);
      break;
    }

    case "inpaint": {
      if (!asset.styleRef || !asset.layer) {
        throw new Error(`Asset "${asset.id}" has model=inpaint but missing styleRef or layer`);
      }
      const bodyBuffer = getApprovedBuffer(asset.styleRef);
      const maskBuffer = await buildMaskPng(
        asset.layer as keyof typeof import("./extract").LAYER_BOXES
      );

      const job = await client.inpaintV3({
        description,
        inpainting_image: toInpaintImage(bodyBuffer, { width: 64, height: 64 }),
        mask_image: toInpaintImage(maskBuffer, { width: 64, height: 64 }),
        no_background: true,
        crop_to_mask: false,
        seed,
      });
      jobId = job.background_job_id;
      const result = await client.waitForJob(jobId);
      const imgData = result.image as PixelLabImage | undefined;
      if (!imgData?.base64) {
        throw new Error(`inpaintV3 job ${jobId} returned no image`);
      }
      // Isolate only the layer region — everything outside becomes transparent
      const inpaintFull = pixelLabImageToBuffer(imgData);
      rawBuffer = await isolateLayer(
        inpaintFull,
        asset.layer as keyof typeof import("./extract").LAYER_BOXES
      );
      break;
    }

    case "photo": {
      // Portrait from a reference photo (drop a .jpg in .sprites/refs/members/)
      const memberId = asset.id.replace("-portrait", "");
      const refPath = path.join(
        process.cwd(),
        ".sprites",
        "refs",
        "members",
        `${memberId}.jpg`
      );
      if (!fs.existsSync(refPath)) {
        // Fall back to pixen with text prompt
        const res = await client.createImagePixen({
          description,
          image_size: { width: w, height: h },
          outline: "single color black outline",
          detail: "highly detailed",
          direction: "south",
          no_background: true,
          seed,
        });
        rawBuffer = pixelLabImageToBuffer(res.image);
        costUsd = res.usage?.usd ?? undefined;
      } else {
        const photoBuffer = fs.readFileSync(refPath);
        const job = await client.imageToPixelartPro({
          image: bufferToPixelLabImage(photoBuffer),
          description,
          seed,
        });
        jobId = job.background_job_id;
        const result = await client.waitForJob(jobId);
        const imgData = result.image as PixelLabImage | undefined;
        if (!imgData?.base64) {
          throw new Error(`imageToPixelartPro job ${jobId} returned no image`);
        }
        rawBuffer = pixelLabImageToBuffer(imgData);
      }
      break;
    }

    default:
      throw new Error(`Unknown model "${(asset as LabAsset).model}" for asset "${asset.id}"`);
  }

  // Post-process
  const { processedBuffer } = await processSprite(rawBuffer, asset, client);

  // QA
  const qaIssues = await qaCheck(processedBuffer, asset);

  // Save
  const versionMeta: Omit<VersionMeta, "versionId"> = {
    model: asset.model,
    seed,
    prompt: description,
    jobId,
    costUsd,
    qaIssues,
    createdAt: new Date().toISOString(),
  };
  const versionId = saveVersion(asset.id, rawBuffer, processedBuffer, versionMeta);

  return { versionId, qaIssues, costUsd };
}

/**
 * Generate `n` variants of `asset` sequentially (different seeds).
 */
export async function generateN(
  asset: LabAsset,
  client: PixelLabClient,
  n: number,
  opts: Omit<GenerateOptions, "n"> = {}
): Promise<GenerateResult[]> {
  const results: GenerateResult[] = [];
  for (let i = 0; i < n; i++) {
    const seed = opts.seed != null ? opts.seed + i : Math.floor(Math.random() * 1_000_000);
    const result = await generateOne(asset, client, { seed });
    results.push(result);
  }
  return results;
}
