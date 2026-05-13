-- CreateEnum
CREATE TYPE "CharacterKind" AS ENUM ('PC', 'NPC', 'ANTAGONIST');

-- AlterTable
ALTER TABLE "characters" ADD COLUMN     "kind" "CharacterKind" NOT NULL DEFAULT 'PC';
