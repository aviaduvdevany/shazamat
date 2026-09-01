import type { GameEvent } from "../../../schema/events";

export const kookilidaEvent: GameEvent = {
  id: "childhood-kookilida",
  stage: "childhood",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "childhood-bedroom",

  kicker: "גיל 7 — הקיוסק של השכונה",
  headline: "יש קוקילידה בקיוסק.",
  body: "אתה עומד מול הוויטרינה. מאחוריך, השכונה שלך. איפה זה?",

  choices: [
    {
      id: "north",
      label: "צפון",
      effects: [
        { type: "affinity", memberId: "gidon", delta: 5 },
        { type: "affinity", memberId: "nir", delta: 5 },
        { type: "setFlag", key: "hometown", value: "north" },
      ],
    },
    {
      id: "far-north",
      label: "צפון רחוק",
      effects: [
        { type: "affinity", memberId: "shay", delta: 5 },
        { type: "affinity", memberId: "nimrod", delta: 5 },
        { type: "affinity", memberId: "itay", delta: 5 },
        { type: "setFlag", key: "hometown", value: "far-north" },
      ],
    },
    {
      id: "center",
      label: "מרכז",
      effects: [
        { type: "affinity", memberId: "reef", delta: 5 },
        { type: "affinity", memberId: "aviad", delta: 5 },
        { type: "setFlag", key: "hometown", value: "center" },
      ],
    },
  ],
};
