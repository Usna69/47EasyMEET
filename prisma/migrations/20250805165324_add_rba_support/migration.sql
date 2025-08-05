-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "meetingLevel" TEXT NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "restrictedAccess" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customRole" TEXT,
ADD COLUMN     "userLevel" TEXT NOT NULL DEFAULT 'REGULAR';
