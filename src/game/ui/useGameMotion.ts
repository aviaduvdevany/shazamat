"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePrefersReducedMotion, GAME_DURATION } from "./usePrefersReducedMotion";

/**
 * Timing offsets for sequences that live outside the CSS token set.
 * These are bible values (from ux-plan.md) that belong to JS orchestration.
 */
export const GAME_SEQUENCE = {
  // Event enter (neutral/house values; mood scaling applied in GameShell)
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

  // Stage clear ceremony (UX-3)
  stageClearKicker:       120, // t=120 — סוף · [stage]
  stageClearBreath:       400, // t=400 — 200ms black hold starts
  stageClearSlam:         600, // t=600 — next stage name slam
  stageClearAge:          780, // t=780 — age range / rumble
  stageClearAuto:        1600, // t=1600 — auto into next event
  stageClearRumbleStride: 120, // per rumble tick (3 × 120 = 360ms < 400ms cap)

  // UX-4: Birth funnel
  emailLine1:      80,  // t=80ms  — first assemble line appears
  emailLine2:     350,  // t=350ms — second line
  emailLine3:     600,  // t=600ms — third line + tick starts
  emailAssemble:  900,  // minimum theater floor before smash cut
  emailSmash:      80,  // smash-cut black overlay duration

  // UX-5: Ending show (absolute from show start)
  endingWorld:     400, // t=400  — "החיים שלך הסתיימו." preamble
  endingPreamble:  400, // alias — same beat
  endingPrompt:   1300, // t=1300 — "אתה הוא..."
  endingFlash:    2200, // t=2200 — 80ms white/orange flash
  endingName:     2280, // t=2280 — member name slam + aria-live
  endingPortrait: 2480, // t=2480 — portrait pop (scale 0.8 → 1.06 → 1)
  endingRole:     2680, // t=2680 — role fade
  endingStats:    2860, // t=2860 — stat count-up begins (400ms each)
  endingBlurb:    3200, // t=3200 — blurb fade
  endingRecap:    3500, // t=3500 — recap lines stagger 60ms
  endingActions:  3800, // t=3800 — share + new life fade in

  endingShareGate:     400, // wait after name before Share is allowed
  endingRecapStride:    60, // stagger stride between recap lines
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
  neutral: { enterScale: 1.0,  choiceHold: 0,   deltaStride: 80, outcomeLabelExtra: 0,   rollMs: 550 },
  funny:   { enterScale: 0.75, choiceHold: 0,   deltaStride: 60, outcomeLabelExtra: 0,   rollMs: 450 },
  tense:   { enterScale: 1.3,  choiceHold: 160, deltaStride: 80, outcomeLabelExtra: 200, rollMs: 700 },
  epic:    { enterScale: 1.4,  choiceHold: 80,  deltaStride: 80, outcomeLabelExtra: 0,   rollMs: 550 },
  sad:     { enterScale: 1.6,  choiceHold: 120, deltaStride: 80, outcomeLabelExtra: 0,   rollMs: 550 },
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
  const skippedRef = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending wait on unmount so mid-show setState never fires.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
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
