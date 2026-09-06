import type { ContentPack } from "../schema/pack";
import type { GameState } from "../schema/state";
import type { GameEvent, RollOutcome } from "../schema/events";
import type { MemberId } from "../schema/members";
import type { Rng } from "./rng";
import { createRng } from "./rng";
import { evaluateCondition } from "./conditions";
import { applyEffects } from "./effects";

// ────────────────────────────────────────────────────────────
// Run creation
// ────────────────────────────────────────────────────────────

export function createRun(
  params: { runId: string; seed: number; contentVersion: number },
  pack: ContentPack
): GameState {
  const stats: Record<string, number> = {};
  for (const s of pack.stats) stats[s.id] = s.initial;

  const affinities: Record<string, number> = {};
  for (const m of pack.members) affinities[m.id] = 0;

  const firstStage = pack.stages[0];
  let sprite = {
    body: undefined as string | undefined,
    pants: undefined as string | undefined,
    shirt: undefined as string | undefined,
    hair: undefined as string | undefined,
    accessories: [] as string[],
    instrument: undefined as string | undefined,
    expression: undefined as string | undefined,
  };

  // Apply onEnter effects for the first stage
  let state: GameState = {
    runId: params.runId,
    seed: params.seed,
    rngCursor: 0,
    contentVersion: params.contentVersion,
    stageIndex: 0,
    eventsPlayedInStage: 0,
    stats,
    affinities,
    flags: {},
    sprite,
    seenEventIds: [],
    log: [],
    pendingEventId: null,
    phase: "playing",
    endingMemberId: null,
    completedAt: null,
  };

  if (firstStage?.onEnter?.length) {
    const rng = createRng(params.seed, 0);
    const res = applyEffects(firstStage.onEnter, state, pack);
    state = res.state;
  }

  return state;
}

// ────────────────────────────────────────────────────────────
// Event selection
// ────────────────────────────────────────────────────────────

type SelectResult =
  | { type: "event"; event: GameEvent }
  | { type: "stage-clear" }
  | { type: "ending" };

export function selectNextEvent(
  state: GameState,
  pack: ContentPack,
  rng: Rng
): SelectResult {
  const currentStage = pack.stages[state.stageIndex];

  if (!currentStage) return { type: "ending" };

  // If a forced follow-up is queued
  if (state.pendingEventId) {
    const forced = pack.events.find((e) => e.id === state.pendingEventId);
    if (forced) return { type: "event", event: forced };
  }

  // Check if stage is done — last stage goes straight to ending
  if (state.eventsPlayedInStage >= currentStage.eventCount) {
    if (state.stageIndex >= pack.stages.length - 1) return { type: "ending" };
    return { type: "stage-clear" };
  }

  // Build candidate pool
  const stageId = currentStage.id;
  const candidates = pack.events.filter((e) => {
    if (e.stage !== stageId) return false;
    if (e.oncePerRun && state.seenEventIds.includes(e.id)) return false;
    if (e.requires && !evaluateCondition(e.requires, state)) return false;
    return true;
  });

  if (candidates.length === 0) {
    // No candidates → advance stage early; same last-stage rule applies
    if (state.stageIndex >= pack.stages.length - 1) return { type: "ending" };
    return { type: "stage-clear" };
  }

  // Rarity weighting
  const rarityWeight: Record<string, number> = {
    common: 1,
    rare: 0.15,
    ultra: 0.03,
  };

  const weighted = candidates.map((e) => ({
    weight: e.weight * (rarityWeight[e.rarity] ?? 1),
    value: e,
  }));

  const chosen = rng.weightedPick(weighted);
  return { type: "event", event: chosen };
}

// ────────────────────────────────────────────────────────────
// Applying a choice
// ────────────────────────────────────────────────────────────

export interface ChoiceOutcome {
  state: GameState;
  outcomeLabel: string;
  statDeltas: Array<{ id: string; delta: number }>;
}

export function applyChoice(
  state: GameState,
  event: GameEvent,
  choiceId: string,
  rng: Rng,
  pack: ContentPack
): ChoiceOutcome {
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`Choice "${choiceId}" not found in event "${event.id}"`);

  let effects;
  let outcomeLabel = choice.label;

  if (choice.roll && choice.roll.length > 0) {
    const weighted = choice.roll.map((r) => ({ weight: r.weight, value: r }));
    const outcome: RollOutcome = rng.weightedPick(weighted);
    effects = outcome.effects;
    outcomeLabel = outcome.label;
  } else {
    effects = choice.effects ?? [];
  }

  const res = applyEffects(effects, state, pack);
  let s = res.state;

  // Record seen event
  if (event.oncePerRun && !s.seenEventIds.includes(event.id)) {
    s = { ...s, seenEventIds: [...s.seenEventIds, event.id] };
  }

  // Increment rng cursor
  s = { ...s, rngCursor: s.rngCursor + 1 };

  // Log entry
  const logEntry = {
    stage: pack.stages[state.stageIndex]?.id ?? "",
    eventId: event.id,
    choiceLabel: choice.label,
    outcomeLabel: choice.roll ? outcomeLabel : undefined,
    statDeltas: res.statDeltas.length > 0 ? res.statDeltas : undefined,
  };
  s = { ...s, log: [...s.log, logEntry] };

  // Handle pending goto
  if (res.pendingGoto) {
    s = { ...s, pendingEventId: res.pendingGoto };
  } else {
    s = { ...s, pendingEventId: null };
  }

  // Handle stage advance
  if (res.didAdvanceStage) {
    s = advanceStage(s, pack);
  } else {
    s = { ...s, eventsPlayedInStage: s.eventsPlayedInStage + 1 };
  }

  return { state: s, outcomeLabel, statDeltas: res.statDeltas };
}

// ────────────────────────────────────────────────────────────
// Stage advance
// ────────────────────────────────────────────────────────────

export function advanceStage(state: GameState, pack: ContentPack): GameState {
  const nextIndex = state.stageIndex + 1;

  if (nextIndex >= pack.stages.length) {
    return { ...state, phase: "ending" };
  }

  const nextStage = pack.stages[nextIndex];
  let s: GameState = {
    ...state,
    stageIndex: nextIndex,
    eventsPlayedInStage: 0,
    phase: "playing",
  };

  if (nextStage.onEnter?.length) {
    const rng = createRng(s.seed, s.rngCursor);
    const res = applyEffects(nextStage.onEnter, s, pack);
    s = res.state;
    s.rngCursor += 1;
  }

  return s;
}

// ────────────────────────────────────────────────────────────
// Ending resolution
// ────────────────────────────────────────────────────────────

export function resolveEnding(state: GameState, pack: ContentPack): MemberId {
  const entries = Object.entries(state.affinities);
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    // Tiebreak by seed determinism
    const rng = createRng(state.seed, 9999);
    return rng.next() - 0.5;
  });

  const winnerId = entries[0]?.[0];
  const member = pack.members.find((m) => m.id === winnerId);
  if (!member) {
    // Fallback to first member
    return pack.members[0].id;
  }
  return member.id;
}

// ────────────────────────────────────────────────────────────
// Convenience: build a fresh RNG from state
// ────────────────────────────────────────────────────────────

export function stateRng(state: GameState): Rng {
  return createRng(state.seed, state.rngCursor);
}
