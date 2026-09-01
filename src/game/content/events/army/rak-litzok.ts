import type { GameEvent } from "../../../schema/events";

export const rakLitzokEvent: GameEvent = {
  id: "army-rak-litzok",
  stage: "army",
  weight: 5,
  rarity: "common",
  oncePerRun: true,
  mood: "tense",
  scene: "school-stage",

  kicker: "גיל 20 — חופשת שישי",
  headline: "יש הפגנה בתל אביב.",
  body: "לא כולם הולכים. אתה יכול.",

  choices: [
    {
      id: "go",
      label: "ללכת",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "gidon", delta: 5 },
        { type: "setFlag", key: "protestSeed", value: true },
      ],
    },
    {
      id: "stay",
      label: "להישאר בבסיס",
      effects: [
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 3 },
        { type: "affinity", memberId: "nimrod", delta: 2 },
      ],
    },
  ],
};
