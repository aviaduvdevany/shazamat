"use client";

import type { GameMood } from "./useGameMotion";
import { GAME_MOOD } from "./useGameMotion";
import { playSfx } from "../audio/index";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface Props {
  mood: GameMood;
  onSkip: () => void;
}

/**
 * UX-2: Displayed inside .game-event-area while the dice animation plays
 * for roll choices. Tap anywhere to skip to the outcome immediately.
 *
 * The die spins 4 times at a per-tick duration derived from GAME_MOOD.rollMs,
 * giving a slot-machine feel that scales with the card's tension.
 */
export function RollTicker({ mood, onSkip }: Props) {
  const reduced = usePrefersReducedMotion();
  const rollMs = GAME_MOOD[mood].rollMs;
  const tickMs = Math.round(rollMs / 4);

  return (
    <div
      className="game-roll-ticker"
      onClick={onSkip}
      role="button"
      aria-label="גורל מוטל — לחץ לדלג"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSkip(); }}
    >
      <span
        className="game-roll-die"
        aria-hidden="true"
        style={{ animationDuration: `${tickMs}ms` } as React.CSSProperties}
        onAnimationIteration={() => playSfx("roll-tick", reduced)}
      >
        🎲
      </span>
      <p className="game-roll-hint">לחץ לדלג</p>
    </div>
  );
}
