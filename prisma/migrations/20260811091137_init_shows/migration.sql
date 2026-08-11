-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "city" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "ticketLink" TEXT,
    "doorsTime" TEXT,
    "coverImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Show_date_idx" ON "Show"("date");

-- CreateIndex
CREATE INDEX "Show_isFeatured_idx" ON "Show"("isFeatured");
