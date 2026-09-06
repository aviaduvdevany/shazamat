import type { GameEvent } from "../../../schema/events";

export const destinationIndiaEvent: GameEvent = {
  id: "trip-destination-india",
  stage: "trip",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "epic",

  requires: { type: "flag", key: "travelDestination", value: "india" },

  kicker: "תופס אויר",
  headline: "אתה ער כבר שלושים ושש שעות.",
  body: "לא ברור אם זה בגלל הים, המוזיקה, או מה שהיה אתמול. כנראה שילוב.",

  choices: [
    {
      id: "keep-going",
      label: "להמשיך",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "shay", delta: 5 },
      ],
    },
    {
      id: "sleep",
      label: "לישון",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "itay", delta: 3 },
      ],
    },
  ],
};
