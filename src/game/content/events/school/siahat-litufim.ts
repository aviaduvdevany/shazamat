import type { GameEvent } from "../../../schema/events";

export const siahatLitufimEvent: GameEvent = {
  id: "school-siahat-litufim",
  stage: "school",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "funny",

  requires: {
    type: "any",
    conditions: [
      { type: "affinity", memberId: "nir", min: 10 },
      { type: "affinity", memberId: "gidon", min: 10 },
    ],
  },

  kicker: "גיל 18 — שבוע לפני הגיוס",
  headline: "שיחה שאי אפשר להסביר אותה לאף אחד מבחוץ.",

  choices: [
    {
      id: "nod",
      label: "לאשר בראש",
      effects: [
        { type: "stat", id: "swag", delta: 8 },
        { type: "affinity", memberId: "nir", delta: 5 },
        { type: "affinity", memberId: "gidon", delta: 5 },
      ],
    },
    {
      id: "stare",
      label: "להביט",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "affinity", memberId: "nir", delta: 2 },
        { type: "affinity", memberId: "gidon", delta: 2 },
      ],
    },
  ],
};
