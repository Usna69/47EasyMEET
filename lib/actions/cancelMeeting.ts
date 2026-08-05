// app/actions/cancelMeeting.ts
"use server";

import { auth } from "@/auth";
import {
  getMeetingById,
  cancelMeeting as cancelMeetingDb,
} from "@/lib/actions/meetings";
import { revalidatePath } from "next/cache";

export async function cancelMeetingAction(meetingId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: No session");
  }

  // Fetch the meeting to check permissions
  const meeting = await getMeetingById(meetingId);
  if (!meeting) {
    throw new Error("Meeting not found");
  }

  // Only admin or the meeting creator can cancel
  const isAdmin = session.user.role === "ADMIN";
  const isCreator = meeting.creatorEmail === session.user.email;
  if (!isAdmin && !isCreator) {
    throw new Error("You are not authorized to cancel this meeting");
  }

  // Optional: prevent cancellation if meeting already started
  if (new Date(meeting.date) < new Date()) {
    throw new Error("Cannot cancel a meeting that has already started");
  }

  await cancelMeetingDb(meetingId, reason);

  // Revalidate relevant pages
  revalidatePath(`/admin/meetings/${meetingId}`);
  revalidatePath("/admin/meetings");
  revalidatePath("/");
}
