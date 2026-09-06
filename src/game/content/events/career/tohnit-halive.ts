import type { GameEvent } from "../../../schema/events";

export const tohnithHaliveEvent: GameEvent = {
  id: "career-tohnit-halive",
  stage: "career",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "tense",
  scene: "school-stage",

  kicker: "תוכנית העלייב",
  headline: "אתה עומד מאחורי הקלעים. הבמה ממולך.",
  body: "לא ידוע כמה אנשים יש שם. אפשר לשמוע שתיקה.",

  choices: [
    {
      id: "go-on",
      label: "לעלות",
      roll: [
        {
          weight: 3,
          label: "החדר היה שלך.",
          effects: [
            { type: "stat", id: "swag", delta: 10 },
            { type: "stat", id: "musicianship", delta: 5 },
            { type: "affinity", memberId: "gidon", delta: 4 },
            { type: "affinity", memberId: "nir", delta: 4 },
          ],
        },
        {
          weight: 2,
          label: "החדר היה כמעט ריק. ניגנת עד הסוף.",
          effects: [
            { type: "stat", id: "musicianship", delta: 8 },
            { type: "stat", id: "swag", delta: -3 },
            { type: "affinity", memberId: "shay", delta: 3 },
            { type: "affinity", memberId: "nimrod", delta: 3 },
          ],
        },
      ],
    },
  ],
};
