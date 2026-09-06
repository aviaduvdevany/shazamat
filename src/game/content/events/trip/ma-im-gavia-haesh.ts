import type { GameEvent } from "../../../schema/events";

export const maImGaviaHaesh: GameEvent = {
  id: "trip-ma-im-gavia-haesh",
  stage: "trip",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "funny",

  requires: {
    type: "all",
    conditions: [
      { type: "not", condition: { type: "flag", key: "seenMaIm" } },
      {
        type: "not",
        condition: { type: "flag", key: "travelDestination", value: "india" },
      },
      { type: "flag", key: "travelDestination" },
    ],
  },

  kicker: "גביע האש",
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
