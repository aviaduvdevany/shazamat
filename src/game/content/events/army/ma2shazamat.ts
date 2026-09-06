import type { GameEvent } from "../../../schema/events";

export const ma2shazamat: GameEvent = {
  id: "army-ma2shazamat",
  stage: "army",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  requires: {
    type: "not",
    condition: { type: "flag", key: "seenMaIm" },
  },

  kicker: "2מה2שאזאמאט",
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
      label: "מה, מה, מה, מה?",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "stat", id: "swag", delta: 3 },
        { type: "setFlag", key: "seenMaIm", value: true },
      ],
    },
  ],
};
