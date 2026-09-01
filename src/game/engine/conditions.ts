import type { Condition } from "../schema/conditions";
import type { GameState } from "../schema/state";

export function evaluateCondition(cond: Condition, state: GameState): boolean {
  switch (cond.type) {
    case "all":
      return cond.conditions.every((c) => evaluateCondition(c, state));

    case "any":
      return cond.conditions.some((c) => evaluateCondition(c, state));

    case "not":
      return !evaluateCondition(cond.condition, state);

    case "flag": {
      const val = state.flags[cond.key];
      if (cond.value === undefined) return val !== undefined && val !== false;
      return val === cond.value;
    }

    case "stat": {
      const val = state.stats[cond.id] ?? 0;
      if (cond.min !== undefined && val < cond.min) return false;
      if (cond.max !== undefined && val > cond.max) return false;
      return true;
    }

    case "affinity": {
      const val = state.affinities[cond.memberId] ?? 0;
      if (cond.min !== undefined && val < cond.min) return false;
      if (cond.max !== undefined && val > cond.max) return false;
      return true;
    }

    case "stage":
      return state.stageIndex.toString() === cond.stageId;

    case "seenEvent":
      return state.seenEventIds.includes(cond.eventId);
  }
}
