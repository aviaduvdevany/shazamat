import type { GameEvent } from "../../../schema/events";

export const maImShavatHamelech: GameEvent = {
  id: "school-ma-im-shavat-hamelech",
  stage: "school",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  requires: {
    type: "not",
    condition: { type: "flag", key: "seenMaIm" },
  },

  kicker: "גיל 17 — שיעור היסטוריה",
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
      label: "שבעת המלך",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "stat", id: "swag", delta: 3 },
        { type: "setFlag", key: "seenMaIm", value: true },
      ],
    },
  ],
};
