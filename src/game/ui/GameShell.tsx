"use client";

import { useState, useCallback, useRef } from "react";
import type { GameState } from "../schema/state";
import type { GameEvent } from "../schema/events";
import {
  createRun,
  selectNextEvent,
  applyChoice,
  advanceStage,
  resolveEnding,
  stateRng,
} from "../engine/engine";
import { evaluateCondition } from "../engine/conditions";
import { pack } from "../content/pack";
import { startRun, checkpointRun, completeRun } from "@/lib/game/actions";
import { TitleScreen } from "./TitleScreen";
import { EmailGate } from "./EmailGate";
import { Hud } from "./Hud";
import type { StatDisplay } from "./Hud";
import { SpritePortrait } from "./SpritePortrait";
import { EventCard } from "./EventCard";
import { OutcomeDisplay } from "./OutcomeDisplay";
import { StageClear } from "./StageClear";
import { EndingScreen } from "./EndingScreen";
import { usePrefersReducedMotion, GAME_DURATION } from "./usePrefersReducedMotion";
import { GAME_SEQUENCE } from "./useGameMotion";

type Screen =
  | "title"
  | "email"
  | "playing"
  | "outcome"
  | "stage-clear"
  | "ending";

interface SessionData {
  runId: string;
  seed: number;
}

