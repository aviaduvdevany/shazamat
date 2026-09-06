import type { GameEvent } from "../../../schema/events";

export const habaytaEvent: GameEvent = {
  id: "shazamat-habayta",
  stage: "shazamat",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "sad",

  kicker: "הביתה",
  headline: "לאחד מחברי הלהקה יש ילדה.",
  body: "ההופעה נגמרת בחצות. הוא רוצה להיות שם בבוקר.",

  choices: [
    {
      id: "go-home",
      label: "לך הביתה",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "aviad", delta: 4 },
        { type: "affinity", memberId: "nimrod", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 4 },
      ],
    },
    {
      id: "stay-on-road",
      label: "אנחנו בהופעה",
      effects: [
        { type: "stat", id: "musicianship", delta: 6 },
        { type: "affinity", memberId: "itay", delta: 3 },
        { type: "affinity", memberId: "reef", delta: 3 },
      ],
    },
  ],
};
