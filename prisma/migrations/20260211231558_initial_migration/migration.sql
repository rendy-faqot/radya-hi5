-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kudos" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Kudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KudosRecipient" (
    "id" TEXT NOT NULL,
    "kudosId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KudosRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Kudos_senderId_idx" ON "Kudos"("senderId");

-- CreateIndex
CREATE INDEX "Kudos_createdAt_idx" ON "Kudos"("createdAt");

-- CreateIndex
CREATE INDEX "KudosRecipient_userId_idx" ON "KudosRecipient"("userId");

-- CreateIndex
CREATE INDEX "KudosRecipient_createdAt_idx" ON "KudosRecipient"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "KudosRecipient_kudosId_userId_key" ON "KudosRecipient"("kudosId", "userId");

-- AddForeignKey
ALTER TABLE "Kudos" ADD CONSTRAINT "Kudos_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KudosRecipient" ADD CONSTRAINT "KudosRecipient_kudosId_fkey" FOREIGN KEY ("kudosId") REFERENCES "Kudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KudosRecipient" ADD CONSTRAINT "KudosRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
