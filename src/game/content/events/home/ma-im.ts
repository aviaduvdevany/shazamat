import type { GameEvent } from "../../../schema/events";

export const maIm: GameEvent = {
  id: "home-ma-im",
  stage: "home",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  requires: {
    type: "not",
    condition: { type: "flag", key: "seenMaIm" },
  },

  kicker: "גיל 24 — סטודיו",
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
      label: "מה עם שאזאמאט?",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "stat", id: "swag", delta: 3 },
        { type: "setFlag", key: "seenMaIm", value: true },
      ],
    },
  ],
};
