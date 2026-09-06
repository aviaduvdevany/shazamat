/**
 * Version store — manages the .sprites/ workdir.
 *
 * Layout:
 *   .sprites/
 *     index.json                     — per-asset status registry
 *     palette.png                    — generated color swatch
 *     assets/{id}/versions/{ver}/
 *       raw.png                      — straight from PixelLab
 *       processed.png                — after cleanup pipeline
 *       meta.json                    — model, seed, prompt, job id, cost
 *     refs/members/{id}.jpg          — optional photo references
 */

import fs from "fs";
import path from "path";

const SPRITES_DIR = path.join(process.cwd(), ".sprites");
const INDEX_PATH = path.join(SPRITES_DIR, "index.json");

// ── Types ─────────────────────────────────────────────────────────────────────

export type AssetLabStatus =
  | "missing"     // not in index yet / no versions generated
  | "drafted"     // at least one version exists, none approved
  | "approved"    // a version has been approved (ready to promote)
  | "live";       // promoted to public/game/ at least once

export interface VersionMeta {
  versionId: string;
  model: string;
  seed?: number;
  prompt: string;
  jobId?: string;
  /** USD cost as reported by PixelLab usage field */
  costUsd?: number;
  qaIssues: string[];
  createdAt: string;
}

export interface AssetRecord {
  id: string;
  status: AssetLabStatus;
  approvedVersionId?: string;
  promotedAt?: string;
  versions: VersionMeta[];
}

export type LabIndex = Record<string, AssetRecord>;

// ── Index I/O ─────────────────────────────────────────────────────────────────

export function readIndex(): LabIndex {
  if (!fs.existsSync(INDEX_PATH)) return {};
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as LabIndex;
}

function writeIndex(index: LabIndex): void {
  fs.mkdirSync(SPRITES_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

export function getRecord(id: string): AssetRecord | undefined {
  return readIndex()[id];
}

// ── Paths ─────────────────────────────────────────────────────────────────────

export function versionDir(id: string, versionId: string): string {
  return path.join(SPRITES_DIR, "assets", id, "versions", versionId);
}

export function rawPngPath(id: string, versionId: string): string {
  return path.join(versionDir(id, versionId), "raw.png");
}

export function processedPngPath(id: string, versionId: string): string {
  return path.join(versionDir(id, versionId), "processed.png");
}

export function metaPath(id: string, versionId: string): string {
  return path.join(versionDir(id, versionId), "meta.json");
}

export function memberRefPath(memberId: string): string {
  return path.join(SPRITES_DIR, "refs", "members", `${memberId}.jpg`);
}

// ── Version management ────────────────────────────────────────────────────────

/** Generate a short human-readable version id like "v3-seed42" */
export function makeVersionId(seed?: number): string {
  const ts = Date.now().toString(36).slice(-5);
  const seedPart = seed != null ? `-s${seed}` : "";
  return `${ts}${seedPart}`;
}

/**
 * Save a raw + processed PNG pair for a new version.
 * Returns the version id.
 */
export function saveVersion(
  id: string,
  raw: Buffer,
  processed: Buffer,
  meta: Omit<VersionMeta, "versionId">
): string {
  const versionId = makeVersionId(meta.seed);
  const dir = versionDir(id, versionId);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(rawPngPath(id, versionId), raw);
  fs.writeFileSync(processedPngPath(id, versionId), processed);
  fs.writeFileSync(
    metaPath(id, versionId),
    JSON.stringify({ versionId, ...meta }, null, 2)
  );

  // Update index
  const index = readIndex();
  const existing = index[id];
  const fullMeta: VersionMeta = { versionId, ...meta };

  if (existing) {
    existing.versions.push(fullMeta);
    if (existing.status === "missing") existing.status = "drafted";
    else if (existing.status !== "approved" && existing.status !== "live") {
      existing.status = "drafted";
    }
  } else {
    index[id] = {
      id,
      status: "drafted",
      versions: [fullMeta],
    };
  }

  writeIndex(index);
  return versionId;
}

/**
 * Mark a version as the approved candidate for this asset.
 */
export function approveVersion(id: string, versionId: string): void {
  const index = readIndex();
  const record = index[id];
  if (!record) throw new Error(`Asset "${id}" not found in lab index`);
  const version = record.versions.find((v) => v.versionId === versionId);
  if (!version) {
    throw new Error(`Version "${versionId}" not found for asset "${id}"`);
  }
  record.approvedVersionId = versionId;
  record.status = "approved";
  writeIndex(index);
}

/**
 * Mark asset as promoted (live in public/game/).
 */
export function markPromoted(id: string): void {
  const index = readIndex();
  if (!index[id]) throw new Error(`Asset "${id}" not in lab index`);
  index[id].status = "live";
  index[id].promotedAt = new Date().toISOString();
  writeIndex(index);
}

/**
 * Return the processed PNG buffer of the approved version, or throw.
 */
export function getApprovedBuffer(id: string): Buffer {
  const index = readIndex();
  const record = index[id];
  if (!record?.approvedVersionId) {
    throw new Error(`No approved version for "${id}". Run: npm run sprites:approve -- --id ${id} --version <ver>`);
  }
  const p = processedPngPath(id, record.approvedVersionId);
  if (!fs.existsSync(p)) {
    throw new Error(`Approved processed PNG not found on disk: ${p}`);
  }
  return fs.readFileSync(p);
}

/**
 * Style / edit input: approved version if one exists, otherwise the latest draft.
 * Batch generate uses this so wave 2 can run off a just-generated parent.
 */
export function getReferenceBuffer(id: string): Buffer {
  const index = readIndex();
  const record = index[id];
  const versionId = record?.approvedVersionId ?? record?.versions.at(-1)?.versionId;
  if (!versionId) {
    throw new Error(
      `No generated version for "${id}". Generate it first: npm run sprites:generate -- --id ${id}`
    );
  }
  const p = processedPngPath(id, versionId);
  if (!fs.existsSync(p)) {
    throw new Error(`Reference processed PNG not found on disk: ${p}`);
  }
  return fs.readFileSync(p);
}

/** List all versions for an asset with their meta */
export function listVersions(id: string): VersionMeta[] {
  const index = readIndex();
  return index[id]?.versions ?? [];
}

/** Build the full status table for the status CLI command */
export function buildStatusTable(inventoryIds: string[]): Array<{
  id: string;
  status: AssetLabStatus;
  versions: number;
  approved?: string;
  qaIssues?: string[];
}> {
  const index = readIndex();
  return inventoryIds.map((id) => {
    const record = index[id];
    if (!record) return { id, status: "missing" as const, versions: 0 };
    const approvedMeta = record.approvedVersionId
      ? record.versions.find((v) => v.versionId === record.approvedVersionId)
      : undefined;
    return {
      id,
      status: record.status,
      versions: record.versions.length,
      approved: record.approvedVersionId,
      qaIssues: approvedMeta?.qaIssues,
    };
  });
}
