#!/usr/bin/env npx tsx
/**
 * Sprite lab CLI — run with `npm run sprites:<command>`
 *
 * Commands:
 *   balance                   — show PixelLab account balance
 *   status [--batch A|B|C]    — show per-asset status table
 *   generate --id <id> [--n <num>] [--seed <seed>]
 *            --batch <A|B|C> [--family <family>]
 *   approve --id <id> --version <ver>
 *   promote --id <id>
 *           --approved        — promote all approved assets
 *           --dry-run         — preview without writing
 *
 * Examples:
 *   npm run sprites:balance
 *   npm run sprites:status
 *   npm run sprites:generate -- --id body-adult --n 4
 *   npm run sprites:generate -- --batch A --family body
 *   npm run sprites:approve  -- --id body-adult --version <ver>
 *   npm run sprites:promote  -- --id body-adult
 *   npm run sprites:promote  -- --approved
 */

import "dotenv/config";
import { parseArgs } from "util";
import { INVENTORY, getBatch, getAsset, type AssetBatch, type AssetFamily } from "../src/game/sprites/lab/inventory";
import { PixelLabClient } from "../src/game/sprites/lab/client";
import { generateN } from "../src/game/sprites/lab/generate";
import { approveVersion, buildStatusTable, getApprovedBuffer } from "../src/game/sprites/lab/store";
import { promoteAsset, promoteAllApproved } from "../src/game/sprites/lab/promote";

// ── Parse CLI arguments ───────────────────────────────────────────────────────

const { positionals, values } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    id: { type: "string" },
    batch: { type: "string" },
    family: { type: "string" },
    version: { type: "string" },
    n: { type: "string" },
    seed: { type: "string" },
    approved: { type: "boolean" },
    "dry-run": { type: "boolean" },
  },
});

const command = positionals[0];

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkToken(): PixelLabClient {
  return PixelLabClient.fromEnv();
}

function die(msg: string): never {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(1);
}

function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function info(msg: string) {
  console.log(`  → ${msg}`);
}

// Concurrency cap: process at most N assets in parallel (avoid hammering the API)
const CONCURRENCY = 3;

async function withConcurrency<T>(
  items: T[],
  fn: (item: T, idx: number) => Promise<void>
): Promise<void> {
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function cmdBalance() {
  const client = checkToken();
  const balance = await client.getBalance();
  console.log("\nPixelLab Account Balance");
  console.log("─────────────────────────");
  console.log(`  Credits:       $${balance.credits.usd.toFixed(4)}`);
  console.log(`  Subscription:  ${balance.subscription.status} — ${balance.subscription.plan ?? "none"}`);
  console.log(`  Generations:   ${balance.subscription.generations} / ${balance.subscription.total}`);
  console.log();
}

async function cmdStatus() {
  const batchFilter = values["batch"] as AssetBatch | undefined;
  const assets = batchFilter
    ? INVENTORY.filter((a) => a.batch === batchFilter)
    : INVENTORY;

  const rows = buildStatusTable(assets.map((a) => a.id));

  // Group by batch
  const byBatch: Record<string, typeof rows> = {};
  for (const row of rows) {
    const asset = getAsset(row.id)!;
    const b = asset.batch;
    if (!byBatch[b]) byBatch[b] = [];
    byBatch[b].push(row);
  }

  const STATUS_ICON: Record<string, string> = {
    missing: "○",
    drafted: "◑",
    approved: "◉",
    live: "●",
  };

  for (const [batch, batchRows] of Object.entries(byBatch).sort()) {
    console.log(`\nBatch ${batch}`);
    console.log("─".repeat(70));
    const byFamily: Record<string, typeof rows> = {};
    for (const row of batchRows) {
      const asset = getAsset(row.id)!;
      if (!byFamily[asset.family]) byFamily[asset.family] = [];
      byFamily[asset.family].push(row);
    }

    for (const [family, famRows] of Object.entries(byFamily).sort()) {
      console.log(`  ${family}:`);
      for (const row of famRows) {
        const icon = STATUS_ICON[row.status] ?? "?";
        const qa = row.qaIssues?.length ? ` ⚠ ${row.qaIssues[0]}` : "";
        const ver = row.approved ? ` [${row.approved}]` : "";
        console.log(
          `    ${icon} ${row.id.padEnd(32)} ${row.status.padEnd(10)} v=${row.versions}${ver}${qa}`
        );
      }
    }
  }

  const summary = rows.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );
  console.log("\nSummary:", JSON.stringify(summary), "\n");
}

