import type { GameEvent } from "../../../schema/events";

export const rakLitzokPayoffEvent: GameEvent = {
  id: "home-rak-litzok-payoff",
  stage: "home",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "tense",

  requires: { type: "flag", key: "protestSeed", value: true },

  kicker: "גיל 25 — הפגנה, תל אביב",
  headline: "מישהו הדליק פח.",
  body: "האש גבוהה. המשטרה בדרך. לידך עומד גדעון עם מבט שאומר הכל.",

  choices: [
    {
      id: "claim-it",
      label: "זה הייתי אני",
      effects: [
        { type: "stat", id: "swag", delta: 10 },
        { type: "affinity", memberId: "gidon", delta: 8 },
        { type: "setFlag", key: "gotArrested", value: true },
      ],
    },
    {
      id: "run",
      label: "לרוץ",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "nir", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 3 },
      ],
    },
    {
      id: "document",
      label: "לצלם מהצד",
      effects: [
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 5 },
      ],
    },
  ],
};
