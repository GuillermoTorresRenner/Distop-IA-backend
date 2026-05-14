-- CreateTable
CREATE TABLE "dice_rolls" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT,
    "label" TEXT,
    "pool" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 6,
    "specialty" BOOLEAN NOT NULL DEFAULT false,
    "willpowerSpent" BOOLEAN NOT NULL DEFAULT false,
    "rolls" INTEGER[],
    "successes" INTEGER NOT NULL,
    "isBotch" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dice_rolls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dice_rolls_chronicleId_createdAt_idx" ON "dice_rolls"("chronicleId", "createdAt");

-- CreateIndex
CREATE INDEX "dice_rolls_userId_idx" ON "dice_rolls"("userId");

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
