-- CreateTable
CREATE TABLE "table_messages" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT,
    "speakerKind" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "speakerAvatar" TEXT,
    "text" TEXT NOT NULL,
    "recipientKind" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "table_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "table_messages_chronicleId_createdAt_idx" ON "table_messages"("chronicleId", "createdAt");

-- CreateIndex
CREATE INDEX "table_messages_userId_idx" ON "table_messages"("userId");

-- AddForeignKey
ALTER TABLE "table_messages" ADD CONSTRAINT "table_messages_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_messages" ADD CONSTRAINT "table_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_messages" ADD CONSTRAINT "table_messages_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
