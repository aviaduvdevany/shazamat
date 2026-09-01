import { z } from "zod";

export const StatSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string(),
  min: z.number().default(0),
  max: z.number().default(100),
  initial: z.number().default(10),
});

export type StatDef = z.infer<typeof StatSchema>;
