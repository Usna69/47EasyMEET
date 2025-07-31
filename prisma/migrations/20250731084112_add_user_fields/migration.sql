/*
  Warnings:

  - A unique constraint covering the columns `[passwordResetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "organization" TEXT,
ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customLetterhead" TEXT DEFAULT 'defaultlh.jpg',
ADD COLUMN     "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "passwordResetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "swgLetterhead" TEXT DEFAULT 'swg.jpg',
ADD COLUMN     "userLetterhead" TEXT DEFAULT 'defaultlh.jpg';

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");
