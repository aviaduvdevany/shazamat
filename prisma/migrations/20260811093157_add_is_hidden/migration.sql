-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Show_isHidden_idx" ON "Show"("isHidden");
