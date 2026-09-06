import type { Stage } from "../schema/stages";

export const stages: Stage[] = [
  {
    id: "childhood",
    label: "ילדות",
    ageLabel: "גילאי 6–12",
    eventCount: 2,
    onEnter: [{ type: "spriteSet", look: "look-child" }],
  },
  {
    id: "school",
    label: "בית ספר",
    ageLabel: "גילאי 13–18",
    eventCount: 3,
    onEnter: [{ type: "spriteSet", look: "look-teen" }],
  },
  {
    id: "army",
    label: "צבא",
    ageLabel: "גילאי 18–21",
    eventCount: 3,
    onEnter: [{ type: "spriteSet", look: "look-soldier-nahal" }],
  },
  {
    id: "trip",
    label: "טיול אחרי צבא",
    ageLabel: "גילאי 21–23",
    eventCount: 3,
    onEnter: [{ type: "spriteSet", look: "look-trip" }],
  },
  {
    id: "home",
    label: "בחזרה לארץ",
    ageLabel: "גילאי 23–27",
    eventCount: 3,
    onEnter: [{ type: "spriteSet", look: "look-adult" }],
  },
  {
    id: "career",
    label: "הקריירה",
    ageLabel: "גילאי 27–30",
    eventCount: 3,
    onEnter: [{ type: "spriteSet", look: "look-career" }],
  },
  {
    id: "shazamat",
    label: "שאזאמאט",
    ageLabel: "ההווה",
    eventCount: 3,
    onEnter: [{ type: "spriteSet", look: "look-shazamat" }],
  },
];
