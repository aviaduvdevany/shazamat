import type { GameEvent } from "../../../schema/events";

export const ashkenaziBetahanaEvent: GameEvent = {
  id: "home-ashkenazi-betahana",
  stage: "home",
  weight: 8,
  rarity: "common",
  oncePerRun: true,
  mood: "funny",
  scene: "school-stage",

  kicker: "גיל 24 — דרום תל אביב, אחרי חצות",
  headline: "יש פחית ספריי. יש קיר. יש ״שאזאמאט״.",
  body: "כולכם שם. מישהו אומר ״שאם תפסו אותנו זה בגלל הג׳ינג׳י.״",

  choices: [
    {
      id: "spray",
      label: "לרסס",
      roll: [
        {
          weight: 7,
          label: "ברחתם. ספריי עדיין יורד על הידיים.",
          effects: [
            { type: "stat", id: "swag", delta: 8 },
            { type: "affinity", memberId: "gidon", delta: 4 },
            { type: "affinity", memberId: "nir", delta: 4 },
            { type: "setFlag", key: "didGraffiti", value: true },
          ],
        },
        {
          weight: 3,
          label: "ישבתם בתחנה עד השש בבוקר.",
          effects: [
            { type: "stat", id: "swag", delta: 5 },
            { type: "affinity", memberId: "nir", delta: 3 },
            { type: "affinity", memberId: "gidon", delta: 3 },
            { type: "setFlag", key: "didGraffiti", value: true },
            { type: "setFlag", key: "gotArrested", value: true },
          ],
        },
      ],
    },
    {
      id: "lookout",
      label: "לעמוד שמירה",
      roll: [
        {
          weight: 7,
          label: "עבר בשלום. בקושי.",
          effects: [
            { type: "stat", id: "musicianship", delta: 4 },
            { type: "affinity", memberId: "aviad", delta: 5 },
            { type: "setFlag", key: "didGraffiti", value: true },
          ],
        },
        {
          weight: 3,
          label: "ראו אתכם. לא עצרו. עדיין.",
          effects: [
            { type: "stat", id: "swag", delta: 3 },
            { type: "affinity", memberId: "aviad", delta: 4 },
            { type: "setFlag", key: "didGraffiti", value: true },
          ],
        },
      ],
    },
    {
      id: "walk-away",
      label: "אני הולך הביתה",
      effects: [
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "affinity", memberId: "shay", delta: 5 },
      ],
    },
  ],
};
