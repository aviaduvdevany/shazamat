import type { GameEvent } from "../../../schema/events";

export const hayomAniLoEvent: GameEvent = {
  id: "school-hayom-ani-lo",
  stage: "school",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  kicker: "גיל 15 — שש וחצי בבוקר",
  headline: "השעון מצלצל. שיעור ראשון בעוד עשרים דקות.",
  body: "המיטה מנצחת.",

  choices: [
    {
      id: "snooze",
      label: "עוד חמש דקות",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
        { type: "affinity", memberId: "itay", delta: 5 },
        { type: "setFlag", key: "alwaysLate", value: true },
      ],
    },
    {
      id: "get-up",
      label: "לקום",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "affinity", memberId: "nimrod", delta: 2 },
        { type: "affinity", memberId: "shay", delta: 2 },
      ],
    },
  ],
};
