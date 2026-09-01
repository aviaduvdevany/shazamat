import type { Effect } from "../schema/effects";
import type { GameState } from "../schema/state";
import type { ContentPack } from "../schema/pack";

interface ApplyResult {
  state: GameState;
  statDeltas: Array<{ id: string; delta: number }>;
  pendingGoto: string | null;
  didAdvanceStage: boolean;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function applyEffects(
  effects: Effect[],
  state: GameState,
  pack: ContentPack
): ApplyResult {
  let s = { ...state };
  s.stats = { ...s.stats };
  s.affinities = { ...s.affinities };
  s.flags = { ...s.flags };
  s.sprite = {
    ...s.sprite,
    accessories: [...(s.sprite.accessories ?? [])],
  };

  const statDeltas: Array<{ id: string; delta: number }> = [];
  let pendingGoto: string | null = null;
  let didAdvanceStage = false;

  for (const effect of effects) {
    switch (effect.type) {
      case "stat": {
        const def = pack.stats.find((s) => s.id === effect.id);
        const current = s.stats[effect.id] ?? def?.initial ?? 0;
        const next = clamp(current + effect.delta, def?.min ?? 0, def?.max ?? 100);
        s.stats[effect.id] = next;
        if (effect.delta !== 0) statDeltas.push({ id: effect.id, delta: effect.delta });
        break;
      }

      case "affinity": {
        const current = s.affinities[effect.memberId] ?? 0;
        s.affinities[effect.memberId] = Math.max(0, current + effect.delta);
        break;
      }

      case "setFlag":
        s.flags[effect.key] = effect.value;
        break;

      case "spriteSet":
        s.sprite = { ...s.sprite, [effect.layer]: effect.partId };
        break;

      case "spriteAddAccessory":
        if (!s.sprite.accessories?.includes(effect.partId)) {
          s.sprite = {
            ...s.sprite,
            accessories: [...(s.sprite.accessories ?? []), effect.partId],
          };
        }
        break;

      case "spriteRemoveAccessory":
        s.sprite = {
          ...s.sprite,
          accessories: s.sprite.accessories?.filter((a) => a !== effect.partId) ?? [],
        };
        break;

      case "advanceStage":
        didAdvanceStage = true;
        break;

      case "gotoEvent":
        pendingGoto = effect.eventId;
        break;
    }
  }

  return { state: s, statDeltas, pendingGoto, didAdvanceStage };
}
