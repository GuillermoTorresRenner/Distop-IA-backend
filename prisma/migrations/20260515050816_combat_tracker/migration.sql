-- CreateTable
CREATE TABLE "combat_trackers" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "cursor" INTEGER NOT NULL DEFAULT 0,
    "round" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combat_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combat_participants" (
    "id" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "characterId" TEXT,
    "displayName" TEXT,
    "initiative" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "combat_trackers_chronicleId_key" ON "combat_trackers"("chronicleId");

-- CreateIndex
CREATE INDEX "combat_participants_trackerId_idx" ON "combat_participants"("trackerId");

-- CreateIndex
CREATE INDEX "combat_participants_characterId_idx" ON "combat_participants"("characterId");

-- AddForeignKey
ALTER TABLE "combat_trackers" ADD CONSTRAINT "combat_trackers_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combat_participants" ADD CONSTRAINT "combat_participants_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "combat_trackers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combat_participants" ADD CONSTRAINT "combat_participants_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
