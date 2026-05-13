-- CreateEnum
CREATE TYPE "WeaponKind" AS ENUM ('MELEE', 'RANGED');

-- CreateEnum
CREATE TYPE "WeaponDamageBase" AS ENUM ('STRENGTH', 'FLAT');

-- AlterTable
ALTER TABLE "characters" ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "weapon_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "WeaponKind" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weapon_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "WeaponKind" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "damageBase" "WeaponDamageBase" NOT NULL,
    "damageBonus" INTEGER NOT NULL DEFAULT 0,
    "lethal" BOOLEAN NOT NULL DEFAULT false,
    "aggravated" BOOLEAN NOT NULL DEFAULT false,
    "bluntPlus" BOOLEAN NOT NULL DEFAULT false,
    "range" INTEGER,
    "rate" TEXT,
    "magazine" INTEGER,
    "concealment" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_weapons" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "penalty" INTEGER NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "system" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "armors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_armors" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "armorId" TEXT NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_armors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weapon_categories_name_key" ON "weapon_categories"("name");

-- CreateIndex
CREATE INDEX "weapons_categoryId_idx" ON "weapons"("categoryId");

-- CreateIndex
CREATE INDEX "weapons_userId_idx" ON "weapons"("userId");

-- CreateIndex
CREATE INDEX "character_weapons_characterId_idx" ON "character_weapons"("characterId");

-- CreateIndex
CREATE INDEX "armors_userId_idx" ON "armors"("userId");

-- CreateIndex
CREATE INDEX "character_armors_characterId_idx" ON "character_armors"("characterId");

-- AddForeignKey
ALTER TABLE "weapons" ADD CONSTRAINT "weapons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "weapon_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weapons" ADD CONSTRAINT "weapons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_weapons" ADD CONSTRAINT "character_weapons_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_weapons" ADD CONSTRAINT "character_weapons_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "weapons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "armors" ADD CONSTRAINT "armors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_armors" ADD CONSTRAINT "character_armors_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_armors" ADD CONSTRAINT "character_armors_armorId_fkey" FOREIGN KEY ("armorId") REFERENCES "armors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
