-- CreateEnum
CREATE TYPE "WillpowerEffect" AS ENUM ('NONE', 'SUCCESS', 'WOUND', 'BOTH');

-- AlterTable
ALTER TABLE "dice_rolls" ADD COLUMN     "willpowerEffect" "WillpowerEffect" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "woundPenalty" INTEGER NOT NULL DEFAULT 0;

-- DataMigration: traducir el flag legacy `willpowerSpent` al nuevo enum.
-- Antes "willpowerSpent=true" significaba "gastó 1 punto para +1 éxito" (modo único viejo).
UPDATE "dice_rolls"
   SET "willpowerEffect" = 'SUCCESS'
 WHERE "willpowerSpent" = TRUE;
