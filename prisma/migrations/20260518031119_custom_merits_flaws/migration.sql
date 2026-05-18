-- AlterTable
ALTER TABLE "character_merits_flaws" ADD COLUMN     "customCategory" TEXT,
ADD COLUMN     "customKind" "MeritFlawKind",
ADD COLUMN     "customName" TEXT,
ADD COLUMN     "customValue" INTEGER,
ALTER COLUMN "meritFlawId" DROP NOT NULL;
