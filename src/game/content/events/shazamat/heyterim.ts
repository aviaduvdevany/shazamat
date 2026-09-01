import type { GameEvent } from "../../../schema/events";

export const heyterimEvent: GameEvent = {
  id: "shazamat-heyterim",
  stage: "shazamat",
  weight: 5,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",

  kicker: "ההווה — האינסטגרם",
  headline: "מישהו כתב תגובה.",
  body: "היא מיוחדת בצורה שקשה לתאר. כולם רואים אותה.",

  choices: [
    {
      id: "clap-back",
      label: "לענות",
      effects: [
        { type: "stat", id: "swag", delta: 8 },
        { type: "affinity", memberId: "gidon", delta: 5 },
        { type: "affinity", memberId: "nir", delta: 5 },
      ],
    },
    {
      id: "mute",
      label: "לנטרל ולהמשיך",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "aviad", delta: 4 },
        { type: "affinity", memberId: "shay", delta: 3 },
      ],
    },
  ],
};
