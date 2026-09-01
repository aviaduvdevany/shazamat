import { z } from "zod";

// Leaf conditions
const FlagConditionSchema = z.object({
  type: z.literal("flag"),
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const StatConditionSchema = z.object({
  type: z.literal("stat"),
  id: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
});

const AffinityConditionSchema = z.object({
  type: z.literal("affinity"),
  memberId: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
});

const StageConditionSchema = z.object({
  type: z.literal("stage"),
  stageId: z.string(),
});

const SeenEventConditionSchema = z.object({
  type: z.literal("seenEvent"),
  eventId: z.string(),
});

// Composite conditions (recursive)
type Condition =
  | { type: "all"; conditions: Condition[] }
  | { type: "any"; conditions: Condition[] }
  | { type: "not"; condition: Condition }
  | z.infer<typeof FlagConditionSchema>
  | z.infer<typeof StatConditionSchema>
  | z.infer<typeof AffinityConditionSchema>
  | z.infer<typeof StageConditionSchema>
  | z.infer<typeof SeenEventConditionSchema>;

const BaseConditionSchema = z.union([
  FlagConditionSchema,
  StatConditionSchema,
  AffinityConditionSchema,
  StageConditionSchema,
  SeenEventConditionSchema,
]);

export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ type: z.literal("all"), conditions: z.array(ConditionSchema) }),
    z.object({ type: z.literal("any"), conditions: z.array(ConditionSchema) }),
    z.object({ type: z.literal("not"), condition: ConditionSchema }),
    BaseConditionSchema,
  ])
);

export type { Condition };
