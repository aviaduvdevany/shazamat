"use client";

import { useEffect, useRef, useState } from "react";
import type { Member } from "../schema/members";
import type { GameState } from "../schema/state";
import type { ContentPack } from "../schema/pack";
import { usePrefersReducedMotion, GAME_DURATION } from "./usePrefersReducedMotion";
import { useGameMotion, GAME_SEQUENCE } from "./useGameMotion";
import { playSfx } from "../audio/index";
import { haptic, HAP_NAME } from "./haptics";
import { LifeRecap } from "./LifeRecap";
import { getExperimentFlags } from "./experiments";

interface Props {
  member: Member;
  state: GameState;
  pack: ContentPack;
  shareUrl?: string;
  onRestart: () => void;
  /** True for 200ms while the ending fades out on restart. */
  exiting?: boolean;
}

type EndingBeat =
  | ""
  | "preamble"
  | "prompt"
  | "flash"
  | "name"
  | "portrait"
  | "role"
  | "stats"
  | "blurb"
  | "recap"
  | "actions";

const BEAT_ORDER: EndingBeat[] = [
  "", "preamble", "prompt", "flash", "name",
  "portrait", "role", "stats", "blurb", "recap", "actions",
];

function atOrAfter(current: EndingBeat, target: EndingBeat): boolean {
  return BEAT_ORDER.indexOf(current) >= BEAT_ORDER.indexOf(target);
}

/**
 * Animate a counter from 0 → `end` over `durationMs`.
 * Returns a cancel function. Under reduced motion, snaps immediately.
 */
