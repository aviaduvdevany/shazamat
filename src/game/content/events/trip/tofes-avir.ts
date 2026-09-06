import type { GameEvent } from "../../../schema/events";

export const tofesAvirEvent: GameEvent = {
  id: "trip-tofes-avir",
  stage: "trip",
  weight: 10,
  rarity: "common",
  oncePerRun: true,
  mood: "epic",
  scene: "school-stage",

  kicker: "תופס אויר",
  headline: "הצבא נגמר. הדרכון ביד.",
  body: "לאן?",

  choices: [
    {
      id: "india",
      label: "הודו",
      effects: [
        { type: "affinity", memberId: "shay", delta: 6 },
        { type: "setFlag", key: "travelDestination", value: "india" },
        { type: "stat", id: "musicianship", delta: 5 },
        { type: "gotoEvent", eventId: "trip-destination-india" },
      ],
    },
    {
      id: "south-america",
      label: "דרום אמריקה",
      effects: [
        { type: "affinity", memberId: "reef", delta: 5 },
        { type: "affinity", memberId: "nir", delta: 5 },
        { type: "setFlag", key: "travelDestination", value: "south-america" },
        { type: "stat", id: "swag", delta: 5 },
        { type: "gotoEvent", eventId: "trip-destination-south-america" },
      ],
    },
    {
      id: "east-asia",
      label: "מזרח אסיה",
      effects: [
        { type: "affinity", memberId: "nimrod", delta: 6 },
        { type: "setFlag", key: "travelDestination", value: "east-asia" },
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "gotoEvent", eventId: "trip-destination-east-asia" },
      ],
    },
    {
      id: "usa",
      label: "ארצות הברית",
      effects: [
        { type: "affinity", memberId: "aviad", delta: 5 },
        { type: "affinity", memberId: "gidon", delta: 5 },
        { type: "setFlag", key: "travelDestination", value: "usa" },
        { type: "stat", id: "swag", delta: 4 },
        { type: "gotoEvent", eventId: "trip-destination-usa" },
      ],
    },
    {
      id: "australia",
      label: "אוסטרליה",
      effects: [
        { type: "affinity", memberId: "itay", delta: 6 },
        { type: "setFlag", key: "travelDestination", value: "australia" },
        { type: "stat", id: "musicianship", delta: 4 },
        { type: "gotoEvent", eventId: "trip-destination-australia" },
      ],
    },
  ],
};
