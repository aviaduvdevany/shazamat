import { z } from "zod";

export const StatDeltaSchema = z.object({
  type: z.literal("stat"),
  id: z.string(),
  delta: z.number(),
});

export const AffinityDeltaSchema = z.object({
  type: z.literal("affinity"),
  memberId: z.string(),
  delta: z.number(),
});

export const SetFlagSchema = z.object({
  type: z.literal("setFlag"),
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const SpriteSetSchema = z.object({
  type: z.literal("spriteSet"),
  layer: z.string(),
  partId: z.string(),
});

export const SpriteAddAccessorySchema = z.object({
  type: z.literal("spriteAddAccessory"),
  partId: z.string(),
});

export const SpriteRemoveAccessorySchema = z.object({
  type: z.literal("spriteRemoveAccessory"),
  partId: z.string(),
});

export const AdvanceStageSchema = z.object({
  type: z.literal("advanceStage"),
});

export const GotoEventSchema = z.object({
  type: z.literal("gotoEvent"),
  eventId: z.string(),
});

export const EffectSchema = z.discriminatedUnion("type", [
  StatDeltaSchema,
  AffinityDeltaSchema,
  SetFlagSchema,
  SpriteSetSchema,
  SpriteAddAccessorySchema,
  SpriteRemoveAccessorySchema,
  AdvanceStageSchema,
  GotoEventSchema,
]);

export type Effect = z.infer<typeof EffectSchema>;
