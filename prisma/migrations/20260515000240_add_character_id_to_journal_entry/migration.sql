-- AlterTable
ALTER TABLE "character_journal_entries" ADD COLUMN     "characterId" TEXT;

-- CreateIndex
CREATE INDEX "character_journal_entries_characterId_idx" ON "character_journal_entries"("characterId");

-- AddForeignKey
ALTER TABLE "character_journal_entries" ADD CONSTRAINT "character_journal_entries_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
