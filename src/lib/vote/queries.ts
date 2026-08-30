import { prisma } from "@/lib/prisma";
import { PLAYERS, PLAYER_IDS } from "./players";

export interface PlayerResult {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  votes: number;
}

export interface VoteResults {
  players: PlayerResult[];
  totalVotes: number;
}

export async function castVote(
  playerId: string,
  voterToken: string
): Promise<{ ok: true; alreadyVoted?: true }> {
  if (!PLAYER_IDS.has(playerId)) {
    return { ok: true };
  }

  try {
    await prisma.playerVote.create({ data: { playerId, voterToken } });
    return { ok: true };
  } catch (err: unknown) {
    const isPrismaUniqueViolation =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002";

    if (isPrismaUniqueViolation) {
      return { ok: true, alreadyVoted: true };
    }
    throw err;
  }
}

export async function getResults(): Promise<VoteResults> {
  const grouped = await prisma.playerVote.groupBy({
    by: ["playerId"],
    _count: { id: true },
  });

  const countMap = new Map<string, number>(
    grouped.map((g) => [g.playerId, g._count.id])
  );

  const players: PlayerResult[] = PLAYERS.map((p) => ({
    ...p,
    votes: countMap.get(p.id) ?? 0,
  }));

  const totalVotes = players.reduce((sum, p) => sum + p.votes, 0);

  return { players, totalVotes };
}
