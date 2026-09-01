import type { GameEvent } from "../../../schema/events";

export const kozaNostraEvent: GameEvent = {
  id: "shazamat-koza-nostra",
  stage: "shazamat",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "epic",
  scene: "school-stage",

  kicker: "ההווה — הלהקה",
  headline: "שבעה אנשים. אף אחד לא מפקד. כולם מפקדים.",
  body: "זה עובד ממש לא ברור איך.",

  choices: [
    {
      id: "loyalty",
      label: "זה המשפחה",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "aviad", delta: 3 },
        { type: "affinity", memberId: "reef", delta: 3 },
        { type: "affinity", memberId: "gidon", delta: 3 },
        { type: "affinity", memberId: "nir", delta: 3 },
      ],
    },
    {
      id: "solo",
      label: "אתה יכולת להיות סולו",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "nimrod", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 4 },
      ],
    },
  ],
};
