import type { GameEvent } from "../../../schema/events";

export const haverMeviHaverEvent: GameEvent = {
  id: "school-haver-mevi-haver",
  stage: "school",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "neutral",
  scene: "school-practice-room",

  kicker: "גיל 14 — חדר החזרות",
  headline: "יש בחור בבית הספר שמנגן גיטרה. הוא הביא עוד בחור. גם הוא מנגן.",
  body: "אחד מהם מסתכל עלייך ואומר: ״אתה מנגן על משהו?״",

  choices: [
    {
      id: "yes",
      label: "\"כן\"",
      effects: [
        { type: "stat", id: "musicianship", delta: 8 },
        { type: "affinity", memberId: "aviad", delta: 2 },
        { type: "affinity", memberId: "nimrod", delta: 2 },
        { type: "affinity", memberId: "itay", delta: 2 },
        { type: "affinity", memberId: "shay", delta: 2 },
        { type: "affinity", memberId: "reef", delta: 2 },
        { type: "setFlag", key: "joinedFirstBand", value: true },
      ],
    },
    {
      id: "no-crew",
      label: "אנלא בגאנג",
      effects: [
        { type: "stat", id: "swag", delta: 6 },
        { type: "affinity", memberId: "nir", delta: 4 },
        { type: "affinity", memberId: "gidon", delta: 4 },
      ],
    },
  ],
};
