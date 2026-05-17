-- CreateEnum
CREATE TYPE "AttributeCategoryInfo" AS ENUM ('PHYSICAL', 'SOCIAL', 'MENTAL');

-- CreateTable
CREATE TABLE "attribute_info" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AttributeCategoryInfo" NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ability_info" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AbilityCategory" NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ability_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_level_info" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "penalty" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_level_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_info_key_key" ON "attribute_info"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ability_info_key_key" ON "ability_info"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ability_info_name_key" ON "ability_info"("name");

-- CreateIndex
CREATE UNIQUE INDEX "health_level_info_key_key" ON "health_level_info"("key");

-- CreateIndex
CREATE UNIQUE INDEX "health_level_info_name_key" ON "health_level_info"("name");