async function cmdGenerate() {
  const client = checkToken();

  let targets = [] as typeof INVENTORY;

  if (values["id"]) {
    const asset = getAsset(values["id"]!);
    if (!asset) die(`Unknown asset id: "${values["id"]}"`);
    targets = [asset];
  } else if (values["batch"]) {
    targets = getBatch(
      values["batch"] as AssetBatch,
      values["family"] as AssetFamily | undefined
    );
    if (targets.length === 0) die(`No assets in batch "${values["batch"]}"${values["family"] ? ` family "${values["family"]}"` : ""}`);
  } else {
    die("Provide --id <id> or --batch <A|B|C> [--family <family>]");
  }

  const n = Math.max(1, parseInt(values["n"] ?? "4", 10));
  const seed = values["seed"] != null ? parseInt(values["seed"]!, 10) : undefined;

  console.log(`\nGenerating ${n} variant(s) for ${targets.length} asset(s)...\n`);

  const errors: string[] = [];

  await withConcurrency(targets, async (asset) => {
    try {
      info(`Generating ${asset.id} (model: ${asset.model}, n=${n})...`);
      const results = await generateN(asset, client, n, { seed });
      for (const r of results) {
        const qaStr = r.qaIssues.length ? ` ⚠ ${r.qaIssues.join("; ")}` : "";
        const cost = r.costUsd != null ? ` $${r.costUsd.toFixed(4)}` : "";
        ok(`${asset.id} → ${r.versionId}${cost}${qaStr}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${asset.id}: ${msg}`);
      errors.push(`${asset.id}: ${msg}`);
    }
  });

  if (errors.length) {
    console.log(`\n${errors.length} error(s):`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log("\nDone. Review versions in the studio: /admin/game/sprites\n");
}

async function cmdApprove() {
  const id = values["id"];
  const version = values["version"];
  if (!id) die("--id is required");
  if (!version) die("--version is required");

  approveVersion(id, version);
  ok(`Approved version "${version}" for "${id}"`);
  console.log(`\nNext: npm run sprites:promote -- --id ${id}\n`);
}

async function cmdPromote() {
  const dryRun = values["dry-run"] ?? false;
  const doApproved = values["approved"] ?? false;
  const id = values["id"];

  if (!id && !doApproved) die("Provide --id <id> or --approved");

  let targets: typeof INVENTORY = [];

  if (id) {
    const asset = getAsset(id);
    if (!asset) die(`Unknown asset id: "${id}"`);
    targets = [asset];
  } else {
    targets = INVENTORY;
  }

  if (dryRun) console.log("\n[DRY RUN] No files will be written.\n");

  const results = doApproved
    ? await promoteAllApproved(targets, { dryRun })
    : await Promise.all(targets.map((a) => promoteAsset(a, { dryRun })));

  if (results.length === 0) {
    console.log("Nothing to promote.");
  } else {
    for (const r of results) {
      ok(`${r.id} → ${r.destPath} (${r.action}${r.catalogUpdated ? ", catalog updated" : ""})`);
    }
  }

  if (!dryRun) {
    console.log("\nRun npm run game:validate to confirm.\n");
  }
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("Sprite Lab CLI");

  switch (command) {
    case "balance":
      await cmdBalance();
      break;
    case "status":
      await cmdStatus();
      break;
    case "generate":
      await cmdGenerate();
      break;
    case "approve":
      await cmdApprove();
      break;
    case "promote":
      await cmdPromote();
      break;
    default:
      console.log(`
Usage:
  npm run sprites:balance
  npm run sprites:status [-- --batch A|B|C]
  npm run sprites:generate -- --id <id> [--n 4] [--seed 42]
  npm run sprites:generate -- --batch A [--family body]
  npm run sprites:approve  -- --id <id> --version <ver>
  npm run sprites:promote  -- --id <id>
  npm run sprites:promote  -- --approved [--dry-run]

Legend: ○ missing  ◑ drafted  ◉ approved  ● live
`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
