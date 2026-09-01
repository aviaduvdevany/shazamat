import type { GameEvent } from "../../../schema/events";

export const haydaNitzhonot: GameEvent = {
  id: "army-hayda-nitzhonot",
  stage: "army",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "tense",
  scene: "school-stage",

  kicker: "גיל 18 — מרכז הגיוס",
  headline: "פרופיל 97. אתה הולך לקרבי.",
  body: "הקצין שואל לאן אתה מבקש. לפניך שני אוטובוסים.",

  choices: [
    {
      id: "nahal",
      label: "נח\"ל",
      effects: [
        { type: "affinity", memberId: "aviad", delta: 4 },
        { type: "affinity", memberId: "nimrod", delta: 4 },
        { type: "affinity", memberId: "itay", delta: 4 },
        { type: "affinity", memberId: "reef", delta: 4 },
        { type: "affinity", memberId: "nir", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 4 },
        { type: "setFlag", key: "armyUnit", value: "nahal" },
        { type: "stat", id: "musicianship", delta: 3 },
      ],
    },
    {
      id: "golani",
      label: "גולני",
      effects: [
        { type: "affinity", memberId: "shay", delta: 8 },
        { type: "setFlag", key: "armyUnit", value: "golani" },
        { type: "stat", id: "swag", delta: 5 },
      ],
    },
  ],
};
