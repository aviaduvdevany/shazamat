import type { StatDef } from "../schema/stats";

export const stats: StatDef[] = [
  {
    id: "musicianship",
    label: "מוזיקליות",
    emoji: "🎸",
    min: 0,
    max: 100,
    initial: 10,
  },
  {
    id: "swag",
    label: "סוואג",
    emoji: "😎",
    min: 0,
    max: 100,
    initial: 10,
  },
];
