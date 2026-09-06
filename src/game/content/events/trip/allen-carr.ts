import type { GameEvent } from "../../../schema/events";

export const allenCarrEvent: GameEvent = {
  id: "trip-allen-carr",
  stage: "trip",
  weight: 4,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",

  requires: { type: "flag", key: "travelDestination" },

  kicker: "אלן קאר",
  headline: "על השולחן: חפיסת סיגריות. פחות מחצי.",
  body: "אתה מעשן כבר שלוש שנים. זה לא ממש תוכנית, זה פשוט קרה. אבל אולי עכשיו זה הזמן.",

  choices: [
    {
      id: "quit",
      label: "לגמור את החפיסה ולהפסיק",
      effects: [
        { type: "stat", id: "swag", delta: -5 },
        { type: "setFlag", key: "quitSmoking", value: true },
      ],
    },
    {
      id: "keep-going",
      label: "להמשיך",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
      ],
    },
  ],
};
