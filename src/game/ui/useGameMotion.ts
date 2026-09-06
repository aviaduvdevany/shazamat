"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePrefersReducedMotion, GAME_DURATION } from "./usePrefersReducedMotion";

/**
 * Timing offsets for sequences that live outside the CSS token set.
 * These are bible values (from ux-plan.md) that belong to JS orchestration.
 */
export const GAME_SEQUENCE = {
  // Event enter (neutral/house values; mood scaling applied in GameShell)
  kickerDelay:   50,
  headlineDelay: 130,
  bodyDelay:     230,
  choicesStart:  340,
  choiceStride:  50,
  firstEventExtra: 260,

  // Well exit
  wellExit:      200,

  // Outcome
  labelIn:       220,
  firstDeltaIn:  320,
  deltaStride:   100,
  continueIn:    450, // after last delta

  // Auto-advance from outcome start
  autoAdvance:  2000,
  autoAdvanceFlavor: 1600,
  autoAdvanceReduced: 800,

  // HUD
  hudGhostDrain: 300,

  // Stage clear ceremony (UX-3)
  stageClearKicker:       150, // t=150 — סוף · [stage]
  stageClearBreath:       500, // t=500 — 200ms black hold starts
  stageClearSlam:         750, // t=750 — next stage name slam
  stageClearAge:          980, // t=980 — age range / rumble
  stageClearAuto:        2200, // t=2200 — auto into next event
  stageClearRumbleStride: 150, // per rumble tick (3 × 150 = 450ms)

  // UX-4: Birth funnel
  emailLine1:      80,  // t=80ms  — first assemble line appears
  emailLine2:     350,  // t=350ms — second line
  emailLine3:     600,  // t=600ms — third line + tick starts
  emailAssemble:  900,  // minimum theater floor before smash cut
  emailSmash:      80,  // smash-cut black overlay duration

  // UX-5: Ending show (absolute from show start)
  endingWorld:     500, // t=500  — "החיים שלך הסתיימו." preamble
  endingPreamble:  500, // alias — same beat
  endingPrompt:   1600, // t=1600 — "אתה הוא..."
  endingFlash:    2800, // t=2800 — 80ms white/orange flash
  endingName:     2880, // t=2880 — member name slam + aria-live
  endingPortrait: 3120, // t=3120 — portrait pop (scale 0.8 → 1.06 → 1)
  endingRole:     3360, // t=3360 — role fade
  endingStats:    3580, // t=3580 — stat count-up begins (560ms each)
  endingBlurb:    4000, // t=4000 — blurb fade
  endingRecap:    4360, // t=4360 — recap lines stagger 60ms
  endingActions:  4720, // t=4720 — share + new life fade in

  endingShareGate:     500, // wait after name before Share is allowed
  endingRecapStride:    80, // stagger stride between recap lines
  endingNewLifePulse: 6000, // pulse New Life once after share or 6s from actions
} as const;

/**
 * UX-2: Per-mood timing overrides.
 *
 * enterScale  — multiplier applied to the house enter delays (40 / 100 / 180 / 260 ms).
 *               CSS variables --g-k-delay / --g-h-delay / --g-b-delay / --g-c-start must
 *               reflect these values — see "UX-2: Mood tempo" section in game.css.
 * choiceHold  — extra ms added after the enter stagger before choices become tappable.
 * deltaStride — ms between each successive stat delta reveal (CSS --g-delta-stride).
 * outcomeLabelExtra — extra ms before the outcome label appears and before first delta
 *               (CSS --g-outcome-label-extra).
 * rollMs      — total duration of the dice ticker animation.
 */
export const GAME_MOOD = {
  neutral: { enterScale: 1.0,  choiceHold: 0,   deltaStride: 100, outcomeLabelExtra: 0,   rollMs: 700 },
  funny:   { enterScale: 0.75, choiceHold: 0,   deltaStride: 75,  outcomeLabelExtra: 0,   rollMs: 550 },
  tense:   { enterScale: 1.3,  choiceHold: 200, deltaStride: 100, outcomeLabelExtra: 260, rollMs: 900 },
  epic:    { enterScale: 1.4,  choiceHold: 100, deltaStride: 100, outcomeLabelExtra: 0,   rollMs: 700 },
  sad:     { enterScale: 1.6,  choiceHold: 150, deltaStride: 100, outcomeLabelExtra: 0,   rollMs: 700 },
} as const;

export type GameMood = keyof typeof GAME_MOOD;

/**
 * UX-2: Per-rarity extras stacked on top of mood choiceHold.
 * extraHoldMs — added to the choice-enable timer so rare enters breathe longer.
 */
export const GAME_RARITY = {
  common: { extraHoldMs: 0 },
  rare:   { extraHoldMs: 80 },
  ultra:  { extraHoldMs: 160 },
} as const;

export type GameRarity = keyof typeof GAME_RARITY;

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
  const skippedRef  = useRef(false);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store the pending resolve so skip() can unblock an in-flight wait().
  const resolveRef  = useRef<(() => void) | null>(null);

  // Clear any pending wait on unmount so mid-show setState never fires.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Resolve any dangling promise so callers don't leak.
      if (resolveRef.current !== null) {
        resolveRef.current();
        resolveRef.current = null;
      }
    };
  }, []);

  const resetSkip = useCallback(() => {
    skippedRef.current = false;
  }, []);

  const skip = useCallback(() => {
    skippedRef.current = true;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Resolve any in-flight wait() so the awaiting async function continues.
    if (resolveRef.current !== null) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }, []);

  /** Waits `ms` (or 0 under reduced motion unless `ignoreReduce`). */
  const wait = useCallback(
    (ms: number, ignoreReduce = false): Promise<void> => {
      const actual = (reduced && !ignoreReduce) ? 0 : ms;
      if (actual === 0 || skippedRef.current) return Promise.resolve();
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          resolveRef.current = null;
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
