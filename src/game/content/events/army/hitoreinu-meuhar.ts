import type { GameEvent } from "../../../schema/events";

export const hitoreinuMeuharEvent: GameEvent = {
  id: "army-hitoreinu-meuhar",
  stage: "army",
  weight: 3,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  kicker: "התעוררנו מאוחר",
  headline: "הכינוס התחיל לפני שש דקות.",
  body: "כולם שם. חוץ ממך.",

  choices: [
    {
      id: "sprint",
      label: "לרוץ בפחד",
      effects: [
        { type: "stat", id: "musicianship", delta: 2 },
        { type: "affinity", memberId: "itay", delta: 5 },
      ],
    },
    {
      id: "stroll",
      label: "להיכנס בנחת",
      effects: [
        { type: "stat", id: "swag", delta: 7 },
        { type: "affinity", memberId: "nir", delta: 4 },
      ],
    },
  ],
};
