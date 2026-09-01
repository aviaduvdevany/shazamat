import type { GameEvent } from "../../../schema/events";

export const hagashemLoYavo: GameEvent = {
  id: "shazamat-hagashem-lo-yavo",
  stage: "shazamat",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "funny",

  requires: {
    type: "not",
    condition: { type: "flag", key: "seenMaIm" },
  },

  kicker: "ההווה — אחרי הופעה",
  headline: "מה עם שאזאמאט?",
  body: "אין תשובה טובה לשאלה הזו.",

  choices: [
    {
      id: "shrug",
      label: "לא יודע",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "setFlag", key: "seenMaIm", value: true },
      ],
    },
    {
      id: "answer",
      label: "הגשם לא יבוא",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "stat", id: "swag", delta: 3 },
        { type: "setFlag", key: "seenMaIm", value: true },
      ],
    },
  ],
};
