"use client";

import type { Stage } from "../schema/stages";
import type { LogEntry } from "../schema/state";
import { buildLifeRecap } from "./lifeRecap";

interface Props {
  log: LogEntry[];
  stages: Stage[];
  /** When true, stagger animation is applied (ending screen). */
  animated?: boolean;
}

/**
 * UX-7: Recap as a readable life — stage-dot strip + one line per stage.
 *
 * Used by EndingScreen (animated stagger) and ShareLanding (static, inside
 * collapsed <details>).
 */
export function LifeRecap({ log, stages, animated = false }: Props) {
  const lines = buildLifeRecap(log, stages);
  const playedStageIds = new Set(lines.map((l) => l.stageId));

  return (
    <div className="game-life-recap">
      {/* Stage dot strip — one dot per stage, filled when played */}
      <div className="game-life-recap-dots" aria-hidden="true">
        {stages.map((stage) => (
          <span
            key={stage.id}
            className={[
              "game-life-recap-dot",
              playedStageIds.has(stage.id) ? "is-played" : "",
            ].filter(Boolean).join(" ")}
            title={stage.label}
          />
        ))}
      </div>

      {/* One line per played stage */}
      <div className="game-life-recap-lines">
        {lines.map((line, i) => (
          <div
            key={line.stageId}
            className={[
              "game-life-recap-entry",
              animated ? "is-animated" : "",
            ].filter(Boolean).join(" ")}
            style={animated ? ({ "--recap-i": i } as React.CSSProperties) : undefined}
          >
            <span className="game-life-recap-stage">{line.stageLabel}</span>
            <span className="game-life-recap-text">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
