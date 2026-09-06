import type { GameEvent } from "../../../schema/events";

export const shevaLevAdomEvent: GameEvent = {
  id: "school-sheva-lev-adom",
  stage: "school",
  weight: 5,
  rarity: "common",
  oncePerRun: true,
  mood: "neutral",
  scene: "school-classroom",

  kicker: "שבע לב אדום",
  headline: "יש מישהי.",
  body: "היא לא יודעת שאתה קיים. זו לא בהכרח בעיה.",

  choices: [
    {
      id: "all-in",
      label: "ללכת על זה בכל הכוח",
      effects: [
        { type: "stat", id: "swag", delta: 5 },
        { type: "affinity", memberId: "reef", delta: 5 },
        { type: "setFlag", key: "romantic", value: true },
      ],
    },
    {
      id: "play-cool",
      label: "לשמור על קול",
      effects: [
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "affinity", memberId: "nimrod", delta: 3 },
        { type: "affinity", memberId: "aviad", delta: 2 },
      ],
    },
  ],
};
