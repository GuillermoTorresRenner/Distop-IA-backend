-- AlterTable
ALTER TABLE "character_journal_entries" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "character_journal_entries_chronicleId_isShared_idx" ON "character_journal_entries"("chronicleId", "isShared");
