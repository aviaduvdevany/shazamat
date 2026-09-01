import type { GameEvent } from "../../../schema/events";

export const olaEvent: GameEvent = {
  id: "childhood-ola",
  stage: "childhood",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  kicker: "גיל 8 — הפסקה",
  headline: "מישהו בחצר צועק מילה שאף אחד לא הגדיר.",
  body: "כולם מסתכלים. הוא צועק שוב. זה נשמע כמו שם. זה לא שם.",

  choices: [
    {
      id: "yell-back",
      label: "לצעוק בחזרה",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "gidon", delta: 3 },
        { type: "affinity", memberId: "nir", delta: 3 },
      ],
    },
    {
      id: "ignore",
      label: "להתעלם",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 2 },
        { type: "affinity", memberId: "reef", delta: 2 },
      ],
    },
  ],
};
