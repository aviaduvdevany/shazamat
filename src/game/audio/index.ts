/**
 * Audio stub — called on the same frame as the visual (UX-7).
 * Files are not required; the call sites are wired so that dropping
 * mp3s into public/game/sfx/ and implementing this module is the
 * only change needed to activate real audio.
 *
 * `reduced` param: pass usePrefersReducedMotion() result so audio
 * stays silent when the player has opted out of motion.
 */

const SFX_BASE = "/game/sfx/";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let audioContext: AudioContext | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cache = new Map<string, AudioBuffer>();

export async function loadSfx(id: string): Promise<void> {
  // No-op in Phase 0 (files don't exist yet)
  void id;
}

/**
 * Fire a one-shot SFX.
 *
 * @param id   - Catalog id (e.g. "stat-up", "choice-select")
 * @param reduced - If true, returns immediately (prefers-reduced-motion)
 */
export function playSfx(id: string, reduced = false): void {
  if (reduced) return;
  // No-op until Phase 1 Audio: files don't exist yet.
  // When real implementation lands, replace this body with
  // AudioContext decode + play using SFX_BASE + id + ".mp3".
  void id;
  void SFX_BASE;
}

export function playMusic(id: string): void {
  // No-op in Phase 0
  void id;
}

export function stopMusic(): void {
  // No-op in Phase 0
}
