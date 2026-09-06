import type { GameEvent } from "../../../schema/events";

export const haverimArsimEvent: GameEvent = {
  id: "home-haverim-arsim",
  stage: "home",
  weight: 4,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",

  kicker: "קוזה נוסטרה",
  headline: "חברים מהשכונה הגיעו לתל אביב.",
  body: "הם לא השתנו בכלל. אתה — שאלה פתוחה.",

  choices: [
    {
      id: "stay-with-them",
      label: "להישאר",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "aviad", delta: 6 },
      ],
    },
    {
      id: "pretend-busy",
      label: "יש לי עניינים",
      effects: [
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "affinity", memberId: "nimrod", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 3 },
      ],
    },
  ],
};
