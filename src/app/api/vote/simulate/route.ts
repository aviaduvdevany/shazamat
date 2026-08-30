import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAYERS } from "@/lib/vote/players";

export const dynamic = "force-dynamic";

const VOTE_COUNT = 1500;

export async function POST() {
  try {
    const data = Array.from({ length: VOTE_COUNT }, () => ({
      playerId: PLAYERS[Math.floor(Math.random() * PLAYERS.length)].id,
      voterToken: crypto.randomUUID(),
    }));

    const { count } = await prisma.playerVote.createMany({
      data,
      skipDuplicates: true,
    });

    return NextResponse.json({ ok: true, inserted: count });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
