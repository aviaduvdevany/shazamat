import { z } from "zod";
import { ConditionSchema } from "./conditions";
import { EffectSchema } from "./effects";

export const RaritySchema = z.enum(["common", "rare", "ultra"]);
export type Rarity = z.infer<typeof RaritySchema>;

const RollOutcomeSchema = z.object({
  weight: z.number().positive(),
  label: z.string().min(1),
  effects: z.array(EffectSchema),
});

const ChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  effects: z.array(EffectSchema).optional(),
  roll: z.array(RollOutcomeSchema).optional(),
  requires: ConditionSchema.optional(),
}).refine(
  (c) => (c.effects && c.effects.length > 0) || (c.roll && c.roll.length > 0),
  { message: "Choice must have either effects or roll outcomes" }
);

export const EventSchema = z.object({
  id: z.string().min(1),
  stage: z.string().min(1),
  weight: z.number().positive().default(1),
  rarity: RaritySchema.default("common"),
  oncePerRun: z.boolean().default(true),
  requires: ConditionSchema.optional(),

  // Visuals
  scene: z.string().optional(),
  mood: z.enum(["neutral", "tense", "funny", "epic", "sad"]).optional().default("neutral"),

  // Hebrew copy
  kicker: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().optional(),

  choices: z.array(ChoiceSchema).min(1),
});

export type GameEvent = z.infer<typeof EventSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type RollOutcome = z.infer<typeof RollOutcomeSchema>;
