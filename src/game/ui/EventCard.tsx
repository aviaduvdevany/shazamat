"use client";

import { useRef, type KeyboardEvent } from "react";
import type { GameEvent } from "../schema/events";
import type { GameState } from "../schema/state";
import { evaluateCondition } from "../engine/conditions";

interface Props {
  event: GameEvent;
  state: GameState;
  onChoice: (choiceId: string) => void;
  /** Prevents tapping choices during the enter stagger sequence. */
  choicesReady?: boolean;
  /** Non-null when a choice has been committed — drives lock visuals. */
  lockedChoiceId?: string | null;
  /** Adds the 200ms extra hold for the first event of the run. */
  isFirstEvent?: boolean;
  /**
   * UX-2: True when event.weight >= 10 or event.mood === "epic".
   * Applies the headline slam animation instead of fade-in.
   */
  isKeystone?: boolean;
}

export function EventCard({
  event,
  state,
  onChoice,
  choicesReady = true,
  lockedChoiceId = null,
  isFirstEvent = false,
  isKeystone = false,
}: Props) {
  const visibleChoices = event.choices.filter(
    (c) => !c.requires || evaluateCondition(c.requires, state)
  );

  const isLocked = lockedChoiceId !== null;
  const groupRef = useRef<HTMLDivElement>(null);

  // UX-7: Arrow-key roving tabIndex within the choice group.
  function handleGroupKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!choicesReady || isLocked) return;

    const isUp   = e.key === "ArrowUp"   || e.key === "ArrowLeft";
    const isDown = e.key === "ArrowDown" || e.key === "ArrowRight";
    if (!isUp && !isDown) return;

    e.preventDefault();
    const buttons = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>(".game-choice-btn") ?? []
    );
    if (buttons.length === 0) return;

    const focused = document.activeElement as HTMLElement;
    const currentIdx = buttons.indexOf(focused as HTMLButtonElement);
    const next = isDown
      ? (currentIdx + 1) % buttons.length
      : (currentIdx - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  return (
    <>
      <div className={`game-event-text${isFirstEvent ? " game-event-first" : ""}`}>
        <div className="game-event-kicker">{event.kicker}</div>
        <div className={`game-event-headline${isKeystone ? " is-slam" : ""}`}>
          {event.headline}
        </div>
        {event.body && <p className="game-event-body">{event.body}</p>}
      </div>

      <div
        className="game-choices"
        role="group"
        aria-label="בחירות"
        ref={groupRef}
        onKeyDown={handleGroupKeyDown}
      >
        {visibleChoices.map((choice, i) => {
          const isChosen = lockedChoiceId === choice.id;
          const isUnchosen = isLocked && !isChosen;
          const hasRoll = (choice.roll?.length ?? 0) > 0;
          return (
            <button
              key={choice.id}
              className={[
                "game-choice-btn",
                isChosen  ? "is-chosen"  : "",
                isUnchosen ? "is-unchosen" : "",
                hasRoll   ? "has-roll"   : "",
              ].filter(Boolean).join(" ")}
              style={{ "--choice-i": i } as React.CSSProperties}
              onClick={() => {
                if (!choicesReady || isLocked) return;
                onChoice(choice.id);
              }}
              aria-disabled={!choicesReady || isLocked}
            >
              {choice.label}
              {hasRoll && (
                <span className="game-roll-badge" aria-label="סיכון">🎲</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
