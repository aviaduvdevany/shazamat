-- CreateTable
CREATE TABLE "PlayerVote" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "voterToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerVote_voterToken_key" ON "PlayerVote"("voterToken");

-- CreateIndex
CREATE INDEX "PlayerVote_playerId_idx" ON "PlayerVote"("playerId");
