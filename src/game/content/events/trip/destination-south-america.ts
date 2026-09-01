import type { GameEvent } from "../../../schema/events";

export const destinationSouthAmericaEvent: GameEvent = {
  id: "trip-destination-south-america",
  stage: "trip",
  weight: 6,
  rarity: "common",
  oncePerRun: true,
  mood: "epic",

  requires: { type: "flag", key: "travelDestination", value: "south-america" },

  kicker: "גיל 22 — בואנוס איירס",
  headline: "אתה על אוטובוס שאי אפשר להסביר לאן הוא הולך.",
  body: "מישהו שישב לידך יצא בתחנה שלפני. השאיר ספר בספרדית. אתה לא מדבר ספרדית.",

  choices: [
    {
      id: "read-it",
      label: "לנסות לקרוא את הספר",
      effects: [
        { type: "stat", id: "musicianship", delta: 6 },
        { type: "affinity", memberId: "reef", delta: 4 },
        { type: "affinity", memberId: "nir", delta: 3 },
      ],
    },
    {
      id: "stare-out-window",
      label: "להסתכל על הנוף",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "reef", delta: 3 },
        { type: "affinity", memberId: "nir", delta: 4 },
      ],
    },
  ],
};
