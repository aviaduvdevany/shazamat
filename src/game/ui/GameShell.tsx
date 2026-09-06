"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { GAME_SEQUENCE, GAME_MOOD, GAME_RARITY, useGameMotion } from "./useGameMotion";
import type { GameMood } from "./useGameMotion";
import { RollTicker } from "./RollTicker";
import { playSfx } from "../audio/index";
import { haptic, HAP_TAP, HAP_GAIN, HAP_LOSS } from "./haptics";
import { spawnFlyingNumber, abortFlyingNumbers } from "./flyingNumbers";

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
  // UX-2: useGameMotion for the roll ticker (skip-able wait + reduced-motion).
  const rollMotion = useGameMotion();
  // UX-3: useGameMotion for the stage-clear ceremony.
  const clearMotion = useGameMotion();
  // UX-4: useGameMotion for the birth funnel (title exit + assemble floor + smash).
  const birthMotion = useGameMotion();

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

  // ── UX-4: Birth funnel state ──────────────────────────────
  /** True for 200ms while title slides out and email slides in. */
  const [titleExiting, setTitleExiting] = useState(false);
  /** True while the assemble theater + startRun are running. */
  const [isAssembling, setIsAssembling] = useState(false);
  /** Which assemble lines are visible (0 = none, 3 = all). */
  const [assemblePhase, setAssemblePhase] = useState<0 | 1 | 2 | 3>(0);
  /** True when all lines are visible and server is still pending. */
  const [assembleTicking, setAssembleTicking] = useState(false);
  /** True for 80ms during the smash-cut black overlay. */
  const [showSmash, setShowSmash] = useState(false);

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

  // UX-2: mood / risk / rarity state ──────────────────────
  /** Current beat phase for data-beat attribute on .game-surface. */
  const [beat, setBeat] = useState<string>("");
  /** True while the roll ticker animation is playing. */
  const [isRolling, setIsRolling] = useState(false);
  /** True for 180ms when an ultra-rarity card enters (whisper shake). */
  const [whisperShaking, setWhisperShaking] = useState(false);

  // ── UX-6: Replay hook state ───────────────────────────────
  /** True for 200ms while the ending fades out toward title. */
  const [endingExiting, setEndingExiting] = useState(false);
  /** Email stored in localStorage from the previous run (same device). */
  const [storedEmail, setStoredEmail] = useState<string>("");
  /** True when localStorage shows a prior run on this device. */
  const [isReturning, setIsReturning] = useState(false);

  // ── UX-3: Stage-clear ceremony state ─────────────────────
  /** Nonce that increments when the ceremony slam fires, pulsing HUD age. */
  const [agePulseNonce, setAgePulseNonce] = useState(0);
  /** Prevents double-fire of handleStageClear (skip tap + auto). */
  const stageClearFireRef = useRef(false);
  /** Raw setTimeout ids for the assemble phase stagger (not birthMotion.wait). */
  const assembleTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const checkpointTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const choicesReadyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Prevents double-firing handleContinue (auto-advance + Continue tap). */
  const continueFireRef = useRef(false);
  /** Signals the HUD reveal sub-sequence to bail early. */
  const hudSequenceAbortRef = useRef(false);

  // ── UX-6: Read returning-player flag from localStorage ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shazamat-life-email") ?? "";
      if (saved) {
        setStoredEmail(saved);
        setIsReturning(true);
      }
    } catch {
      // localStorage may be blocked in some browsers/contexts
    }
  }, []);

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
  async function handleTitleStart() {
    birthMotion.resetSkip();
    setTitleExiting(true);
    setScreen("email");
    // 200ms overlap: title exits up, email rises from below.
    await birthMotion.wait(GAME_DURATION.base);
    setTitleExiting(false);
  }

  // ── Email → Playing ────────────────────────────────────────
  const handleEmailSubmit = useCallback(async (email: string) => {
    setEmailError("");
    birthMotion.resetSkip();

    // ── Start assemble theater ──────────────────────────────
    setIsAssembling(true);
    setAssemblePhase(reduced ? 3 : 0); // under reduced motion: show all lines immediately

    // Phase stagger uses raw setTimeout (concurrent with the floor wait; not
    // birthMotion.wait so skip() doesn't cancel these individually).
    if (!reduced) {
      assembleTimersRef.current.forEach(clearTimeout);
      assembleTimersRef.current = [
        setTimeout(() => setAssemblePhase(1), GAME_SEQUENCE.emailLine1),
        setTimeout(() => setAssemblePhase(2), GAME_SEQUENCE.emailLine2),
        setTimeout(
          () => {
            setAssemblePhase(3);
            setAssembleTicking(true);
          },
          GAME_SEQUENCE.emailLine3
        ),
      ];
    }

    // ── Wait for floor + server in parallel ─────────────────
    const [, result] = await Promise.all([
      birthMotion.wait(GAME_SEQUENCE.emailAssemble), // 900ms min theater
      startRun({ email, consent: true }),
    ]);

    // Clean up any phase timers that haven't fired yet.
    assembleTimersRef.current.forEach(clearTimeout);
    assembleTimersRef.current = [];
    setAssembleTicking(false);

    if (!result.success) {
      // Abort assemble and surface the form + error.
      setIsAssembling(false);
      setAssemblePhase(0);
      setEmailError(result.error);
      return;
    }

    // ── Persist for returning-player soften (UX-6) ──────────
    try {
      localStorage.setItem("shazamat-life-email", email);
      setStoredEmail(email);
      setIsReturning(true);
    } catch {
      // localStorage may be blocked; non-critical
    }

    // ── Smash cut → playing ──────────────────────────────────
    birthMotion.resetSkip(); // ensure skip flag is clear for the smash wait
    if (!reduced) {
      setShowSmash(true);
      await birthMotion.wait(GAME_SEQUENCE.emailSmash);
      setShowSmash(false);
    }

    setIsAssembling(false);
    setAssemblePhase(0);

    const { runId, seed } = result;
    setSession({ runId, seed });
    const state = createRun({ runId, seed, contentVersion: pack.version }, pack);
    setGameState(state);
    enterPlaying(state, runId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, birthMotion.wait, birthMotion.resetSkip]);

  // ── Core: enter playing mode ───────────────────────────────
  function enterPlaying(state: GameState, runId: string) {
    const rng = stateRng(state);
    const next = selectNextEvent(state, pack, rng);

    if (next.type === "event") {
      setCurrentEvent(next.event);
      setScreen("playing");
      setBeat("enter");

      // Reset outcome + HUD state
      setLockedChoiceId(null);
      setIsRolling(false);
      setDisplayStats(null);
      setStatDisplay(null);
      continueFireRef.current = false;
      hudSequenceAbortRef.current = false;

      const isFirst = state.log.length === 0;
      setIsFirstEvent(isFirst);

      // UX-2: Ultra rarity whisper shake on enter.
      if (next.event.rarity === "ultra" && !reduced) {
        setWhisperShaking(true);
        setTimeout(() => setWhisperShaking(false), 220);
      }

      // UX-7: Rare/ultra enter whisper SFX.
      if (next.event.rarity === "rare" || next.event.rarity === "ultra") {
        playSfx("rare-enter", reduced);
      }

      // Enable choices immediately under reduced motion; otherwise schedule
      // after the stagger animation + mood choiceHold + rarity extra.
      if (reduced) {
        setChoicesReady(true);
      } else {
        setChoicesReady(false);
        if (choicesReadyTimer.current) clearTimeout(choicesReadyTimer.current);

        const visibleCount = next.event.choices.filter(
          (c) => !c.requires || evaluateCondition(c.requires, state)
        ).length;
        const mood = next.event.mood ?? "neutral";
        const moodConfig = GAME_MOOD[mood as GameMood] ?? GAME_MOOD.neutral;
        const rarityConfig = GAME_RARITY[next.event.rarity ?? "common"] ?? GAME_RARITY.common;
        const scaledChoicesStart = Math.round(GAME_SEQUENCE.choicesStart * moodConfig.enterScale);
        const scaledStride = Math.round(GAME_SEQUENCE.choiceStride * moodConfig.enterScale);
        const firstEventExtra = isFirst ? GAME_SEQUENCE.firstEventExtra : 0;

        // Last choice enters at: scaledChoicesStart + firstEventExtra + (n-1)*scaledStride
        // Add choice animation duration (--g-t-base = 200ms) + 40ms guard
        // + mood choiceHold + rarity extraHoldMs
        const enableMs =
          scaledChoicesStart +
          firstEventExtra +
          (visibleCount - 1) * scaledStride +
          GAME_DURATION.base +
          40 +
          moodConfig.choiceHold +
          rarityConfig.extraHoldMs;

        choicesReadyTimer.current = setTimeout(() => {
          setChoicesReady(true);
        }, enableMs);
      }
    } else if (next.type === "stage-clear") {
      setBeat("");
      runStageClearCeremony(state, runId);
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

    // SFX + haptic + flying number on same frame as delta reveal.
    playSfx(isLoss ? "stat-down" : "stat-up", reduced);
    haptic(isLoss ? HAP_LOSS : HAP_GAIN, reduced);

    // Spawn flying number from the delta chip toward the HUD stat.
    const statDef = pack.stats.find((s) => s.id === id);
    spawnFlyingNumber(
      id,
      delta.delta,
      statDef?.emoji ?? "",
      reduced,
      currentEvent?.mood ?? "neutral",
    );

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
      // UX-2: sad cards never shake — grief is slow and quiet.
      const isSad = currentEvent?.mood === "sad";
      if (!reduced && !isSad && delta.delta <= -8) {
        setShaking(true);
        setTimeout(() => setShaking(false), 340);
      }
    }
  }

  /** Snap all HUD stats to their final values immediately (for skip / auto-advance). */
  function snapAllHudStats(nextStats: Record<string, number>) {
    abortFlyingNumbers();
    setDisplayStats({ ...nextStats });
    setStatDisplay(null);
  }

  // ── Outcome sequence (HUD sync + auto-advance) ─────────────
  async function runOutcomeSequence(
    statDeltas: Array<{ id: string; delta: number }>,
    prevStats: Record<string, number>,
    nextState: GameState,
    mood: GameMood = "neutral"
  ) {
    if (continueFireRef.current) return;
    hudSequenceAbortRef.current = false;

    // UX-2: mood-scaled delta stride and label extra delay.
    const moodConfig = GAME_MOOD[mood] ?? GAME_MOOD.neutral;
    const deltaStride = moodConfig.deltaStride;
    const outcomeLabelExtra = moodConfig.outcomeLabelExtra;

    const hasFlavor = statDeltas.length === 0;
    const autoMs = reduced
      ? GAME_SEQUENCE.autoAdvanceReduced
      : hasFlavor
      ? GAME_SEQUENCE.autoAdvanceFlavor + outcomeLabelExtra
      : GAME_SEQUENCE.autoAdvance + outcomeLabelExtra;

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
      // Wait for the first delta time offset: 240ms + outcomeLabelExtra.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, GAME_SEQUENCE.firstDeltaIn + outcomeLabelExtra)
      );

      for (let i = 0; i < statDeltas.length; i++) {
        if (continueFireRef.current || hudSequenceAbortRef.current) return;
        if (i > 0) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, deltaStride)
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
    playSfx("choice-select", reduced);
    haptic(HAP_TAP, reduced);
    setLockedChoiceId(choiceId);
    setBeat("lock");

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

    // 5. UX-2: Roll ticker — plays for the committed choice if it has a roll.
    //    Engine already resolved the outcome; the ticker is pure theater.
    //    The player can tap the ticker to skip to the outcome immediately.
    const committedChoice = currentEvent.choices.find((c) => c.id === choiceId);
    const isRollChoice = (committedChoice?.roll?.length ?? 0) > 0;
    const currentMood = (currentEvent.mood ?? "neutral") as GameMood;

    if (isRollChoice) {
      const moodConfig = GAME_MOOD[currentMood] ?? GAME_MOOD.neutral;
      setIsRolling(true);
      setBeat("roll");
      rollMotion.resetSkip();
      await rollMotion.wait(moodConfig.rollMs);
      setIsRolling(false);
    }

    // 6. Well exit: brief hold so the lock visual is seen (--g-t-ack).
    await wait(GAME_DURATION.ack); // 80ms

    // 7. Switch to outcome.
    setScreen("outcome");
    setLockedChoiceId(null);
    setBeat("deltas");

    // 8. Run the outcome sequence (HUD + auto-advance) without awaiting —
    //    this runs concurrently with the CSS delta animations.
    runOutcomeSequence(statDeltas, prevStats, next, currentMood);
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

  // ── Stage clear ceremony (UX-3) ───────────────────────────
  /**
   * Full-surface ceremony sequence. Called from enterPlaying when the engine
   * returns stage-clear. Uses clearMotion (skip-able) for timed beats.
   *
   * Timeline (from ux-plan timing bible):
   *   t=0    dim viewport (CSS via data-screen="stage-clear")
   *   t=120  kicker: סוף · [currentStage]
   *   t=400  200ms breath (black hold between kicker and slam)
   *   t=600  slam next stage name
   *         → advanceStage(), setGameState, agePulseNonce++
   *   t=780  age range fade
   *   t=1600 auto-advance into next event (600ms under reduced)
   *
   * The player can tap anywhere on the overlay (or press the skip button) to
   * fast-forward; skip also fires on a double-tap guard from the auto timer.
   */
  async function runStageClearCeremony(state: GameState, runId: string) {
    stageClearFireRef.current = false;
    clearMotion.resetSkip();

    setScreen("stage-clear");
    setBeat("dim");

    // Allow instant paint before beginning timed beats.
    await clearMotion.wait(0);

    // t=120 — kicker appears
    await clearMotion.wait(GAME_SEQUENCE.stageClearKicker);
    if (clearMotion.isSkipped()) { return doStageClearFinish(state, runId); }
    setBeat("kicker");

    // t=400 — breath (200ms hold after kicker, then silence until slam)
    await clearMotion.wait(GAME_SEQUENCE.stageClearBreath - GAME_SEQUENCE.stageClearKicker);
    if (clearMotion.isSkipped()) { return doStageClearFinish(state, runId); }
    setBeat("breath");

    // t=600 — slam next stage name
    await clearMotion.wait(GAME_SEQUENCE.stageClearSlam - GAME_SEQUENCE.stageClearBreath);
    if (clearMotion.isSkipped()) { return doStageClearFinish(state, runId); }

    // Advance engine at slam — this updates the HUD age label.
    const advancedState = advanceStage(state, pack);
    setGameState(advancedState);
    setAgePulseNonce((n) => n + 1);
    playSfx("stage-clear", reduced);
    setBeat("slam");

    // t=780 — age label / rumble
    await clearMotion.wait(GAME_SEQUENCE.stageClearAge - GAME_SEQUENCE.stageClearSlam);
    if (clearMotion.isSkipped()) { return doStageClearFinish(advancedState, runId, true); }
    setBeat("age");

    // t=1600 — auto-advance
    const autoWait = reduced
      ? GAME_SEQUENCE.autoAdvanceReduced
      : GAME_SEQUENCE.stageClearAuto - GAME_SEQUENCE.stageClearAge;
    await clearMotion.wait(autoWait);

    if (!stageClearFireRef.current) {
      stageClearFireRef.current = true;
      doStageClearFinish(advancedState, runId, true);
    }
  }

  /**
   * Completes the stage-clear: advance stage (if not already done) then enter
   * the next event. Safe to call from skip tap or auto timer.
   */
  function doStageClearFinish(state: GameState, runId: string, alreadyAdvanced = false) {
    const nextState = alreadyAdvanced ? state : advanceStage(state, pack);
    if (!alreadyAdvanced) {
      setGameState(nextState);
      setAgePulseNonce((n) => n + 1);
    }
    if (nextState.phase === "ending") {
      triggerEnding(nextState, runId);
    } else {
      enterPlaying(nextState, runId);
    }
  }

  /** Called when the player taps the overlay or the skip button. */
  function handleStageClearSkip() {
    if (stageClearFireRef.current || !gameState || !session) return;
    stageClearFireRef.current = true;
    clearMotion.skip();
    // doStageClearFinish is called in runStageClearCeremony after skip resolves,
    // but skip() resolves the current wait immediately → handled there.
    // We also call it here as a safety fallback in case the async chain
    // has already exited early from a previous skip guard.
    doStageClearFinish(gameState, session.runId);
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
  async function handleRestart() {
    // UX-6: Fade ending screen out over 200ms before resetting state.
    birthMotion.resetSkip();
    setEndingExiting(true);
    await birthMotion.wait(GAME_DURATION.base);
    setEndingExiting(false);

    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (choicesReadyTimer.current) clearTimeout(choicesReadyTimer.current);
    rollMotion.skip();
    clearMotion.skip();
    assembleTimersRef.current.forEach(clearTimeout);
    assembleTimersRef.current = [];
    continueFireRef.current = false;
    hudSequenceAbortRef.current = false;
    stageClearFireRef.current = false;

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
    setBeat("");
    setIsRolling(false);
    setWhisperShaking(false);
    // UX-4 birth state
    setTitleExiting(false);
    setIsAssembling(false);
    setAssemblePhase(0);
    setAssembleTicking(false);
    setShowSmash(false);
  }

  // ── Render ─────────────────────────────────────────────────
  const endingMember = gameState?.endingMemberId
    ? pack.members.find((m) => m.id === gameState.endingMemberId) ?? null
    : null;

  const nextStageForClear = gameState
    ? pack.stages[gameState.stageIndex + 1]
    : undefined;

  // UX-3: The current stage (for "סוף · ילדות" kicker) is the one we're leaving.
  // During the ceremony stageIndex is still on the completed stage until slam fires;
  // after slam advanceStage bumps it, so we use stageIndex directly.
  const currentStageForClear = gameState
    ? pack.stages[gameState.stageIndex]
    : undefined;

  // UX-2: keystone events get a headline slam.
  const isKeystone =
    (currentEvent?.weight ?? 0) >= 10 || currentEvent?.mood === "epic";

  // UX-2: surface class list (shake + whisper shake never overlap in practice).
  const surfaceClass = [
    "game-surface",
    shaking        ? "game-shake"         : "",
    whisperShaking ? "game-shake-whisper" : "",
  ].filter(Boolean).join(" ");

  // ── UX-7: Global Space key to skip ceremonies ───────────
  function handleSurfaceKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== " ") return;
    // Don't intercept Space when focus is in a form field.
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    // Don't intercept if Space is naturally activating a button/link (browser default).
    if (tag === "BUTTON" || tag === "A") return;

    e.preventDefault();
    if (screen === "playing" && isRolling) {
      rollMotion.skip();
    } else if (screen === "stage-clear") {
      handleStageClearSkip();
    } else if (screen === "outcome") {
      handleContinueClick();
    }
    // Ending screen Space skip is handled inside EndingScreen via its own onClick.
  }

  return (
    <div className="game-root">
      <div
        className={surfaceClass}
        role="main"
        aria-label="שאזאמאט: החיים"
        data-screen={screen}
        data-mood={currentEvent?.mood ?? "neutral"}
        data-rarity={currentEvent?.rarity ?? "common"}
        data-beat={beat}
        onKeyDown={handleSurfaceKeyDown}
      >
        {/* UX-4: Birth funnel — title + email share .game-funnel during the
              200ms overlap so title can exit up while email rises from below. */}
        {(screen === "title" || screen === "email") && (
          <div className="game-funnel">
            {(screen === "title" || titleExiting) && (
              <TitleScreen onStart={handleTitleStart} exiting={titleExiting} />
            )}
            {screen === "email" && (
              <EmailGate
                onSubmit={handleEmailSubmit}
                error={emailError}
                assembling={isAssembling}
                assemblePhase={assemblePhase}
                assembleTicking={assembleTicking}
                returning={isReturning}
                defaultEmail={storedEmail}
              />
            )}
          </div>
        )}

        {/* UX-4: Smash-cut black overlay (80ms before enterPlaying). */}
        {showSmash && <div className="game-smash-overlay" aria-hidden="true" />}

        {/* HUD: shown during gameplay screens and fades out during ending (CSS handles fade). */}
        {(screen === "playing" ||
          screen === "outcome" ||
          screen === "stage-clear" ||
          screen === "ending") &&
          gameState && (
            <Hud
              state={gameState}
              pack={pack}
              displayStats={screen !== "ending" ? displayStats : null}
              statDisplay={screen !== "ending" ? statDisplay : null}
              agePulseNonce={agePulseNonce}
            />
          )}

        {/* Sprite viewport: gameplay screens only. */}
        {(screen === "playing" ||
          screen === "outcome" ||
          screen === "stage-clear") &&
          gameState && (
            <>
              <SpritePortrait
                loadout={gameState.sprite}
                catalog={pack.sprites}
                scene={currentEvent?.scene}
              />

              {/* UX-3: Stage-clear ceremony overlay (full-surface, above viewport). */}
              {screen === "stage-clear" && (
                <StageClear
                  currentStage={currentStageForClear}
                  nextStage={nextStageForClear}
                  beat={beat}
                  onSkip={handleStageClearSkip}
                />
              )}

              <div className="game-event-area">
                {screen === "playing" && currentEvent && (
                  isRolling ? (
                    <RollTicker
                      mood={(currentEvent.mood ?? "neutral") as GameMood}
                      onSkip={rollMotion.skip}
                    />
                  ) : (
                    <EventCard
                      event={currentEvent}
                      state={gameState}
                      onChoice={handleChoicePress}
                      choicesReady={choicesReady}
                      lockedChoiceId={lockedChoiceId}
                      isFirstEvent={isFirstEvent}
                      isKeystone={isKeystone}
                    />
                  )
                )}

                {screen === "outcome" && outcome && (
                  <OutcomeDisplay
                    outcomeLabel={outcome.label}
                    statDeltas={outcome.deltas}
                    pack={pack}
                    onContinue={handleContinueClick}
                  />
                )}
              </div>
            </>
          )}

        {/* UX-5: Ending show — full-surface beat ceremony. */}
        {screen === "ending" && gameState && endingMember && (
          <EndingScreen
            member={endingMember}
            state={gameState}
            pack={pack}
            shareUrl={shareUrl}
            onRestart={handleRestart}
            exiting={endingExiting}
          />
        )}
      </div>
    </div>
  );
}