export function GameShell() {
  const reduced = usePrefersReducedMotion();

  // ── Core game state ───────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("title");
  const [session, setSession] = useState<SessionData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [outcome, setOutcome] = useState<{
    label: string;
    deltas: Array<{ id: string; delta: number }>;
  } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(false);

  // ── UX-1: decision loop state ─────────────────────────────
  /** Choices are disabled until the enter stagger completes. */
  const [choicesReady, setChoicesReady] = useState(false);
  /** Whether the current event is the first of the run (adds a 200ms breath). */
  const [isFirstEvent, setIsFirstEvent] = useState(false);
  /** Set to a choice id when the player commits; drives lock visuals. */
  const [lockedChoiceId, setLockedChoiceId] = useState<string | null>(null);
  /**
   * Override stat values shown in the HUD bars. Starts as prevStats when
   * outcome begins; updated per-delta to stay in sync with the delta stagger.
   */
  const [displayStats, setDisplayStats] = useState<Record<string, number> | null>(null);
  /** Per-stat pulse nonce + ghost data. */
  const [statDisplay, setStatDisplay] = useState<Record<string, StatDisplay> | null>(null);
  /** True while .game-surface has the shake class. */
  const [shaking, setShaking] = useState(false);

  // ── Timers and guards ─────────────────────────────────────
  const checkpointTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const choicesReadyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Prevents double-firing handleContinue (auto-advance + Continue tap). */
  const continueFireRef = useRef(false);
  /** Signals the HUD reveal sub-sequence to bail early. */
  const hudSequenceAbortRef = useRef(false);

  // ── Helpers ───────────────────────────────────────────────
  function scheduleCheckpoint(runId: string, state: GameState) {
    if (checkpointTimer.current) clearTimeout(checkpointTimer.current);
    checkpointTimer.current = setTimeout(() => {
      checkpointRun(runId, state);
    }, 3000);
  }

  /** Get fill % for a stat value. */
  function getStatPct(statId: string, val: number): number {
    const def = pack.stats.find((s) => s.id === statId);
    if (!def) return 0;
    return Math.round(((val - def.min) / (def.max - def.min)) * 100);
  }

  /** Promise that resolves after `ms` (or 0 under reduced motion). */
  function wait(ms: number): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, reduced ? 0 : ms)
    );
  }

  // ── Title → Email ──────────────────────────────────────────
  function handleTitleStart() {
    setScreen("email");
  }

  // ── Email → Playing ────────────────────────────────────────
  const handleEmailSubmit = useCallback(async (email: string) => {
    setEmailLoading(true);
    setEmailError("");

    const result = await startRun({ email, consent: true });
    setEmailLoading(false);

    if (!result.success) {
      setEmailError(result.error);
      return;
    }

    const { runId, seed } = result;
    setSession({ runId, seed });

    const state = createRun({ runId, seed, contentVersion: pack.version }, pack);
    setGameState(state);
    enterPlaying(state, runId);
  }, []);

  // ── Core: enter playing mode ───────────────────────────────
  function enterPlaying(state: GameState, runId: string) {
    const rng = stateRng(state);
    const next = selectNextEvent(state, pack, rng);

    if (next.type === "event") {
      setCurrentEvent(next.event);
      setScreen("playing");

      // Reset outcome + HUD state
      setLockedChoiceId(null);
      setDisplayStats(null);
      setStatDisplay(null);
      continueFireRef.current = false;
      hudSequenceAbortRef.current = false;

      const isFirst = state.log.length === 0;
      setIsFirstEvent(isFirst);

      // Enable choices immediately under reduced motion; otherwise schedule
      // after the stagger animation finishes.
      if (reduced) {
        setChoicesReady(true);
      } else {
        setChoicesReady(false);
        if (choicesReadyTimer.current) clearTimeout(choicesReadyTimer.current);

        const visibleCount = next.event.choices.filter(
          (c) => !c.requires || evaluateCondition(c.requires, state)
        ).length;
        const firstEventExtra = isFirst ? GAME_SEQUENCE.firstEventExtra : 0;
        // Last choice enters at: choicesStart + firstEventExtra + (n-1)*stride
        // Add choice animation duration (--g-t-base = 200ms) + 40ms guard
        const enableMs =
          GAME_SEQUENCE.choicesStart +
          firstEventExtra +
          (visibleCount - 1) * GAME_SEQUENCE.choiceStride +
          GAME_DURATION.base +
          40;

        choicesReadyTimer.current = setTimeout(() => {
          setChoicesReady(true);
        }, enableMs);
      }
    } else if (next.type === "stage-clear") {
      setScreen("stage-clear");
    } else {
      triggerEnding(state, runId);
    }
  }

  // ── Reveal one HUD stat (same frame as its delta) ─────────
  function revealHudStat(
    delta: { id: string; delta: number },
    prevStats: Record<string, number>,
    nextStats: Record<string, number>
  ) {
    if (hudSequenceAbortRef.current) return;

    const { id } = delta;
    const newVal = nextStats[id] ?? (prevStats[id] ?? 0);
    const isLoss = delta.delta < 0;
    const oldPct = getStatPct(id, prevStats[id] ?? 0);

    // Reveal the new value → triggers the CSS width transition on the fill bar.
    setDisplayStats((prev) => ({ ...(prev ?? {}), [id]: newVal }));

    // Pulse + optional ghost.
    setStatDisplay((prev) => {
      const cur = prev?.[id];
      return {
        ...(prev ?? {}),
        [id]: {
          pulseNonce: (cur?.pulseNonce ?? 0) + 1,
          ghostPct: isLoss ? oldPct : undefined,
          ghostKey: isLoss ? (cur?.ghostKey ?? 0) + 1 : undefined,
        },
      };
    });

    // Clear ghost after drain duration + buffer.
    if (isLoss) {
      setTimeout(() => {
        if (hudSequenceAbortRef.current) return;
        setStatDisplay((prev) => {
          if (!prev?.[id]) return prev;
          return {
            ...prev,
            [id]: { ...prev[id], ghostPct: undefined, ghostKey: undefined },
          };
        });
      }, GAME_SEQUENCE.hudGhostDrain + 80);

      // Screen shake for large losses (≥ 8 delta magnitude).
      if (!reduced && delta.delta <= -8) {
        setShaking(true);
        setTimeout(() => setShaking(false), 340);
      }
    }
  }

  /** Snap all HUD stats to their final values immediately (for skip / auto-advance). */
  function snapAllHudStats(nextStats: Record<string, number>) {
    setDisplayStats({ ...nextStats });
    setStatDisplay(null);
  }

  // ── Outcome sequence (HUD sync + auto-advance) ─────────────
  async function runOutcomeSequence(
    statDeltas: Array<{ id: string; delta: number }>,
    prevStats: Record<string, number>,
    nextState: GameState
  ) {
    if (continueFireRef.current) return;
    hudSequenceAbortRef.current = false;

    const hasFlavor = statDeltas.length === 0;
    const autoMs = reduced
      ? GAME_SEQUENCE.autoAdvanceReduced
      : hasFlavor
      ? GAME_SEQUENCE.autoAdvanceFlavor
      : GAME_SEQUENCE.autoAdvance;

    // Schedule auto-advance (absolute from outcome start).
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      if (!continueFireRef.current) {
        continueFireRef.current = true;
        hudSequenceAbortRef.current = true;
        snapAllHudStats(nextState.stats);
        doHandleContinue(nextState);
      }
    }, autoMs);

    // HUD reveal sequence in parallel with the CSS delta animations.
    if (reduced) {
      // Under reduced motion: snap everything immediately.
      snapAllHudStats(nextState.stats);
    } else {
      // Wait for the first delta time offset (240ms from outcome mount).
      await new Promise<void>((resolve) =>
        setTimeout(resolve, GAME_SEQUENCE.firstDeltaIn)
      );

      for (let i = 0; i < statDeltas.length; i++) {
        if (continueFireRef.current || hudSequenceAbortRef.current) return;
        if (i > 0) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, GAME_SEQUENCE.deltaStride)
          );
        }
        if (continueFireRef.current || hudSequenceAbortRef.current) return;
        revealHudStat(statDeltas[i], prevStats, nextState.stats);
      }
    }
  }

  // ── Choice press — async orchestration ────────────────────
  async function handleChoicePress(choiceId: string) {
    if (!gameState || !currentEvent || !session) return;
    if (!choicesReady || lockedChoiceId !== null) return;

    // Cancel choices-ready timer (it's no longer needed).
    if (choicesReadyTimer.current) {
      clearTimeout(choicesReadyTimer.current);
      choicesReadyTimer.current = null;
    }

    // 1. Commit lock — chosen fills orange, unchosen dim.
    setLockedChoiceId(choiceId);

    // 2. Lock hold: visual settles before engine runs.
    await wait(GAME_DURATION.fast); // 120ms

    // 3. Apply engine. Snapshot prevStats before setGameState.
    const prevStats = { ...gameState.stats };
    const rng = stateRng(gameState);
    const { state: next, outcomeLabel, statDeltas } = applyChoice(
      gameState,
      currentEvent,
      choiceId,
      rng,
      pack
    );

    setGameState(next);
    setOutcome({ label: outcomeLabel, deltas: statDeltas });
    scheduleCheckpoint(session.runId, next);

    // 4. Seed HUD with prevStats so the bars don't jump before deltas reveal.
    setDisplayStats({ ...prevStats });
    setStatDisplay(null);
    continueFireRef.current = false;
    hudSequenceAbortRef.current = false;

    // 5. Well exit: brief hold so the lock visual is seen (--g-t-ack).
    //    The event area exits during this wait; then outcome mounts.
    await wait(GAME_DURATION.ack); // 80ms

    // 6. Switch to outcome.
    setScreen("outcome");
    setLockedChoiceId(null);

    // 7. Run the outcome sequence (HUD + auto-advance) without awaiting —
    //    this runs concurrently with the CSS delta animations.
    runOutcomeSequence(statDeltas, prevStats, next);
  }

  // ── Continue (shared by tap + auto-advance) ────────────────
  function doHandleContinue(state: GameState) {
    setOutcome(null);
    setDisplayStats(null);
    setStatDisplay(null);

    if (state.phase === "ending") {
      triggerEnding(state, session!.runId);
    } else {
      enterPlaying(state, session!.runId);
    }
  }

  function handleContinueClick() {
    if (!gameState || !session) return;
    if (continueFireRef.current) return;
    continueFireRef.current = true;
    hudSequenceAbortRef.current = true;

    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }

    // Snap HUD to final values so the bars reflect reality.
    snapAllHudStats(gameState.stats);

    doHandleContinue(gameState);
  }

  // ── Stage clear → next stage ───────────────────────────────
  function handleStageClear() {
    if (!gameState || !session) return;

    const next = advanceStage(gameState, pack);
    setGameState(next);

    if (next.phase === "ending") {
      triggerEnding(next, session.runId);
    } else {
      enterPlaying(next, session.runId);
    }
  }

  // ── Ending ─────────────────────────────────────────────────
  async function triggerEnding(state: GameState, runId: string) {
    const memberId = resolveEnding(state, pack);
    const finalState = {
      ...state,
      phase: "ending" as const,
      endingMemberId: memberId,
    };
    setGameState(finalState);
    setScreen("ending");

    const result = await completeRun(runId, finalState, memberId);
    if (result.success) {
      setShareUrl(result.shareUrl);
    }
  }

  // ── Restart ────────────────────────────────────────────────
  function handleRestart() {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (choicesReadyTimer.current) clearTimeout(choicesReadyTimer.current);
    continueFireRef.current = false;
    hudSequenceAbortRef.current = false;

    setScreen("title");
    setSession(null);
    setGameState(null);
    setCurrentEvent(null);
    setOutcome(null);
    setShareUrl(undefined);
    setEmailError("");
    setLockedChoiceId(null);
    setDisplayStats(null);
    setStatDisplay(null);
    setChoicesReady(false);
    setIsFirstEvent(false);
    setShaking(false);
  }

  // ── Render ─────────────────────────────────────────────────
  const endingMember = gameState?.endingMemberId
    ? pack.members.find((m) => m.id === gameState.endingMemberId) ?? null
    : null;

  const nextStageForClear = gameState
    ? pack.stages[gameState.stageIndex + 1]
    : undefined;

  return (
    <div className="game-root">
      <div
        className={`game-surface${shaking ? " game-shake" : ""}`}
        role="main"
        aria-label="שאזאמאט: החיים"
        data-screen={screen}
        data-mood={currentEvent?.mood ?? "neutral"}
        data-rarity={currentEvent?.rarity ?? "common"}
      >
        {/* Screens that don't show the game HUD */}
        {screen === "title" && <TitleScreen onStart={handleTitleStart} />}

        {screen === "email" && (
          <EmailGate
            onSubmit={handleEmailSubmit}
            error={emailError}
            loading={emailLoading}
          />
        )}

        {/* Screens that show HUD + sprite */}
        {(screen === "playing" ||
          screen === "outcome" ||
          screen === "stage-clear") &&
          gameState && (
            <>
              <Hud
                state={gameState}
                pack={pack}
                displayStats={displayStats}
                statDisplay={statDisplay}
              />
              <SpritePortrait
                loadout={gameState.sprite}
                catalog={pack.sprites}
                scene={currentEvent?.scene}
              />

              <div className="game-event-area">
                {screen === "playing" && currentEvent && (
                  <EventCard
                    event={currentEvent}
                    state={gameState}
                    onChoice={handleChoicePress}
                    choicesReady={choicesReady}
                    lockedChoiceId={lockedChoiceId}
                    isFirstEvent={isFirstEvent}
                  />
                )}

                {screen === "outcome" && outcome && (
                  <OutcomeDisplay
                    outcomeLabel={outcome.label}
                    statDeltas={outcome.deltas}
                    pack={pack}
                    onContinue={handleContinueClick}
                  />
                )}

                {screen === "stage-clear" && (
                  <StageClear
                    nextStage={nextStageForClear}
                    onContinue={handleStageClear}
                  />
                )}
              </div>
            </>
          )}

        {screen === "ending" && gameState && endingMember && (
          <>
            <Hud state={gameState} pack={pack} />
            <EndingScreen
              member={endingMember}
              state={gameState}
              pack={pack}
              shareUrl={shareUrl}
              onRestart={handleRestart}
            />
          </>
        )}
      </div>
    </div>
  );
}
