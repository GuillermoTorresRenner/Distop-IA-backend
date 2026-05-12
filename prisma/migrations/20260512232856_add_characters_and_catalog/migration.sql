-- CreateEnum
CREATE TYPE "MeritFlawKind" AS ENUM ('MERIT', 'FLAW');

-- CreateEnum
CREATE TYPE "AbilityCategory" AS ENUM ('TALENT', 'SKILL', 'KNOWLEDGE');

-- CreateEnum
CREATE TYPE "VirtueScheme" AS ENUM ('HUMANITY', 'PATH');

-- CreateTable
CREATE TABLE "archetypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archetypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline_powers" (
    "id" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "discipline_powers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merits_flaws" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "MeritFlawKind" NOT NULL,
    "value" INTEGER NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merits_flaws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "concept" TEXT,
    "chronicleName" TEXT,
    "generation" INTEGER,
    "haven" TEXT,
    "clan" TEXT,
    "natureId" TEXT,
    "demeanorId" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 1,
    "dexterity" INTEGER NOT NULL DEFAULT 1,
    "stamina" INTEGER NOT NULL DEFAULT 1,
    "charisma" INTEGER NOT NULL DEFAULT 1,
    "manipulation" INTEGER NOT NULL DEFAULT 1,
    "appearance" INTEGER NOT NULL DEFAULT 1,
    "perception" INTEGER NOT NULL DEFAULT 1,
    "intelligence" INTEGER NOT NULL DEFAULT 1,
    "wits" INTEGER NOT NULL DEFAULT 1,
    "virtueScheme" "VirtueScheme" NOT NULL DEFAULT 'HUMANITY',
    "conscience" INTEGER NOT NULL DEFAULT 1,
    "selfControl" INTEGER NOT NULL DEFAULT 1,
    "courage" INTEGER NOT NULL DEFAULT 1,
    "humanity" INTEGER NOT NULL DEFAULT 7,
    "willpowerMax" INTEGER NOT NULL DEFAULT 1,
    "willpowerCurrent" INTEGER NOT NULL DEFAULT 1,
    "bloodPool" INTEGER NOT NULL DEFAULT 10,
    "healthBruised" INTEGER NOT NULL DEFAULT 0,
    "healthHurt" INTEGER NOT NULL DEFAULT 0,
    "healthInjured" INTEGER NOT NULL DEFAULT 0,
    "healthWounded" INTEGER NOT NULL DEFAULT 0,
    "healthMauled" INTEGER NOT NULL DEFAULT 0,
    "healthCrippled" INTEGER NOT NULL DEFAULT 0,
    "healthIncapacitated" INTEGER NOT NULL DEFAULT 0,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_abilities" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "category" "AbilityCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "specialty" TEXT,

    CONSTRAINT "character_abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_backgrounds" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "character_backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_disciplines" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "character_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_merits_flaws" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "meritFlawId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "character_merits_flaws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronicle_characters" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chronicle_characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "archetypes_name_key" ON "archetypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_name_key" ON "disciplines"("name");

-- CreateIndex
CREATE INDEX "discipline_powers_disciplineId_idx" ON "discipline_powers"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_powers_disciplineId_level_key" ON "discipline_powers"("disciplineId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "merits_flaws_name_key" ON "merits_flaws"("name");

-- CreateIndex
CREATE INDEX "characters_userId_idx" ON "characters"("userId");

-- CreateIndex
CREATE INDEX "character_abilities_characterId_idx" ON "character_abilities"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "character_abilities_characterId_category_name_key" ON "character_abilities"("characterId", "category", "name");

-- CreateIndex
CREATE INDEX "character_backgrounds_characterId_idx" ON "character_backgrounds"("characterId");

-- CreateIndex
CREATE INDEX "character_disciplines_characterId_idx" ON "character_disciplines"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "character_disciplines_characterId_disciplineId_key" ON "character_disciplines"("characterId", "disciplineId");

-- CreateIndex
CREATE INDEX "character_merits_flaws_characterId_idx" ON "character_merits_flaws"("characterId");

-- CreateIndex
CREATE INDEX "chronicle_characters_characterId_idx" ON "chronicle_characters"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "chronicle_characters_chronicleId_characterId_key" ON "chronicle_characters"("chronicleId", "characterId");

-- AddForeignKey
ALTER TABLE "discipline_powers" ADD CONSTRAINT "discipline_powers_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "archetypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_demeanorId_fkey" FOREIGN KEY ("demeanorId") REFERENCES "archetypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_abilities" ADD CONSTRAINT "character_abilities_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_backgrounds" ADD CONSTRAINT "character_backgrounds_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_disciplines" ADD CONSTRAINT "character_disciplines_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_disciplines" ADD CONSTRAINT "character_disciplines_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_merits_flaws" ADD CONSTRAINT "character_merits_flaws_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_merits_flaws" ADD CONSTRAINT "character_merits_flaws_meritFlawId_fkey" FOREIGN KEY ("meritFlawId") REFERENCES "merits_flaws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_characters" ADD CONSTRAINT "chronicle_characters_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_characters" ADD CONSTRAINT "chronicle_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
