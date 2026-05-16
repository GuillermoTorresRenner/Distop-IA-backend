-- AlterTable
ALTER TABLE "dice_rolls" ADD COLUMN     "skillRating" INTEGER,
ADD COLUMN     "specialtyRerolls" INTEGER[],
ADD COLUMN     "willpowerRerolls" INTEGER[],
ADD COLUMN     "wpForReroll" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wpForSuccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wpForWound" BOOLEAN NOT NULL DEFAULT false;
