-- AlterTable
ALTER TABLE "discipline_powers" ADD COLUMN     "bloodCost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rollAbility" TEXT,
ADD COLUMN     "rollAttribute" TEXT,
ADD COLUMN     "rollDifficulty" INTEGER,
ADD COLUMN     "summary" TEXT;
