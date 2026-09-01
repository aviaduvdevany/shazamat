import { z } from "zod";
import { MemberIdSchema } from "./members";
import { SpriteLoadoutSchema } from "./sprites";

export const LogEntrySchema = z.object({
  stage: z.string(),
  eventId: z.string(),
  choiceLabel: z.string(),
  outcomeLabel: z.string().optional(),
  statDeltas: z.array(z.object({ id: z.string(), delta: z.number() })).optional(),
});

export const GameStateSchema = z.object({
  runId: z.string(),
  seed: z.number(),
  rngCursor: z.number(),
  contentVersion: z.number(),

  stageIndex: z.number().int().min(0),
  eventsPlayedInStage: z.number().int().min(0),

  stats: z.record(z.string(), z.number()),
  affinities: z.record(z.string(), z.number()),
  flags: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),

  sprite: SpriteLoadoutSchema,
  seenEventIds: z.array(z.string()),

  log: z.array(LogEntrySchema),
  pendingEventId: z.string().nullable(),

  phase: z.enum(["playing", "outcome", "stage-clear", "ending"]),
  endingMemberId: MemberIdSchema.nullable(),
  completedAt: z.string().nullable(),
});

export type GameState = z.infer<typeof GameStateSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
