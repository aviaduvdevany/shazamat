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
import { pack } from "../content/pack";
import { startRun, checkpointRun, completeRun } from "@/lib/game/actions";
import { TitleScreen } from "./TitleScreen";
import { EmailGate } from "./EmailGate";
import { Hud } from "./Hud";
import { SpritePortrait } from "./SpritePortrait";
import { EventCard } from "./EventCard";
import { OutcomeDisplay } from "./OutcomeDisplay";
import { StageClear } from "./StageClear";
import { EndingScreen } from "./EndingScreen";

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

  // Debounced checkpoint ref
  const checkpointTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleCheckpoint(runId: string, state: GameState) {
    if (checkpointTimer.current) clearTimeout(checkpointTimer.current);
    checkpointTimer.current = setTimeout(() => {
      checkpointRun(runId, state);
    }, 3000);
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

  // ── Core: enter playing mode (pick next event or advance) ──
  function enterPlaying(state: GameState, runId: string) {
    const rng = stateRng(state);
    const next = selectNextEvent(state, pack, rng);

    if (next.type === "event") {
      setCurrentEvent(next.event);
      setScreen("playing");
    } else if (next.type === "stage-clear") {
      setScreen("stage-clear");
    } else {
      // ending
      triggerEnding(state, runId);
    }
  }

  // ── Choice picked ──────────────────────────────────────────
  function handleChoice(choiceId: string) {
    if (!gameState || !currentEvent || !session) return;

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
    setScreen("outcome");
  }

  // ── Outcome → continue ─────────────────────────────────────
  function handleContinue() {
    if (!gameState || !session) return;
    setOutcome(null);

    if (gameState.phase === "ending") {
      triggerEnding(gameState, session.runId);
    } else {
      enterPlaying(gameState, session.runId);
    }
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
    const finalState = { ...state, phase: "ending" as const, endingMemberId: memberId };
    setGameState(finalState);
    setScreen("ending");

    const result = await completeRun(runId, finalState, memberId);
    if (result.success) {
      setShareUrl(result.shareUrl);
    }
  }

  // ── Restart ────────────────────────────────────────────────
  function handleRestart() {
    setScreen("title");
    setSession(null);
    setGameState(null);
    setCurrentEvent(null);
    setOutcome(null);
    setShareUrl(undefined);
    setEmailError("");
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
      <div className="game-surface" role="main" aria-label="שאזאמאט: החיים">
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
        {(screen === "playing" || screen === "outcome" || screen === "stage-clear") &&
          gameState && (
            <>
              <Hud state={gameState} pack={pack} />
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
                    onChoice={handleChoice}
                  />
                )}

                {screen === "outcome" && outcome && (
                  <OutcomeDisplay
                    outcomeLabel={outcome.label}
                    statDeltas={outcome.deltas}
                    pack={pack}
                    onContinue={handleContinue}
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
