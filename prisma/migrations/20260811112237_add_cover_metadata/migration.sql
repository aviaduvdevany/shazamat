-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "coverBlurDataURL" TEXT,
ADD COLUMN     "coverHeight" INTEGER,
ADD COLUMN     "coverWidth" INTEGER;

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "coverBlurDataURL" TEXT,
ADD COLUMN     "coverHeight" INTEGER,
ADD COLUMN     "coverWidth" INTEGER;
