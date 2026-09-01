-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'game',
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRun" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT,
    "seed" INTEGER NOT NULL,
    "contentVersion" INTEGER NOT NULL,
    "state" JSONB NOT NULL,
    "memberId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_source_idx" ON "Subscriber"("source");

-- CreateIndex
CREATE INDEX "Subscriber_createdAt_idx" ON "Subscriber"("createdAt");

-- CreateIndex
CREATE INDEX "GameRun_memberId_idx" ON "GameRun"("memberId");

-- CreateIndex
CREATE INDEX "GameRun_completedAt_idx" ON "GameRun"("completedAt");

-- CreateIndex
CREATE INDEX "GameRun_subscriberId_idx" ON "GameRun"("subscriberId");

-- AddForeignKey
ALTER TABLE "GameRun" ADD CONSTRAINT "GameRun_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
