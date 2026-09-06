"use server";

import { isAuthenticated } from "@/lib/auth";
import { INVENTORY, getAsset } from "@/game/sprites/lab/inventory";
import { PixelLabClient } from "@/game/sprites/lab/client";
import { generateN } from "@/game/sprites/lab/generate";
import {
  approveVersion,
  buildStatusTable,
  listVersions,
  readIndex,
  type VersionMeta,
  type AssetRecord,
} from "@/game/sprites/lab/store";
import { promoteAsset } from "@/game/sprites/lab/promote";
import type { LabAsset, AssetBatch, AssetFamily } from "@/game/sprites/lab/inventory";
import type { AssetLabStatus } from "@/game/sprites/lab/store";

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) throw new Error("Unauthorized");
}

// ── Balance ───────────────────────────────────────────────────────────────────

export interface BalanceData {
  creditsUsd: number;
  subscriptionStatus: string;
  subscriptionPlan?: string | null;
  subscriptionsRemaining: number;
  subscriptionsTotal: number;
}

export async function getBalanceAction(): Promise<BalanceData> {
  await requireAuth();
  const client = PixelLabClient.fromEnv();
  const balance = await client.getBalance();
  return {
    creditsUsd: balance.credits.usd,
    subscriptionStatus: balance.subscription.status,
    subscriptionPlan: balance.subscription.plan,
    subscriptionsRemaining: balance.subscription.generations,
    subscriptionsTotal: balance.subscription.total,
  };
}

// ── Inventory status ──────────────────────────────────────────────────────────

export interface AssetStatusRow {
  id: string;
  family: AssetFamily;
  batch: AssetBatch;
  diskStatus: "REPLACE" | "NEW";
  canvas: [number, number];
  model: string;
  styleRef?: string;
  status: AssetLabStatus;
  versions: number;
  approvedVersionId?: string;
  promptSeed: string;
}

export async function getInventoryAction(): Promise<AssetStatusRow[]> {
  await requireAuth();
  const index = readIndex();

  return INVENTORY.map((asset) => {
    const record = index[asset.id];
    return {
      id: asset.id,
      family: asset.family,
      batch: asset.batch,
      diskStatus: asset.diskStatus,
      canvas: asset.canvas,
      model: asset.model,
      styleRef: asset.styleRef,
      status: record?.status ?? "missing",
      versions: record?.versions.length ?? 0,
      approvedVersionId: record?.approvedVersionId,
      promptSeed: asset.promptSeed,
    };
  });
}

// ── Version list for a single asset ──────────────────────────────────────────

export interface VersionData extends VersionMeta {
  processedPngUrl: string;
  rawPngUrl: string;
}

export async function getVersionsAction(id: string): Promise<VersionData[]> {
  await requireAuth();
  const versions = listVersions(id);
  return versions.map((v) => ({
    ...v,
    processedPngUrl: `/api/sprites/image?id=${encodeURIComponent(id)}&ver=${encodeURIComponent(v.versionId)}&type=processed`,
    rawPngUrl: `/api/sprites/image?id=${encodeURIComponent(id)}&ver=${encodeURIComponent(v.versionId)}&type=raw`,
  }));
}

// ── Generate ──────────────────────────────────────────────────────────────────

export interface GenerateResult {
  ok: boolean;
  versionId?: string;
  qaIssues?: string[];
  costUsd?: number;
  error?: string;
}

export async function generateAction(
  id: string,
  n: number = 1,
  seed?: number
): Promise<GenerateResult[]> {
  await requireAuth();
  const asset = getAsset(id);
  if (!asset) return [{ ok: false, error: `Unknown asset id: ${id}` }];

  try {
    const client = PixelLabClient.fromEnv();
    const results = await generateN(asset, client, n, { seed });
    return results.map((r) => ({
      ok: true,
      versionId: r.versionId,
      qaIssues: r.qaIssues,
      costUsd: r.costUsd,
    }));
  } catch (err) {
    return [{ ok: false, error: err instanceof Error ? err.message : String(err) }];
  }
}

// ── Approve ───────────────────────────────────────────────────────────────────

export async function approveAction(
  id: string,
  versionId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAuth();
  try {
    approveVersion(id, versionId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── Promote ───────────────────────────────────────────────────────────────────

export interface PromoteResult {
  ok: boolean;
  action?: string;
  catalogUpdated?: boolean;
  error?: string;
}

export async function promoteAction(id: string): Promise<PromoteResult> {
  await requireAuth();
  const asset = getAsset(id);
  if (!asset) return { ok: false, error: `Unknown asset id: ${id}` };

  try {
    const result = await promoteAsset(asset);
    return { ok: true, action: result.action, catalogUpdated: result.catalogUpdated };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
