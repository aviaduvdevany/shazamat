import type { GameEvent } from "../../../schema/events";

export const mayimAmukimEvent: GameEvent = {
  id: "trip-mayim-amukim",
  stage: "trip",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "tense",

  requires: { type: "flag", key: "travelDestination" },

  kicker: "גיל 22 — איפשהו בחו\"ל",
  headline: "בחור שנראה לגמרי אמין מציע לך משהו.",
  body: "הוא אומר שזה ״החומר הטוב״. הוא נראה כמו מישהו שמוכר ציוד גנוב בשוק. יש לו עיניים ידידותיות.",

  choices: [
    {
      id: "yes",
      label: "בסדר",
      roll: [
        {
          weight: 1,
          label: "התגלית המוזיקלית הכי גדולה בחייך.",
          effects: [
            { type: "stat", id: "musicianship", delta: 15 },
            { type: "affinity", memberId: "shay", delta: 3 },
            { type: "setFlag", key: "tookDrug", value: true },
          ],
        },
        {
          weight: 1,
          label: "ראית מספיק מהעולם. הזמנת כרטיס הביתה.",
          effects: [
            { type: "stat", id: "swag", delta: -10 },
            { type: "setFlag", key: "tookDrug", value: true },
            { type: "advanceStage" },
          ],
        },
      ],
    },
    {
      id: "no",
      label: "יש לי הורים שאוהבים אותי",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
        { type: "affinity", memberId: "aviad", delta: 3 },
      ],
    },
  ],
};
