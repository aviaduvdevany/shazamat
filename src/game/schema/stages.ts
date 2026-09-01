import { z } from "zod";
import { EffectSchema } from "./effects";

export const StageSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  ageLabel: z.string().optional(),
  eventCount: z.number().int().positive().default(3),
  onEnter: z.array(EffectSchema).optional(),
});

export type Stage = z.infer<typeof StageSchema>;
