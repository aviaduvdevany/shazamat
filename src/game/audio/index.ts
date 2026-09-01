/**
 * Audio stub for Phase 0.
 * Dropping actual mp3 files and activating playback later
 * requires zero changes to event content — just implement this module.
 */

const SFX_BASE = "/game/sfx/";

let audioContext: AudioContext | null = null;
const cache = new Map<string, AudioBuffer>();

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioContext;
}

export async function loadSfx(id: string): Promise<void> {
  // No-op in Phase 0 (files don't exist yet)
  void id;
}

export function playSfx(id: string): void {
  // No-op in Phase 0
  void id;
}

export function playMusic(id: string): void {
  // No-op in Phase 0
  void id;
}

export function stopMusic(): void {
  // No-op in Phase 0
}
