"use client";

import { useEffect, useRef } from "react";
import type { GameState } from "../schema/state";
import type { ContentPack } from "../schema/pack";
import { GAME_DURATION } from "./usePrefersReducedMotion";

export interface StatDisplay {
  /** Incrementing this triggers a WAAPI scale-pulse on the stat container. */
  pulseNonce?: number;
  /** Old fill % to show as a ghost drain bar on losses. */
  ghostPct?: number;
  /** Increment to remount the ghost element and restart its fade animation. */
  ghostKey?: number;
}

interface Props {
  state: GameState;
  pack: ContentPack;
  /**
   * Override stat values used for bar fill (starts at prevStats, reveals
   * per-delta to stay in sync with the outcome stagger).
   * When null/undefined, falls back to state.stats.
   */
  displayStats?: Record<string, number> | null;
  /** Per-stat pulse + ghost data driven by GameShell during outcome. */
  statDisplay?: Record<string, StatDisplay> | null;
}

export function Hud({ state, pack, displayStats, statDisplay }: Props) {
  const stage = pack.stages[state.stageIndex];
  const ageLabel = stage?.ageLabel ?? stage?.label ?? "";

  // Refs to each stat container for WAAPI pulse.
  const statEls = useRef<Map<string, HTMLDivElement>>(new Map());
  // Track previous nonces to detect real changes (not just prop-object churns).
  const prevNonces = useRef<Record<string, number>>({});

  // Fire WAAPI pulse whenever a stat's nonce increments.
  useEffect(() => {
    if (!statDisplay) return;
    for (const def of pack.stats) {
      const nonce = statDisplay[def.id]?.pulseNonce ?? 0;
      if (nonce !== (prevNonces.current[def.id] ?? 0) && nonce > 0) {
        const el = statEls.current.get(def.id);
        if (el) {
          el.animate(
            [
              { transform: "scale(1)", offset: 0 },
              { transform: "scale(1.08)", offset: 0.4 },
              { transform: "scale(1)", offset: 1 },
            ],
            {
              duration: GAME_DURATION.base,
              easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              fill: "none",
            }
          );
        }
      }
      prevNonces.current[def.id] = nonce;
    }
  }); // intentionally runs every render; prevNonces ref guards against extra-fires

  return (
    <>
      <div className="game-hud" role="status" aria-label="סטטוס שחקן">
        <div className="game-hud-age">{ageLabel}</div>
        <div className="game-hud-stats">
          {pack.stats.map((def) => {
            const disp = statDisplay?.[def.id];
            const rawVal =
              displayStats?.[def.id] !== undefined
                ? displayStats[def.id]!
                : (state.stats[def.id] ?? def.initial);
            const pct = Math.round(
              ((rawVal - def.min) / (def.max - def.min)) * 100
            );

            return (
              <div
                key={def.id}
                className="game-hud-stat"
                title={`${def.label}: ${rawVal}`}
                ref={(el) => {
                  if (el) statEls.current.set(def.id, el);
                  else statEls.current.delete(def.id);
                }}
              >
                <span>{def.emoji}</span>
                <div className="game-hud-stat-bar" aria-hidden>
                  {disp?.ghostPct !== undefined && (
                    <div
                      key={disp.ghostKey ?? 0}
                      className="game-hud-stat-ghost"
                      style={{ width: `${disp.ghostPct}%` }}
                    />
                  )}
                  <div
                    className="game-hud-stat-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span>{rawVal}</span>
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
