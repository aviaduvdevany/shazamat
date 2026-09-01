"use client";

import type { GameState } from "../schema/state";
import type { ContentPack } from "../schema/pack";

interface Props {
  state: GameState;
  pack: ContentPack;
}

export function Hud({ state, pack }: Props) {
  const stage = pack.stages[state.stageIndex];
  const ageLabel = stage?.ageLabel ?? stage?.label ?? "";

  return (
    <>
      <div className="game-hud" role="status" aria-label="סטטוס שחקן">
        <div className="game-hud-age">{ageLabel}</div>
        <div className="game-hud-stats">
          {pack.stats.map((def) => {
            const val = state.stats[def.id] ?? def.initial;
            const pct = Math.round(((val - def.min) / (def.max - def.min)) * 100);
            return (
              <div key={def.id} className="game-hud-stat" title={`${def.label}: ${val}`}>
                <span>{def.emoji}</span>
                <div className="game-hud-stat-bar" aria-hidden>
                  <div className="game-hud-stat-fill" style={{ width: `${pct}%` }} />
                </div>
                <span>{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="game-stage-label" aria-hidden>
        {stage?.label ?? ""}
      </div>
    </>
  );
}
