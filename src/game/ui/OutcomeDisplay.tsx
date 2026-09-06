"use client";

import type { ContentPack } from "../schema/pack";

interface Props {
  outcomeLabel: string;
  statDeltas: Array<{ id: string; delta: number }>;
  pack: ContentPack;
  onContinue: () => void;
}

export function OutcomeDisplay({ outcomeLabel, statDeltas, pack, onContinue }: Props) {
  return (
    <div
      className="game-outcome"
      style={{ "--deltas-count": statDeltas.length } as React.CSSProperties}
    >
      {outcomeLabel && (
        <div className="game-outcome-label">{outcomeLabel}</div>
      )}

      {statDeltas.length > 0 && (
        <div className="game-stat-deltas" role="status" aria-live="polite">
          {statDeltas.map(({ id, delta }, i) => {
            const def = pack.stats.find((s) => s.id === id);
            const sign = delta > 0 ? "+" : "";
            return (
              <div
                key={id}
                className={`game-stat-delta${delta < 0 ? " negative" : ""}`}
                style={{ "--delta-i": i } as React.CSSProperties}
              >
                {def?.emoji} {sign}{delta} {def?.label}
              </div>
            );
          })}
        </div>
      )}

      <button className="game-continue-btn" onClick={onContinue} autoFocus>
        המשך
      </button>
    </div>
  );
}
