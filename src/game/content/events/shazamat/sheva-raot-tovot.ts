import type { GameEvent } from "../../../schema/events";

export const shevaRaotTovotEvent: GameEvent = {
  id: "shazamat-sheva-raot-tovot",
  stage: "shazamat",
  weight: 8,
  rarity: "common",
  oncePerRun: true,
  mood: "epic",
  scene: "school-stage",

  kicker: "שבע טובות",
  headline: "שבעה אנשים. לילה אחד. רק אחת מהשתיים יכולה לקרות.",
  body: "לא ברור מה תהיה. זה לא היה ברור מאז.",

  choices: [
    {
      id: "sheva-tovot",
      label: "לילה טוב",
      effects: [
        { type: "stat", id: "swag", delta: 8 },
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "aviad", delta: 2 },
        { type: "affinity", memberId: "itay", delta: 2 },
        { type: "affinity", memberId: "nimrod", delta: 2 },
        { type: "affinity", memberId: "shay", delta: 2 },
        { type: "affinity", memberId: "reef", delta: 2 },
        { type: "affinity", memberId: "nir", delta: 2 },
        { type: "affinity", memberId: "gidon", delta: 2 },
      ],
    },
    {
      id: "sheva-raot",
      label: "לילה רע",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
        { type: "affinity", memberId: "gidon", delta: 4 },
        { type: "affinity", memberId: "nir", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 3 },
      ],
    },
  ],
};
