"use client";

import { useEffect, useState } from "react";
import type { Stage } from "../schema/stages";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { GAME_SEQUENCE } from "./useGameMotion";

interface Props {
  currentStage?: Stage;
  nextStage?: Stage;
  /** Beat phase driven by GameShell ceremony: "dim" | "kicker" | "breath" | "slam" | "age" */
  beat: string;
  onSkip: () => void;
}

/**
 * UX-3: Full-surface chapter ceremony overlay.
 *
 * Renders as an absolute overlay above the dimmed viewport (z-index 20).
 * Copy:
 *   kicker  — סוף · [currentStage.label]
 *   name    — [nextStage.label]  (slammed at beat="slam")
 *   age     — parsed rumble ticks → final ageLabel  (at beat="age")
 *
 * The player can tap anywhere to skip. A visually quiet "המשך" button
 * is present for keyboard/screen-reader users (autoFocus at "age" beat).
 *
 * Age rumble: if ageLabel matches "גילאי NNN–NNN" we show three numeric
 * tick frames (start · mid · end) at 120ms each then land on the full label.
 * No rumble when reduced-motion is active.
 */
export function StageClear({ currentStage, nextStage, beat, onSkip }: Props) {
  const reduced = usePrefersReducedMotion();
  const [ageDisplay, setAgeDisplay] = useState<string>("");

  // Parse age range for rumble: "גילאי 13–18" → [13, 18]
  const ageLabel = nextStage?.ageLabel ?? "";
  const rumbleNumbers = parseAgeRange(ageLabel);
  const canRumble = !reduced && rumbleNumbers !== null;

  // When beat reaches "age", run the 3-tick rumble then settle.
  useEffect(() => {
    if (beat !== "age") {
      setAgeDisplay("");
      return;
    }

    if (!ageLabel) return;

    if (!canRumble || rumbleNumbers === null) {
      setAgeDisplay(ageLabel);
      return;
    }

    const [start, end] = rumbleNumbers;
    const mid = Math.round((start + end) / 2);
    const ticks: string[] = [String(start), String(mid), String(end)];
    let i = 0;
    setAgeDisplay(ticks[0]!);

    const stride = GAME_SEQUENCE.stageClearRumbleStride;
    const timer1 = setTimeout(() => { i = 1; setAgeDisplay(ticks[1]!); }, stride);
    const timer2 = setTimeout(() => { i = 2; setAgeDisplay(ticks[2]!); }, stride * 2);
    const timer3 = setTimeout(() => { void i; setAgeDisplay(ageLabel); }, stride * 3);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [beat, ageLabel, canRumble]); // eslint-disable-line react-hooks/exhaustive-deps

  const isVisible = beat !== "" && beat !== "dim";
  const isSlamBeat = beat === "slam" || beat === "age";

  return (
    <div
      className="game-stage-clear-overlay"
      onClick={onSkip}
      aria-label="מסך מעבר שלב"
    >
      {/* Kicker: סוף · [current stage] */}
      <div
        className={[
          "game-stage-clear-kicker",
          beat === "kicker" || isSlamBeat || beat === "age" ? "is-visible" : "",
        ].filter(Boolean).join(" ")}
        aria-hidden
      >
        {isVisible && currentStage ? `סוף · ${currentStage.label}` : ""}
      </div>

      {/* Next stage name — slammed */}
      <div
        className={[
          "game-stage-clear-name",
          isSlamBeat || beat === "age" ? "is-slam" : "",
        ].filter(Boolean).join(" ")}
        aria-live="polite"
        aria-atomic="true"
      >
        {isSlamBeat || beat === "age" ? (nextStage?.label ?? "") : ""}
      </div>

      {/* Age label / rumble */}
      <div
        className={[
          "game-stage-clear-age",
          beat === "age" ? "is-visible" : "",
        ].filter(Boolean).join(" ")}
        aria-hidden
      >
        {ageDisplay}
      </div>

      {/* Keyboard / a11y skip button; visible only at age beat */}
      {beat === "age" && (
        <button
          className="game-stage-clear-skip game-btn"
          onClick={(e) => { e.stopPropagation(); onSkip(); }}
          autoFocus
          aria-label="המשך לשלב הבא"
        >
          המשך
        </button>
      )}
    </div>
  );
}

/** Parse "גילאי 13–18" → [13, 18]. Returns null if not parseable. */
function parseAgeRange(label: string): [number, number] | null {
  // Match "NNN–NNN" or "NNN-NNN" (en-dash or hyphen)
  const m = label.match(/(\d+)[–\-](\d+)/);
  if (!m) return null;
  const a = parseInt(m[1]!, 10);
  const b = parseInt(m[2]!, 10);
  if (isNaN(a) || isNaN(b)) return null;
  return [a, b];
}
