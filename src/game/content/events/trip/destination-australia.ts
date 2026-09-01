import type { GameEvent } from "../../../schema/events";

export const destinationAustraliaEvent: GameEvent = {
  id: "trip-destination-australia",
  stage: "trip",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "epic",

  requires: { type: "flag", key: "travelDestination", value: "australia" },

  kicker: "גיל 22 — בונדי ביץ׳",
  headline: "זה גדול עלייך.",
  body: "הים. השמיים. האנשים. הכל. גדול עלייך.",

  choices: [
    {
      id: "absorb",
      label: "להישאר עם זה",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "affinity", memberId: "itay", delta: 6 },
      ],
    },
    {
      id: "call-mom",
      label: "להתקשר לאמא",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
        { type: "affinity", memberId: "itay", delta: 3 },
        { type: "affinity", memberId: "aviad", delta: 2 },
      ],
    },
  ],
};
