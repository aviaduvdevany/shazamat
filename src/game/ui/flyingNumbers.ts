/**
 * Flying stat numbers — UX-7.
 *
 * On each stat delta reveal, spawns an absolutely-positioned
 * duplicate "+N" / "−N" that travels from the outcome delta chip
 * to the matching HUD stat, then fades out.
 *
 * Call `spawnFlyingNumber` from `revealHudStat` on the same frame
 * as the HUD pulse. Pass `reduced=true` to no-op.
 *
 * No React — uses raw DOM + WAAPI so it runs without a re-render
 * and does not interfere with the React tree.
 *
 * Caller is responsible for cancelling in-flight flyers on skip/continue
 * by calling `abortFlyingNumbers`.
 */

const FLYER_CLASS = "game-stat-flyer";

let activeFlyers: Animation[] = [];

/**
 * Abort all in-flight flying number animations.
 * Called by GameShell when the player skips or auto-advance fires.
 */
export function abortFlyingNumbers(): void {
  for (const anim of activeFlyers) {
    try { anim.cancel(); } catch { /* ignore */ }
  }
  activeFlyers = [];

  // Also remove any orphaned flyer elements.
  document
    .querySelectorAll(`.${FLYER_CLASS}`)
    .forEach((el) => el.remove());
}

/**
 * Spawn a flying number from a delta chip to the matching HUD stat bar.
 *
 * @param statId   - stat id (e.g. "musicianship")
 * @param delta    - numeric delta (positive or negative)
 * @param emoji    - stat emoji for the flyer label
 * @param reduced  - if true, no-op immediately
 * @param mood     - "sad" uses ease-out (no overshoot per spec)
 */
export function spawnFlyingNumber(
  statId: string,
  delta: number,
  emoji: string,
  reduced: boolean,
  mood: string,
): void {
  if (reduced) return;

  // Find source (delta chip in outcome well) and target (HUD stat).
  const sourceEl = document.querySelector<HTMLElement>(
    `[data-stat-id="${statId}"]`
  );
  const targetEl = document.querySelector<HTMLElement>(
    `[data-hud-stat="${statId}"]`
  );

  // The surface is position:relative; we need it as the offset parent.
  const surface = document.querySelector<HTMLElement>(".game-surface");

  if (!sourceEl || !targetEl || !surface) return;

  // Measure rects relative to the surface.
  const surfaceRect = surface.getBoundingClientRect();
  const srcRect     = sourceEl.getBoundingClientRect();
  const dstRect     = targetEl.getBoundingClientRect();

  const startX = srcRect.left + srcRect.width / 2 - surfaceRect.left;
  const startY = srcRect.top  + srcRect.height / 2 - surfaceRect.top;
  const endX   = dstRect.left + dstRect.width / 2  - surfaceRect.left;
  const endY   = dstRect.top  + dstRect.height / 2  - surfaceRect.top;

  const isGain = delta > 0;
  const sign   = isGain ? "+" : "";
  const color  = isGain ? "#DB7738" : "#e05555";

  // Create flyer element.
  const flyer = document.createElement("div");
  flyer.className = FLYER_CLASS;
  flyer.setAttribute("aria-hidden", "true");
  flyer.textContent = `${emoji} ${sign}${delta}`;
  flyer.style.cssText = [
    "position: absolute",
    "z-index: 30",
    "pointer-events: none",
    "font-size: 14px",
    "font-weight: 900",
    `color: ${color}`,
    "white-space: nowrap",
    `left: ${startX}px`,
    `top: ${startY}px`,
    "transform: translate(-50%, -50%)",
    "will-change: transform, opacity",
  ].join(";");

  surface.appendChild(flyer);

  const dx = endX - startX;
  const dy = endY - startY;

  const easing = (isGain && mood !== "sad")
    ? "cubic-bezier(0.34, 1.4, 0.64, 1)"   // --g-ease-overshoot for gains
    : "cubic-bezier(0.2, 0, 0, 1)";          // --g-ease-out for losses / sad

  const anim = flyer.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)",    opacity: 1, offset: 0 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.8)`, opacity: 0, offset: 1 },
    ],
    {
      duration: 450, // --g-t-hold (450ms)
      easing,
      fill: "forwards",
    }
  );

  activeFlyers.push(anim);

  anim.onfinish = () => {
    flyer.remove();
    activeFlyers = activeFlyers.filter((a) => a !== anim);
  };

  anim.oncancel = () => {
    flyer.remove();
  };
}
