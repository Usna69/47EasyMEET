-- Add meetingCategory column to Meeting table
ALTER TABLE "Meeting" ADD COLUMN "meetingCategory" TEXT NOT NULL DEFAULT 'INTERNAL';
