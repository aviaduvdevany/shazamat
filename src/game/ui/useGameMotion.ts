"use client";

import { useCallback, useRef } from "react";
import { usePrefersReducedMotion, GAME_DURATION } from "./usePrefersReducedMotion";

/**
 * Timing offsets for sequences that live outside the CSS token set.
 * These are bible values (from ux-plan.md) that belong to JS orchestration.
 */
export const GAME_SEQUENCE = {
  // Event enter
  kickerDelay:   40,
  headlineDelay: 100,
  bodyDelay:     180,
  choicesStart:  260,
  choiceStride:  40,
  firstEventExtra: 200,

  // Well exit
  wellExit:      160,

  // Outcome
  labelIn:       160,
  firstDeltaIn:  240,
  deltaStride:    80,
  continueIn:    350, // after last delta

  // Auto-advance from outcome start
  autoAdvance:  1400,
  autoAdvanceFlavor: 1100,
  autoAdvanceReduced: 600,

  // HUD
  hudGhostDrain: 300,
} as const;

/**
 * A tiny imperative wait helper that respects prefers-reduced-motion.
 *
 * `wait(ms)` always returns a thenable — under reduced motion it resolves in
 * 0ms so sequences complete immediately, except where noted with
 * `{ ignorReduce: true }` (used for the outcome auto-advance minimum beat).
 *
 * `skip()` cancels the current wait so Continue can cut a running sequence.
 * Call `resetSkip()` at the start of each new sequence.
 */
export function useGameMotion() {
  const reduced = usePrefersReducedMotion();
  const skippedRef = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSkip = useCallback(() => {
    skippedRef.current = false;
  }, []);

  const skip = useCallback(() => {
    skippedRef.current = true;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Waits `ms` (or 0 under reduced motion unless `ignoreReduce`). */
  const wait = useCallback(
    (ms: number, ignoreReduce = false): Promise<void> => {
      const actual = (reduced && !ignoreReduce) ? 0 : ms;
      if (actual === 0 || skippedRef.current) return Promise.resolve();
      return new Promise((resolve) => {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          resolve();
        }, actual);
      });
    },
    [reduced]
  );

  /** Was skip() called since last resetSkip()? Guards sequenced steps. */
  const isSkipped = useCallback(() => skippedRef.current, []);

  return { wait, skip, resetSkip, isSkipped, reduced };
}

/** Duration tokens re-exported for use alongside GAME_SEQUENCE in one import. */
export { GAME_DURATION };
