"use server";

import { prisma } from "@/lib/prisma";
import type { GameState } from "@/game/schema/state";
import type { MemberId } from "@/game/schema/members";
import { z } from "zod";

// ────────────────────────────────────────────────────────────
// startRun
// ────────────────────────────────────────────────────────────

const StartRunSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  consent: z.literal(true, { error: "יש לאשר קבלת עדכונים" }),
});

export type StartRunResult =
  | { success: true; runId: string; seed: number }
  | { success: false; error: string };

export async function startRun(data: {
  email: string;
  consent: boolean;
}): Promise<StartRunResult> {
  const parsed = StartRunSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const seed = Math.floor(Math.random() * 2 ** 31);

  try {
    const subscriber = await prisma.subscriber.upsert({
      where: { email: parsed.data.email },
      create: {
        email: parsed.data.email,
        source: "game",
        marketingConsent: true,
      },
      update: {
        marketingConsent: true,
      },
    });

    const run = await prisma.gameRun.create({
      data: {
        subscriberId: subscriber.id,
        seed,
        contentVersion: 1,
        state: {} as object,
      },
    });

    return { success: true, runId: run.id, seed };
  } catch (err) {
    console.error("[game:startRun]", err);
    return { success: false, error: "שגיאה ביצירת המשחק. נסה שוב." };
  }
}

// ────────────────────────────────────────────────────────────
// checkpointRun  (debounced on client — fire-and-forget)
// ────────────────────────────────────────────────────────────

export async function checkpointRun(
  runId: string,
  state: GameState
): Promise<void> {
  try {
    await prisma.gameRun.update({
      where: { id: runId },
      data: { state: state as unknown as object },
    });
  } catch (err) {
    // Non-critical — checkpoint failures are silently swallowed
    console.error("[game:checkpointRun]", err);
  }
}

// ────────────────────────────────────────────────────────────
// completeRun
// ────────────────────────────────────────────────────────────

export type CompleteRunResult =
  | { success: true; shareUrl: string }
  | { success: false; error: string };

export async function completeRun(
  runId: string,
  state: GameState,
  memberId: MemberId
): Promise<CompleteRunResult> {
  try {
    await prisma.gameRun.update({
      where: { id: runId },
      data: {
        state: state as unknown as object,
        memberId,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      shareUrl: `/life/r/${runId}`,
    };
  } catch (err) {
    console.error("[game:completeRun]", err);
    return { success: false, error: "שגיאה בשמירת התוצאה." };
  }
}

// ────────────────────────────────────────────────────────────
// getCompletedRun  (used by share RSC page)
// ────────────────────────────────────────────────────────────

export interface CompletedRunData {
  id: string;
  memberId: string;
  seed: number;
  state: GameState;
  completedAt: Date | null;
}

export async function getCompletedRun(
  runId: string
): Promise<CompletedRunData | null> {
  try {
    const run = await prisma.gameRun.findUnique({
      where: { id: runId },
    });

    if (!run) return null;

    return {
      id: run.id,
      memberId: run.memberId ?? "",
      seed: run.seed,
      state: run.state as unknown as GameState,
      completedAt: run.completedAt,
    };
  } catch {
    return null;
  }
}
