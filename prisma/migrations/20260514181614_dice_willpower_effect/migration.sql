-- CreateEnum
CREATE TYPE "WillpowerEffect" AS ENUM ('NONE', 'SUCCESS', 'WOUND', 'BOTH');

-- AlterTable
ALTER TABLE "dice_rolls" ADD COLUMN     "willpowerEffect" "WillpowerEffect" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "woundPenalty" INTEGER NOT NULL DEFAULT 0;
