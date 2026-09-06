import type { GameEvent } from "../../../schema/events";

export const destinationEastAsiaEvent: GameEvent = {
  id: "trip-destination-east-asia",
  stage: "trip",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "neutral",

  requires: { type: "flag", key: "travelDestination", value: "east-asia" },

  kicker: "תופס אויר",
  headline: "הכל מסודר. הכל שקט. הכל עובד.",
  body: "זה מוזר בצורה שממש עובדת.",

  choices: [
    {
      id: "embrace-order",
      label: "להיכנע לסדר",
      effects: [
        { type: "stat", id: "musicianship", delta: 7 },
        { type: "affinity", memberId: "nimrod", delta: 6 },
      ],
    },
    {
      id: "find-chaos",
      label: "למצוא את הבלגן",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "nir", delta: 3 },
        { type: "affinity", memberId: "gidon", delta: 3 },
      ],
    },
  ],
};
