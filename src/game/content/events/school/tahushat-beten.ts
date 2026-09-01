import type { GameEvent } from "../../../schema/events";

export const tahushatBetenEvent: GameEvent = {
  id: "school-tahushat-beten",
  stage: "school",
  weight: 5,
  rarity: "common",
  oncePerRun: true,
  mood: "tense",
  scene: "school-stage",

  kicker: "גיל 17 — יום שישי בלילה",
  headline: "יש תוכנית. לא ברור למה.",
  body: "כולם בטוחים שזה יצא מעולה.",

  choices: [
    {
      id: "go",
      label: "יאללה",
      roll: [
        {
          weight: 3,
          label: "הלך מצוין. כנראה.",
          effects: [
            { type: "stat", id: "swag", delta: 10 },
            { type: "stat", id: "musicianship", delta: 5 },
            { type: "affinity", memberId: "gidon", delta: 3 },
            { type: "affinity", memberId: "nir", delta: 3 },
          ],
        },
        {
          weight: 2,
          label: "זה לא הלך כמו שתכננת. בכלל.",
          effects: [
            { type: "stat", id: "swag", delta: -8 },
            { type: "affinity", memberId: "shay", delta: 2 },
          ],
        },
      ],
    },
    {
      id: "bail",
      label: "אני עייף",
      effects: [
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 3 },
        { type: "affinity", memberId: "reef", delta: 3 },
      ],
    },
  ],
};
