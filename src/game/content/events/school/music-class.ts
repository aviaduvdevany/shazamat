import type { GameEvent } from "../../../schema/events";

export const musicClassEvent: GameEvent = {
  id: "school-music-class",
  stage: "school",
  weight: 1,
  rarity: "common",
  oncePerRun: true,
  scene: "school-classroom",
  mood: "neutral",

  kicker: "כיתה ח׳ — שיעור מוזיקה",
  headline: "המורה שואל מה אתה רוצה ללמוד לנגן.",
  body: "כל הכיתה מסתכלת. המורה מחכה. הצלחון שלך כרגע ריק לחלוטין.",

  choices: [
    {
      id: "bass",
      label: "בס",
      effects: [
        { type: "stat", id: "musicianship", delta: 10 },
        { type: "affinity", memberId: "aviad", delta: 8 },
        { type: "spriteSet", layer: "instrument", partId: "instrument-bass" },
      ],
    },
    {
      id: "drums",
      label: "תופים",
      effects: [
        { type: "stat", id: "musicianship", delta: 10 },
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "itay", delta: 8 },
        { type: "spriteAddAccessory", partId: "accessory-drumsticks" },
      ],
    },
    {
      id: "keyboard",
      label: "קלידים",
      effects: [
        { type: "stat", id: "musicianship", delta: 12 },
        { type: "affinity", memberId: "reef", delta: 6 },
        { type: "affinity", memberId: "shay", delta: 4 },
      ],
    },
    {
      id: "nothing",
      label: "לא יודע, אדוד",
      effects: [
        { type: "stat", id: "swag", delta: 8 },
        { type: "affinity", memberId: "nir", delta: 5 },
        { type: "affinity", memberId: "gidon", delta: 5 },
      ],
    },
  ],
};
