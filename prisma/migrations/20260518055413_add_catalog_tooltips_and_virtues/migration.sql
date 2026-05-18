-- AlterTable
ALTER TABLE "ability_info" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "archetypes" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "armors" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "attribute_info" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "backgrounds" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "clans" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "discipline_powers" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "disciplines" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "health_level_info" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "merits_flaws" ADD COLUMN     "tooltip" TEXT;

-- AlterTable
ALTER TABLE "weapons" ADD COLUMN     "description" TEXT,
ADD COLUMN     "tooltip" TEXT;

-- CreateTable
CREATE TABLE "virtue_info" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tooltip" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtue_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtue_info_key_key" ON "virtue_info"("key");

-- CreateIndex
CREATE UNIQUE INDEX "virtue_info_name_key" ON "virtue_info"("name");
