import type { GameEvent } from "../../../schema/events";

export const toskanaEvent: GameEvent = {
  id: "shazamat-toskana",
  stage: "shazamat",
  weight: 5,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",

  requires: {
    type: "any",
    conditions: [
      { type: "flag", key: "romantic", value: true },
      { type: "affinity", memberId: "reef", min: 20 },
    ],
  },

  kicker: "טוסקנה",
  headline: "ריף מתחתן שוב. עם אותה אישה. הפעם באיטליה.",
  body: "זה המסיבה הכי יפה שהיית בה. גם השנייה הייתה יפה. גם הראשונה.",

  choices: [
    {
      id: "fly-out",
      label: "לטוס",
      effects: [
        { type: "stat", id: "swag", delta: 8 },
        { type: "affinity", memberId: "reef", delta: 7 },
      ],
    },
    {
      id: "cant-i-have-a-gig",
      label: "יש לי הופעה",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "nimrod", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 3 },
      ],
    },
  ],
};
