import type { GameEvent } from "../../../schema/events";

export const miYacholAlayEvent: GameEvent = {
  id: "trip-mi-yachol-alay",
  stage: "trip",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "tense",

  requires: { type: "flag", key: "travelDestination" },

  kicker: "מי יכול עלי",
  headline: "מישהו שנראה לא נחמד מסתכל עלייך.",
  body: "אתה רגוע לחלוטין. הוא ממשיך להסתכל.",

  choices: [
    {
      id: "stare-back",
      label: "להחזיר מבט",
      effects: [
        { type: "stat", id: "swag", delta: 10 },
        { type: "affinity", memberId: "nir", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 3 },
      ],
    },
    {
      id: "leave",
      label: "ללכת",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 3 },
      ],
    },
  ],
};
