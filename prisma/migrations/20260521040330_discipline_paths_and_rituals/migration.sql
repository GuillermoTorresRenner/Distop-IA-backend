-- AlterTable
ALTER TABLE "discipline_powers" ADD COLUMN     "pathId" TEXT,
ALTER COLUMN "disciplineId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "disciplines" ADD COLUMN     "hasPaths" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "discipline_paths" (
    "id" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tooltip" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipline_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline_rituals" (
    "id" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tooltip" TEXT,
    "ingredients" TEXT,
    "castingTime" TEXT,
    "rollAttribute" TEXT,
    "rollAbility" TEXT,
    "rollDifficulty" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipline_rituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_discipline_rituals" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "ritualId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_discipline_rituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_discipline_paths" (
    "id" TEXT NOT NULL,
    "characterDisciplineId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "character_discipline_paths_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discipline_paths_disciplineId_idx" ON "discipline_paths"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_paths_disciplineId_key_key" ON "discipline_paths"("disciplineId", "key");

-- CreateIndex
CREATE INDEX "discipline_rituals_disciplineId_idx" ON "discipline_rituals"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_rituals_disciplineId_key_key" ON "discipline_rituals"("disciplineId", "key");

-- CreateIndex
CREATE INDEX "character_discipline_rituals_characterId_idx" ON "character_discipline_rituals"("characterId");

-- CreateIndex
CREATE INDEX "character_discipline_rituals_disciplineId_idx" ON "character_discipline_rituals"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "character_discipline_rituals_characterId_ritualId_key" ON "character_discipline_rituals"("characterId", "ritualId");

-- CreateIndex
CREATE INDEX "character_discipline_paths_characterDisciplineId_idx" ON "character_discipline_paths"("characterDisciplineId");

-- CreateIndex
CREATE INDEX "character_discipline_paths_pathId_idx" ON "character_discipline_paths"("pathId");

-- CreateIndex
CREATE UNIQUE INDEX "character_discipline_paths_characterDisciplineId_pathId_key" ON "character_discipline_paths"("characterDisciplineId", "pathId");

-- CreateIndex
CREATE INDEX "discipline_powers_pathId_idx" ON "discipline_powers"("pathId");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_powers_pathId_level_key" ON "discipline_powers"("pathId", "level");

-- AddForeignKey
ALTER TABLE "discipline_paths" ADD CONSTRAINT "discipline_paths_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_powers" ADD CONSTRAINT "discipline_powers_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "discipline_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_rituals" ADD CONSTRAINT "discipline_rituals_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_discipline_rituals" ADD CONSTRAINT "character_discipline_rituals_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_discipline_rituals" ADD CONSTRAINT "character_discipline_rituals_ritualId_fkey" FOREIGN KEY ("ritualId") REFERENCES "discipline_rituals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_discipline_rituals" ADD CONSTRAINT "character_discipline_rituals_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_discipline_paths" ADD CONSTRAINT "character_discipline_paths_characterDisciplineId_fkey" FOREIGN KEY ("characterDisciplineId") REFERENCES "character_disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_discipline_paths" ADD CONSTRAINT "character_discipline_paths_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "discipline_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

