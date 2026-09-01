import type { GameEvent } from "../../../schema/events";

export const destinationUsaEvent: GameEvent = {
  id: "trip-destination-usa",
  stage: "trip",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",

  requires: { type: "flag", key: "travelDestination", value: "usa" },

  kicker: "גיל 22 — ניו יורק",
  headline: "אתה עומד מחוץ לחנות עם ויטרינה יפה מאוד.",
  body: "המחיר שרשום בחלון הוא לא לך. אבל.",

  choices: [
    {
      id: "flex",
      label: "להיכנס",
      effects: [
        { type: "stat", id: "swag", delta: 8 },
        { type: "affinity", memberId: "gidon", delta: 4 },
        { type: "affinity", memberId: "aviad", delta: 3 },
      ],
    },
    {
      id: "save",
      label: "לשמור את הכסף",
      effects: [
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "affinity", memberId: "aviad", delta: 4 },
        { type: "affinity", memberId: "nimrod", delta: 3 },
      ],
    },
  ],
};