function startCountUp(
  end: number,
  durationMs: number,
  reduced: boolean,
  setter: (v: number) => void,
): () => void {
  if (reduced || durationMs === 0) {
    setter(end);
    return () => {};
  }
  const startTime = performance.now();
  let rafId: number;
  function tick(now: number) {
    const t = Math.min((now - startTime) / durationMs, 1);
    setter(Math.round(t * end));
    if (t < 1) rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

export function EndingScreen({ member, state, pack, shareUrl, onRestart, exiting = false }: Props) {
  const reduced = usePrefersReducedMotion();
  const motion = useGameMotion();

  // UX-7 A/B: ?ux_hold=900|1300|2200 overrides the ending hold-before-name.
  // Flash fires at holdMs, name at holdMs + 80. Post-name offsets stay relative.
  const { holdMs } = getExperimentFlags();

  const [beat, setBeat] = useState<EndingBeat>("");
  const [shareReady, setShareReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newLifePulse, setNewLifePulse] = useState(false);
  const [displayStats, setDisplayStats] = useState<Record<string, number>>(() =>
    Object.fromEntries(pack.stats.map((s) => [s.id, 0]))
  );

  // Skip phase: 0 = before preamble (ignore taps), 1 = skip-to-name, 2 = show done
  const skipPhase = useRef<0 | 1 | 2>(0);

  // Persistent cleanup refs
  const countUpCancels = useRef<Array<() => void>>([]);
  const gateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const newLifeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Main show sequence ──────────────────────────────────────
  useEffect(() => {
    let alive = true;
    motion.resetSkip();
    setBeat("");
    skipPhase.current = 0;

    async function runShow() {
      // t=0–400: silence (preamble)
      await motion.wait(GAME_SEQUENCE.endingPreamble);
      if (!alive) return;

      skipPhase.current = 1;
      setBeat("preamble");

      // t=1300: prompt ("אתה הוא...")
      await motion.wait(GAME_SEQUENCE.endingPrompt - GAME_SEQUENCE.endingPreamble);
      if (!alive || motion.isSkipped()) return setNameBeat(alive);
      setBeat("prompt");

      // Flash at holdMs (default 2200; A/B: 900 or 1300).
      // The prompt → flash gap adapts to the holdMs variant.
      const flashWait = holdMs - GAME_SEQUENCE.endingPrompt;
      await motion.wait(flashWait > 0 ? flashWait : 0);
      if (!alive || motion.isSkipped()) return setNameBeat(alive);
      setBeat("flash");

      // Name arrives 80ms after flash (same as default: endingName - endingFlash = 80).
      await motion.wait(80);
      if (!alive) return;
      setNameBeat(alive);
    }

    runShow();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdMs]);

  function setNameBeat(alive: boolean) {
    if (!alive) return;
    playSfx("reveal-slam", reduced);
    haptic(HAP_NAME, reduced);
    setBeat("name");
  }

  // ── Post-name sequence ──────────────────────────────────────
  // Triggered when beat transitions to "name" (normal flow or skip).
  useEffect(() => {
    if (beat !== "name") return;
    let alive = true;

    // Gate Share: show button only after name has been visible 400ms.
    // Under reduced motion, gate is instant (GAME_SEQUENCE.endingShareGate collapsed to 0).
    const gateMs = reduced ? 0 : GAME_SEQUENCE.endingShareGate;
    gateTimerRef.current = setTimeout(() => {
      if (alive) setShareReady(true);
    }, gateMs);

    async function runPostName() {
      // Portrait
      await motion.wait(GAME_SEQUENCE.endingPortrait - GAME_SEQUENCE.endingName);
      if (!alive) return;
      setBeat("portrait");

      // Role
      await motion.wait(GAME_SEQUENCE.endingRole - GAME_SEQUENCE.endingPortrait);
      if (!alive) return;
      setBeat("role");

      // Stats count-up
      await motion.wait(GAME_SEQUENCE.endingStats - GAME_SEQUENCE.endingRole);
      if (!alive) return;
      setBeat("stats");

      // Cancel any previous count-ups before starting new ones.
      countUpCancels.current.forEach((cancel) => cancel());
      countUpCancels.current = [];

      pack.stats.forEach((def) => {
        const target = state.stats[def.id] ?? def.initial;
        const cancel = startCountUp(target, GAME_DURATION.hold, reduced, (v) => {
          setDisplayStats((prev) => ({ ...prev, [def.id]: v }));
        });
        countUpCancels.current.push(cancel);
      });

      // Blurb
      await motion.wait(GAME_SEQUENCE.endingBlurb - GAME_SEQUENCE.endingStats);
      if (!alive) return;
      setBeat("blurb");

      // Recap
      await motion.wait(GAME_SEQUENCE.endingRecap - GAME_SEQUENCE.endingBlurb);
      if (!alive) return;
      setBeat("recap");

      // Actions
      await motion.wait(GAME_SEQUENCE.endingActions - GAME_SEQUENCE.endingRecap);
      if (!alive) return;
      setBeat("actions");
      skipPhase.current = 2;

      // Pulse New Life once after 6s if no share triggered it earlier.
      newLifeTimerRef.current = setTimeout(() => {
        if (alive) setNewLifePulse(true);
      }, GAME_SEQUENCE.endingNewLifePulse);
    }

    runPostName();

    return () => {
      alive = false;
      if (gateTimerRef.current !== null) clearTimeout(gateTimerRef.current);
      if (newLifeTimerRef.current !== null) clearTimeout(newLifeTimerRef.current);
      countUpCancels.current.forEach((cancel) => cancel());
      countUpCancels.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat === "name" ? 1 : 0]);

  // ── Skip handler ────────────────────────────────────────────
  function handleSurfaceTap() {
    if (skipPhase.current === 0) return; // silence period — ignore
    if (skipPhase.current === 1) {
      // If name isn't visible yet, jump to it and start post-name sequence.
      // If name is already visible (tap during portrait/role/stats/…),
      // just fast-forward the current in-flight wait — do NOT reset beat to
      // "name" or the post-name useEffect dependency would re-fire.
      if (!atOrAfter(beat, "name")) {
        motion.skip();
        setBeat("name");
      } else {
        motion.skip();
      }
    }
    // Phase 2: show already complete, taps do nothing special.
  }

  // ── Share handler ───────────────────────────────────────────
  async function handleShare() {
    const shareText = `חייתי חיים שלמים והפכתי ל${member.name}. מה אתה תהיה?`;
    const shareUrl_ = `${window.location.origin}${shareUrl ?? "/life"}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl_ });
        fireNewLifePulse();
        return;
      } catch {
        // fall through to copy
      }
    }

    const fullText = `${shareText}\n${shareUrl_}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, "_blank");
    }
    fireNewLifePulse();
  }

  function fireNewLifePulse() {
    if (newLifeTimerRef.current !== null) clearTimeout(newLifeTimerRef.current);
    setNewLifePulse(true);
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div
      className={["game-ending-screen", exiting ? "is-exiting" : ""].filter(Boolean).join(" ")}
      data-beat={beat}
      onClick={handleSurfaceTap}
      aria-label="סיום המשחק"
    >
      {/* t=400: preamble */}
      <div
        className={["game-ending-preamble", atOrAfter(beat, "preamble") ? "is-visible" : ""].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        {atOrAfter(beat, "preamble") ? "החיים שלך הסתיימו." : ""}
      </div>

      {/* t=1300: prompt */}
      <div
        className={["game-ending-prompt", atOrAfter(beat, "prompt") ? "is-visible" : ""].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        {atOrAfter(beat, "prompt") ? "אתה הוא..." : ""}
      </div>

      {/* t=2200: flash overlay */}
      {beat === "flash" && (
        <div className="game-ending-flash-overlay" aria-hidden="true" />
      )}

      {/* t=2280: name slam */}
      <div
        className={["game-ending-member-name", atOrAfter(beat, "name") ? "is-slam" : ""].filter(Boolean).join(" ")}
        aria-live="polite"
        aria-atomic="true"
      >
        {atOrAfter(beat, "name") ? member.name : ""}
      </div>

      {/* t=2480: portrait */}
      {atOrAfter(beat, "portrait") && (
        <div
          className="game-sprite-portrait game-ending-portrait-pop"
          style={{
            width: 120,
            height: 120,
            backgroundImage: `url(/game/members/${member.id}-portrait.png)`,
          }}
          aria-label={`פורטרט של ${member.name}`}
        />
      )}

      {/* t=2680: role */}
      {atOrAfter(beat, "role") && (
        <div className="game-ending-member-role game-ending-role-enter">
          {member.role}
        </div>
      )}

      {/* t=2860: stats count-up */}
      {atOrAfter(beat, "stats") && (
        <div className="game-share-stats game-ending-stats-enter">
          {pack.stats.map((def) => (
            <div key={def.id} className="game-share-stat">
              <span className="game-share-stat-emoji">{def.emoji}</span>
              <span className="game-share-stat-value">
                {displayStats[def.id] ?? 0}
              </span>
              <span className="game-share-stat-label">{def.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* t=3200: blurb */}
      {atOrAfter(beat, "blurb") && (
        <p className="game-ending-blurb game-ending-blurb-enter">
          {member.endingBlurb}
        </p>
      )}

      {/* t=3500: recap — stage-dot strip + one line per stage (UX-7) */}
      {atOrAfter(beat, "recap") && state.log.length > 0 && (
        <LifeRecap log={state.log} stages={pack.stages} animated />
      )}

      {/* t=3800: actions */}
      {atOrAfter(beat, "actions") && (
        <div
          className="game-share-actions game-ending-actions-enter"
          onClick={(e) => e.stopPropagation()}
        >
          {shareReady && (
            <button className="game-btn game-btn-primary" onClick={handleShare}>
              {copied ? "הועתק! שתף עם חברים" : "שתף את התוצאה"}
            </button>
          )}
          <button
            className={["game-btn game-btn-secondary", newLifePulse ? "is-pulse" : ""].filter(Boolean).join(" ")}
            onClick={onRestart}
          >
            התחל חיים חדשים
          </button>
        </div>
      )}

      {/* Phase 3: Shuni CTA slot — reserved, no content yet */}
      <div className="game-ending-shuni-slot" aria-hidden="true" />
    </div>
  );
}
