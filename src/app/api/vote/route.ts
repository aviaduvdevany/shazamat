import { NextRequest, NextResponse } from "next/server";
import { castVote } from "@/lib/vote/queries";
import { PLAYER_IDS } from "@/lib/vote/players";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, voterToken } = body as {
      playerId?: string;
      voterToken?: string;
    };

    if (
      typeof playerId !== "string" ||
      typeof voterToken !== "string" ||
      !PLAYER_IDS.has(playerId) ||
      voterToken.length < 8
    ) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const result = await castVote(playerId, voterToken);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
