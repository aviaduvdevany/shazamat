import type { GameEvent } from "../../../schema/events";

export const harryPotterEvent: GameEvent = {
  id: "career-harry-potter",
  stage: "career",
  weight: 1,
  rarity: "rare",
  oncePerRun: true,
  mood: "funny",

  kicker: "גיל 28 — אחרי חזרה",
  headline: "מישהו הביא את הגביע האש לחדר החזרות.",
  body: "הספר, לא הסרט. לא ברור מה הוא עושה שם. לא ברור מי הביא.",

  choices: [
    {
      id: "read",
      label: "לפתוח",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "shay", delta: 3 },
        { type: "affinity", memberId: "nimrod", delta: 3 },
      ],
    },
    {
      id: "ignore",
      label: "אנחנו באמצע חזרה",
      effects: [
        { type: "stat", id: "swag", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 4 },
        { type: "affinity", memberId: "nir", delta: 3 },
      ],
    },
  ],
};
