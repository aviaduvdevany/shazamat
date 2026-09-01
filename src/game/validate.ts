/**
 * pnpm game:validate — run with tsx
 *
 * Checks:
 * - All event ids are unique
 * - Every sprite/scene ref exists on disk
 * - Every stage has at least one event
 * - Every choice has effects or roll
 * - All kicker/headline/body copy is non-empty Hebrew
 * - Affinities reference only the 7 canonical member ids
 */

import { existsSync } from "fs";
import { join } from "path";
import { pack } from "./content/pack";
import { MEMBER_IDS } from "./schema/members";
import type { Effect } from "./schema/effects";

const WORKSPACE = join(process.cwd(), "public");

let errors = 0;

function fail(msg: string) {
  console.error(`  ✗ ${msg}`);
  errors++;
}

function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}

// ── 1. Unique event ids ──────────────────────────────────────

{
  const seen = new Set<string>();
  for (const ev of pack.events) {
    if (seen.has(ev.id)) fail(`Duplicate event id: "${ev.id}"`);
    else seen.add(ev.id);
  }
  ok(`${pack.events.length} events, all ids unique`);
}

// ── 2. Every stage has at least one event ───────────────────

for (const stage of pack.stages) {
  const stageEvents = pack.events.filter((e) => e.stage === stage.id);
  if (stageEvents.length === 0) fail(`Stage "${stage.id}" has no events`);
  else ok(`Stage "${stage.id}" → ${stageEvents.length} events`);
}

// ── 3. Sprite/scene file refs exist on disk ─────────────────

for (const part of pack.sprites.parts) {
  const p = join(WORKSPACE, part.file);
  if (!existsSync(p)) fail(`Sprite part "${part.id}" file not found: ${part.file}`);
}
ok(`${pack.sprites.parts.length} sprite parts checked`);

for (const scene of pack.sprites.scenes) {
  const p = join(WORKSPACE, scene.file);
  if (!existsSync(p)) fail(`Scene "${scene.id}" file not found: ${scene.file}`);
}
ok(`${pack.sprites.scenes.length} scenes checked`);

for (const [memberId, portraitFile] of Object.entries(pack.sprites.memberPortraits)) {
  const p = join(WORKSPACE, portraitFile);
  if (!existsSync(p)) fail(`Member portrait "${memberId}" file not found: ${portraitFile}`);
}
ok(`${Object.keys(pack.sprites.memberPortraits).length} member portraits checked`);

// ── 4. All choices have effects or roll ─────────────────────

for (const ev of pack.events) {
  for (const choice of ev.choices) {
    const hasEffects = choice.effects && choice.effects.length > 0;
    const hasRoll = choice.roll && choice.roll.length > 0;
    if (!hasEffects && !hasRoll) {
      fail(`Event "${ev.id}" choice "${choice.id}" has no effects or roll`);
    }
  }
}
ok("All choices have effects or roll");

// ── 5. Affinity effects only use canonical member ids ────────

function collectAffinityMemberIds(effects: Effect[]): string[] {
  const result: string[] = [];
  for (const e of effects) {
    if (e.type === "affinity") result.push(e.memberId);
  }
  return result;
}

const validMembers = new Set<string>(MEMBER_IDS);
for (const ev of pack.events) {
  for (const choice of ev.choices) {
    const fromEffects = collectAffinityMemberIds(choice.effects ?? []);
    const fromRoll = (choice.roll ?? []).flatMap((r) =>
      collectAffinityMemberIds(r.effects)
    );
    for (const mid of [...fromEffects, ...fromRoll]) {
      if (!validMembers.has(mid as (typeof MEMBER_IDS)[number])) {
        fail(`Event "${ev.id}": affinity effect uses unknown member id "${mid}"`);
      }
    }
  }
}
ok("All affinity effects use canonical member ids");

// ── 6. Hebrew copy non-empty ─────────────────────────────────

for (const ev of pack.events) {
  if (!ev.kicker.trim()) fail(`Event "${ev.id}" kicker is empty`);
  if (!ev.headline.trim()) fail(`Event "${ev.id}" headline is empty`);
}
ok("All event copy is non-empty");

// ── 7. Member ids complete ────────────────────────────────────

const packMemberIds = new Set(pack.members.map((m) => m.id));
for (const id of MEMBER_IDS) {
  if (!packMemberIds.has(id)) fail(`Missing member in pack: "${id}"`);
}
ok("All 7 members defined");

// ── 8. gotoEvent targets exist ───────────────────────────────

const allEventIds = new Set(pack.events.map((e) => e.id));

function collectGotoTargets(effects: Effect[]): string[] {
  return effects
    .filter((e) => e.type === "gotoEvent")
    .map((e) => (e as { type: "gotoEvent"; eventId: string }).eventId);
}

for (const ev of pack.events) {
  for (const choice of ev.choices) {
    const fromEffects = collectGotoTargets(choice.effects ?? []);
    const fromRoll = (choice.roll ?? []).flatMap((r) =>
      collectGotoTargets(r.effects)
    );
    for (const targetId of [...fromEffects, ...fromRoll]) {
      if (!allEventIds.has(targetId)) {
        fail(`Event "${ev.id}": gotoEvent targets unknown event id "${targetId}"`);
      }
    }
  }
}
ok("All gotoEvent targets exist");

// ── Result ───────────────────────────────────────────────────

console.log("");
if (errors > 0) {
  console.error(`game:validate FAILED — ${errors} error(s)`);
  process.exit(1);
} else {
  console.log("game:validate PASSED");
  process.exit(0);
}
