import type { GameEvent } from "../../../schema/events";

export const bandTryoutEvent: GameEvent = {
  id: "school-band-tryout",
  stage: "school",
  weight: 1,
  rarity: "common",
  oncePerRun: true,
  scene: "school-practice-room",
  mood: "neutral",

  kicker: "כיתה ז׳",
  headline: "שלושה בחורים מחפשים עוד אחד ללהקה.",
  body: "הם קוראים לעצמם 'מתכת קשה של שאנסון ים תיכוני'. אתה לא בדיוק מבין מה זה אבל הם נראים רציניים.",

  // Only available if the player picked up the instrument in childhood
  requires: {
    type: "flag",
    key: "hadFirstInstrument",
    value: true,
  },

  choices: [
    {
      id: "join",
      label: "להצטרף",
      effects: [
        { type: "stat", id: "musicianship", delta: 12 },
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "nimrod", delta: 5 },
        { type: "affinity", memberId: "itay", delta: 5 },
        { type: "setFlag", key: "joinedFirstBand", value: true },
        { type: "spriteAddAccessory", partId: "accessory-band-patch" },
      ],
    },
    {
      id: "decline",
      label: "להגיד שאתה עסוק",
      effects: [
        { type: "stat", id: "swag", delta: 3 },
        { type: "affinity", memberId: "shay", delta: 2 },
      ],
    },
  ],
};
