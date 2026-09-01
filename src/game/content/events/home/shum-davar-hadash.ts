import type { GameEvent } from "../../../schema/events";

export const shumDavarHadashEvent: GameEvent = {
  id: "home-shum-davar-hadash",
  stage: "home",
  weight: 5,
  rarity: "common",
  oncePerRun: true,
  mood: "sad",
  scene: "school-classroom",

  kicker: "גיל 26 — סטודיו, לילה",
  headline: "על שולחן העבודה: קפה קר, מתאם אודיו, ותיבת כדורים.",
  body: "שי ממשיך לערבב. זה המיקס הרביעי של הלילה.",

  choices: [
    {
      id: "acknowledge",
      label: "אחי, אתה ישן?",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "shay", delta: 7 },
      ],
    },
    {
      id: "keep-mixing",
      label: "להמשיך לעבוד",
      effects: [
        { type: "stat", id: "musicianship", delta: 7 },
        { type: "affinity", memberId: "shay", delta: 4 },
      ],
    },
    {
      id: "walk-away",
      label: "לצאת בלי להגיד כלום",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
      ],
    },
  ],
};
