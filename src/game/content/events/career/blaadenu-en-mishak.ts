import type { GameEvent } from "../../../schema/events";

export const blaadenuEnMishakEvent: GameEvent = {
  id: "career-blaadenu-en-mishak",
  stage: "career",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "epic",

  kicker: "בלעדנו אין משחק",
  headline: "אנחנו מתחילים להקה. אתה בפנים?",
  body: "יש לך עבודה. יש לך שכירות. יש לך שש שניות להחליט.",

  choices: [
    {
      id: "quit-job",
      label: "לעזוב את העבודה",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "nimrod", delta: 5 },
        { type: "affinity", memberId: "shay", delta: 5 },
        { type: "affinity", memberId: "itay", delta: 5 },
        { type: "affinity", memberId: "reef", delta: 5 },
      ],
    },
    {
      id: "keep-both",
      label: "לשמור על שתיהן",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "aviad", delta: 8 },
      ],
    },
  ],
};
