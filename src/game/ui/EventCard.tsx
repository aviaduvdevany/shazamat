"use client";

import type { GameEvent } from "../schema/events";
import type { GameState } from "../schema/state";
import { evaluateCondition } from "../engine/conditions";

interface Props {
  event: GameEvent;
  state: GameState;
  onChoice: (choiceId: string) => void;
  disabled?: boolean;
}

export function EventCard({ event, state, onChoice, disabled }: Props) {
  const visibleChoices = event.choices.filter(
    (c) => !c.requires || evaluateCondition(c.requires, state)
  );

  return (
    <>
      <div className="game-event-text">
        <div className="game-event-kicker">{event.kicker}</div>
        <div className="game-event-headline">{event.headline}</div>
        {event.body && (
          <p className="game-event-body">{event.body}</p>
        )}
      </div>

      <div className="game-choices" role="group" aria-label="בחירות">
        {visibleChoices.map((choice) => (
          <button
            key={choice.id}
            className="game-choice-btn"
            onClick={() => !disabled && onChoice(choice.id)}
            disabled={disabled}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </>
  );
}
