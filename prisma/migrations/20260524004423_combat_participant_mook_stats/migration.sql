-- AlterTable
ALTER TABLE "combat_participants" ADD COLUMN     "dexterity" INTEGER,
ADD COLUMN     "healthBruised" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "healthCrippled" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "healthHurt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "healthIncapacitated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "healthInjured" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "healthMauled" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "healthWounded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sourceCharacterId" TEXT,
ADD COLUMN     "wits" INTEGER;

-- CreateIndex
CREATE INDEX "combat_participants_sourceCharacterId_idx" ON "combat_participants"("sourceCharacterId");

-- AddForeignKey
ALTER TABLE "combat_participants" ADD CONSTRAINT "combat_participants_sourceCharacterId_fkey" FOREIGN KEY ("sourceCharacterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
