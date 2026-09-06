"use client";

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
}

export function EventCard({
  event,
  state,
  onChoice,
  choicesReady = true,
  lockedChoiceId = null,
  isFirstEvent = false,
}: Props) {
  const visibleChoices = event.choices.filter(
    (c) => !c.requires || evaluateCondition(c.requires, state)
  );

  const isLocked = lockedChoiceId !== null;

  return (
    <>
      <div className={`game-event-text${isFirstEvent ? " game-event-first" : ""}`}>
        <div className="game-event-kicker">{event.kicker}</div>
        <div className="game-event-headline">{event.headline}</div>
        {event.body && <p className="game-event-body">{event.body}</p>}
      </div>

      <div className="game-choices" role="group" aria-label="בחירות">
        {visibleChoices.map((choice, i) => {
          const isChosen = lockedChoiceId === choice.id;
          const isUnchosen = isLocked && !isChosen;
          return (
            <button
              key={choice.id}
              className={`game-choice-btn${isChosen ? " is-chosen" : ""}${isUnchosen ? " is-unchosen" : ""}`}
              style={{ "--choice-i": i } as React.CSSProperties}
              onClick={() => {
                if (!choicesReady || isLocked) return;
                onChoice(choice.id);
              }}
              aria-disabled={!choicesReady || isLocked}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
