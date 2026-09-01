import type { GameEvent } from "../../../schema/events";

export const shiratHamitparnasimEvent: GameEvent = {
  id: "home-shirat-hamitparnasim",
  stage: "home",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  kicker: "גיל 23 — תל אביב",
  headline: "השכירות צריכה להשתלם.",
  body: "לפניך שלוש אפשרויות. כולן לגיטימיות. כולן עצובות קצת.",

  choices: [
    {
      id: "wolt",
      label: "שליח וולט",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "reef", delta: 4 },
        { type: "affinity", memberId: "nir", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 4 },
        { type: "setFlag", key: "dayJob", value: "wolt" },
      ],
    },
    {
      id: "hitech",
      label: "הייטק",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "affinity", memberId: "aviad", delta: 6 },
        { type: "setFlag", key: "dayJob", value: "hitech" },
      ],
    },
    {
      id: "music-only",
      label: "רק מוזיקה",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "affinity", memberId: "nimrod", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 4 },
        { type: "affinity", memberId: "itay", delta: 4 },
        { type: "setFlag", key: "dayJob", value: "music-only" },
      ],
    },
  ],
};
