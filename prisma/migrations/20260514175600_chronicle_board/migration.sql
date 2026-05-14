-- CreateTable
CREATE TABLE "chronicle_boards" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "elements" JSONB NOT NULL DEFAULT '[]',
    "appState" JSONB,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chronicle_boards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chronicle_boards_chronicleId_key" ON "chronicle_boards"("chronicleId");

-- AddForeignKey
ALTER TABLE "chronicle_boards" ADD CONSTRAINT "chronicle_boards_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
