import type { GameEvent } from "../../../schema/events";

export const yeledManiacEvent: GameEvent = {
  id: "school-yeled-maniac",
  stage: "school",
  weight: 4,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "school-classroom",

  kicker: "גיל 16 — שיעור מתמטיקה",
  headline: "המורה מסתכלת עלייך.",
  body: "לא בגלל שעשית משהו. בגלל שאתה אתה.",

  choices: [
    {
      id: "lean-in",
      label: "מה?",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "gidon", delta: 4 },
        { type: "affinity", memberId: "nir", delta: 4 },
      ],
    },
    {
      id: "sit-still",
      label: "לנסות להיראות נורמלי",
      effects: [
        { type: "stat", id: "musicianship", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 3 },
      ],
    },
  ],
};
