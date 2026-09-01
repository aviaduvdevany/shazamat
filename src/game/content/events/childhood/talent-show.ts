import type { GameEvent } from "../../../schema/events";

export const talentShowEvent: GameEvent = {
  id: "childhood-talent-show",
  stage: "childhood",
  weight: 1,
  rarity: "common",
  oncePerRun: true,
  scene: "school-stage",
  mood: "tense",

  kicker: "גיל 10 — בית ספר יסודי",
  headline: "יש הצגת כישרונות ביום שישי.",
  body: "המורה שאלה מי רוצה להופיע. יד אחת הורמה. שלך.",

  choices: [
    {
      id: "perform",
      label: "לעלות לבמה",
      roll: [
        {
          weight: 2,
          label: "הקהל אוהב אותך! כולם מוחאים כפיים.",
          effects: [
            { type: "stat", id: "musicianship", delta: 10 },
            { type: "stat", id: "swag", delta: 8 },
            { type: "affinity", memberId: "gidon", delta: 4 },
            { type: "affinity", memberId: "nir", delta: 4 },
            { type: "setFlag", key: "firstPerformance", value: "success" },
          ],
        },
        {
          weight: 1,
          label: "זה לא הלך כמו שתכננת. בכלל.",
          effects: [
            { type: "stat", id: "swag", delta: -5 },
            { type: "stat", id: "musicianship", delta: 3 },
            { type: "affinity", memberId: "itay", delta: 2 },
            { type: "setFlag", key: "firstPerformance", value: "fail" },
          ],
        },
      ],
    },
    {
      id: "back-down",
      label: "להוריד את היד בשקט",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 3 },
        { type: "setFlag", key: "firstPerformance", value: "skip" },
      ],
    },
  ],
};
