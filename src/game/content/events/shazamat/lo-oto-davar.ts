import type { GameEvent } from "../../../schema/events";

export const loOtoDavarEvent: GameEvent = {
  id: "shazamat-lo-oto-davar",
  stage: "shazamat",
  weight: 3,
  rarity: "common",
  oncePerRun: true,
  mood: "sad",

  kicker: "לא אותו דבר",
  headline: "אתה לא אותו אחד שהיה בשכונה עם הקוקילידה.",

  choices: [
    {
      id: "thats-fine",
      label: "זה בסדר",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "stat", id: "swag", delta: 5 },
      ],
    },
    {
      id: "not-sure",
      label: "לא בטוח",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 3 },
        { type: "affinity", memberId: "reef", delta: 3 },
      ],
    },
  ],
};
