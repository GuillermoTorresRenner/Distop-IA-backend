-- CreateEnum
CREATE TYPE "ChronicleMemberRole" AS ENUM ('NARRATOR', 'PLAYER');

-- CreateEnum
CREATE TYPE "ChronicleInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "chronicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "setting" TEXT,
    "narratorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chronicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronicle_members" (
    "id" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ChronicleMemberRole" NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chronicle_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronicle_invitations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "chronicleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "status" "ChronicleInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chronicle_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chronicles_narratorId_idx" ON "chronicles"("narratorId");

-- CreateIndex
CREATE INDEX "chronicle_members_userId_idx" ON "chronicle_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chronicle_members_chronicleId_userId_key" ON "chronicle_members"("chronicleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "chronicle_invitations_token_key" ON "chronicle_invitations"("token");

-- CreateIndex
CREATE INDEX "chronicle_invitations_chronicleId_idx" ON "chronicle_invitations"("chronicleId");

-- CreateIndex
CREATE INDEX "chronicle_invitations_email_idx" ON "chronicle_invitations"("email");

-- CreateIndex
CREATE INDEX "chronicle_invitations_invitedUserId_idx" ON "chronicle_invitations"("invitedUserId");

-- AddForeignKey
ALTER TABLE "chronicles" ADD CONSTRAINT "chronicles_narratorId_fkey" FOREIGN KEY ("narratorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_members" ADD CONSTRAINT "chronicle_members_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_members" ADD CONSTRAINT "chronicle_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_invitations" ADD CONSTRAINT "chronicle_invitations_chronicleId_fkey" FOREIGN KEY ("chronicleId") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_invitations" ADD CONSTRAINT "chronicle_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_invitations" ADD CONSTRAINT "chronicle_invitations_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
