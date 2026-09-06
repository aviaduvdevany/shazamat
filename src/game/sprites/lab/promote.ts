/**
 * Promote an approved sprite version into public/game/ and update the sprite catalog.
 *
 * For REPLACE assets: overwrite the existing placeholder PNG.
 * For NEW assets: copy the PNG and append a row to src/game/content/sprites.ts.
 *
 * After promoting any asset, callers should run `npm run game:validate` to confirm
 * the file reference passes the content integrity check.
 */

import fs from "fs";
import path from "path";
import type { LabAsset } from "./inventory";
import {
  getApprovedBuffer,
  markPromoted,
  type AssetLabStatus,
} from "./store";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const SPRITES_TS = path.join(
  process.cwd(),
  "src/game/content/sprites.ts"
);

// ── Main promote function ──────────────────────────────────────────────────────

export interface PromoteResult {
  id: string;
  destPath: string;
  action: "overwritten" | "created";
  catalogUpdated: boolean;
}

export async function promoteAsset(
  asset: LabAsset,
  options: { dryRun?: boolean } = {}
): Promise<PromoteResult> {
  const buf = getApprovedBuffer(asset.id);
  const dest = path.join(PUBLIC_DIR, asset.destPath);

  const action = fs.existsSync(dest) ? "overwritten" : "created";

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
  }

  // For NEW sprite parts or NEW scenes not yet in the catalog, append a row
  let catalogUpdated = false;
  if (asset.diskStatus === "NEW" && !options.dryRun) {
    if (asset.family === "portrait") {
      catalogUpdated = addPortraitToCatalog(asset);
    } else if (asset.family === "scene") {
      catalogUpdated = addSceneToCatalog(asset);
    } else if (asset.family === "look") {
      catalogUpdated = addLookToCatalog(asset);
    }
  }

  if (!options.dryRun) {
    markPromoted(asset.id);
  }

  return {
    id: asset.id,
    destPath: asset.destPath,
    action,
    catalogUpdated,
  };
}

// ── Catalog updaters ──────────────────────────────────────────────────────────

function addLookToCatalog(asset: LabAsset): boolean {
  const src = fs.readFileSync(SPRITES_TS, "utf-8");
  if (src.includes(`"${asset.id}"`)) return false;

  const label = hebrewLabel(asset.id);
  const newRow = `    { id: "${asset.id}", file: "${asset.destPath}", label: "${label}" },`;

  const updated = src.replace(
    /(\s*\{ id: "look-shazamat"[\s\S]*?\},\n)(\s*\],\s*\n\s*scenes:)/,
    (_, before, after) => `${before}${newRow}\n${after}`
  );

  if (updated === src) {
    const patched = src.replace(
      /(\s*looks: \[[\s\S]*?)(\s*\],\n\n\s*scenes:)/,
      (_, before, after) => `${before}\n${newRow}${after}`
    );
    if (patched !== src) {
      fs.writeFileSync(SPRITES_TS, patched);
      return true;
    }
    return false;
  }

  fs.writeFileSync(SPRITES_TS, updated);
  return true;
}

function addSceneToCatalog(asset: LabAsset): boolean {
  const src = fs.readFileSync(SPRITES_TS, "utf-8");
  if (src.includes(`"${asset.id}"`)) return false;

  const label = hebrewLabel(asset.id);
  const newRow = `    { id: "${asset.id}", file: "${asset.destPath}", label: "${label}" },`;

  // Insert before scenes array closing ]
  const updated = src.replace(
    /(\s*\{ id: "school-classroom"[\s\S]*?\},\n)(\s*\],\n\n\s*memberPortraits)/,
    (_, before, after) => `${before}${newRow}\n${after}`
  );

  if (updated === src) return false;
  fs.writeFileSync(SPRITES_TS, updated);
  return true;
}

function addPortraitToCatalog(_asset: LabAsset): boolean {
  // Portraits use Object.fromEntries(MEMBER_IDS.map(...)) — path is derived.
  // No catalog update needed; just confirm the file is at public/game/members/{id}-portrait.png.
  return false;
}

/** Very rough Hebrew-ish label for the admin UI */
function hebrewLabel(id: string): string {
  const map: Record<string, string> = {
    "look-child": "ילד",
    "look-teen": "נוער",
    "look-teen-band": "נוער — להקה",
    "look-adult": "מבוגר",
    "look-soldier-nahal": "חייל נח״ל",
    "look-soldier-golani": "חייל גולני",
    "look-trip": "טיול",
    "look-wolt": "שליח",
    "look-hitech": "הייטק",
    "look-career": "מוזיקאי",
    "look-shazamat": "שאזאמאט",
  };
  return map[id] ?? id;
}

/** Promote all approved assets whose status = 'approved' */
export async function promoteAllApproved(
  allAssets: LabAsset[],
  options: { dryRun?: boolean } = {}
): Promise<PromoteResult[]> {
  const { readIndex } = await import("./store");
  const index = readIndex();
  const results: PromoteResult[] = [];

  for (const asset of allAssets) {
    const record = index[asset.id];
    if (record?.status === "approved" && record.approvedVersionId) {
      const result = await promoteAsset(asset, options);
      results.push(result);
    }
  }

  return results;
}
