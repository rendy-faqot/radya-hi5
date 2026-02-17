/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "department" TEXT,
ADD COLUMN     "teamMemberId" TEXT;

-- CreateIndex
CREATE INDEX "User_teamMemberId_idx" ON "User"("teamMemberId");
