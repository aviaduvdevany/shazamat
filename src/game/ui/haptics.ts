/**
 * Haptic feedback helper — UX-7.
 *
 * Wraps navigator.vibrate with:
 *   1. SSR guard (typeof navigator)
 *   2. Reduced-motion guard passed by the caller (off when reduced)
 *   3. iOS Safari no-ops naturally (vibrate not supported)
 *
 * Patterns from the spec:
 *   HAP_TAP    10        choice commit
 *   HAP_GAIN   20        stat gain
 *   HAP_LOSS   30        stat loss
 *   HAP_NAME   [10,40,30] ending name slam (triple pulse)
 */

export const HAP_TAP  = 10;
export const HAP_GAIN = 20;
export const HAP_LOSS = 30;
export const HAP_NAME = [10, 40, 30] as const;

export function haptic(
  pattern: number | readonly number[],
  reduced: boolean,
): void {
  if (reduced) return;
  if (typeof navigator === "undefined") return;
  navigator.vibrate?.(pattern as number | number[]);
}
