import type { GameEvent } from "../../../schema/events";

export const pesekZmanEvent: GameEvent = {
  id: "army-pesek-zman",
  stage: "army",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  kicker: "גיל 19 — חופשת שישי",
  headline: "יש לך שתים עשרה שעות.",
  body: "אתה בבית. כולם ישנים. הבית שקט.",

  choices: [
    {
      id: "basketball",
      label: "כדורסל / NBA בטלוויזיה",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "aviad", delta: 4 },
        { type: "affinity", memberId: "nir", delta: 3 },
      ],
    },
    {
      id: "football",
      label: "כדורגל — לשחק שוער",
      effects: [
        { type: "stat", id: "swag", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 4 },
      ],
    },
    {
      id: "sleep",
      label: "לישון עוד ארבע שעות",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
        { type: "affinity", memberId: "itay", delta: 5 },
      ],
    },
    {
      id: "laptop",
      label: "לפתוח לפטופ ולעשות מוזיקה",
      effects: [
        { type: "stat", id: "musicianship", delta: 7 },
        { type: "affinity", memberId: "shay", delta: 5 },
      ],
    },
  ],
};
