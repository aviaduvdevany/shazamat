import type { Stage } from "../schema/stages";

export const stages: Stage[] = [
  {
    id: "childhood",
    label: "ילדות",
    ageLabel: "גילאי 6–12",
    eventCount: 2,
    onEnter: [
      { type: "spriteSet", layer: "body", partId: "body-child" },
      { type: "spriteSet", layer: "expression", partId: "expression-neutral" },
    ],
  },
  {
    id: "school",
    label: "בית ספר",
    ageLabel: "גילאי 13–18",
    eventCount: 2,
    onEnter: [
      { type: "spriteSet", layer: "body", partId: "body-teen" },
    ],
  },
];
