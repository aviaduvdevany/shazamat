"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe hook that tracks the user's prefers-reduced-motion preference.
 * Starts false on the server and subscribes to OS-level changes on the client.
 *
 * Usage:
 *   const reduced = usePrefersReducedMotion();
 *   const delay = reduced ? 0 : GAME_DURATION.hold;
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/**
 * Duration constants (ms) mirroring the --g-t-* CSS tokens.
 * Use these in JS sequences (setTimeout, WAAPI) instead of magic numbers.
 * Sequence totals (1400ms outcome, 1600ms stage clear, 2200ms ending hold)
 * belong to their respective phases (UX-1, UX-3, UX-5).
 *
 * Under reduced motion, all travel tokens collapse to INSTANT (0).
 * Check usePrefersReducedMotion() before scheduling any sequence.
 */
export const GAME_DURATION = {
  instant:   0,
  ack:      80,
  fast:    160,
  base:    260,
  slow:    400,
  hold:    560,
  ceremony: 880,
  drama:   1400,
} as const;

export type GameDurationKey = keyof typeof GAME_DURATION;
