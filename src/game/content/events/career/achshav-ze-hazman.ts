import type { GameEvent } from "../../../schema/events";

export const achshavZeHazmanEvent: GameEvent = {
  id: "career-achshav-ze-hazman",
  stage: "career",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "neutral",
  scene: "school-stage",

  kicker: "עכשיו זה הזמן",
  headline: "יש הרשמה לבתי ספר למוזיקה.",
  body: "לאן?",

  choices: [
    {
      id: "rimon",
      label: "רימון",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "affinity", memberId: "aviad", delta: 4 },
        { type: "affinity", memberId: "nimrod", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 4 },
        { type: "setFlag", key: "musicSchool", value: "rimon" },
      ],
    },
    {
      id: "bpm",
      label: "BPM",
      effects: [
        { type: "stat", id: "musicianship", delta: 7 },
        { type: "affinity", memberId: "reef", delta: 6 },
        { type: "setFlag", key: "musicSchool", value: "bpm" },
      ],
    },
    {
      id: "academy",
      label: "האקדמיה למוזיקה ירושלים",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "affinity", memberId: "itay", delta: 6 },
        { type: "setFlag", key: "musicSchool", value: "academy" },
      ],
    },
    {
      id: "no-school",
      label: "לא ללמוד, פשוט לעשות",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "nir", delta: 5 },
        { type: "affinity", memberId: "gidon", delta: 5 },
        { type: "setFlag", key: "musicSchool", value: "none" },
      ],
    },
  ],
};
