import type { GameEvent } from "../../../schema/events";

export const firstInstrumentEvent: GameEvent = {
  id: "childhood-first-instrument",
  stage: "childhood",
  weight: 1,
  rarity: "common",
  oncePerRun: true,
  scene: "childhood-bedroom",
  mood: "neutral",

  kicker: "גיל 8 — הסלון של הדוד",
  headline: "יש פה גיטרה.",
  body: "היא שבורה. מיתר אחד חסר. הדוד שלך לא מנגן עליה כבר שלוש שנים. היא יושבת בפינה ומסתכלת עליך.",

  choices: [
    {
      id: "pick-up",
      label: "לקחת אותה",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "affinity", memberId: "aviad", delta: 3 },
        { type: "affinity", memberId: "nimrod", delta: 3 },
        { type: "setFlag", key: "hadFirstInstrument", value: true },
        { type: "spriteSet", layer: "instrument", partId: "instrument-guitar-small" },
      ],
    },
    {
      id: "ignore",
      label: "להשאיר אותה שם",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "nir", delta: 2 },
        { type: "affinity", memberId: "gidon", delta: 2 },
      ],
    },
  ],
};
