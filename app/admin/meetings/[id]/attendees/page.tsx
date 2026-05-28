import { redirect } from "next/navigation";
import { safeQuery } from "@/lib/db";
import { auth } from "@/auth";
import AttendeesClient from "./AttendeesClient";

// ─── Types ──────────────────────────────────────────────────────
interface Attendee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  designation: string;
  organization: string;
  signatureData?: string | null; // ← added
  createdAt: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  sector?: string;
  meetingId?: string;
  meetingCategory?: string;
  creatorEmail?: string;
  customLetterhead?: string;
  _count?: {
    attendees: number;
  };
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
}

// Fetch full user by email
async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await safeQuery<UserRecord>(
    `SELECT id, name, email, role, department
     FROM dbo.[User]
     WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

// Fetch meeting details
async function getMeetingById(id: string): Promise<Meeting | null> {
  const { rows } = await safeQuery<Meeting>(
    `SELECT id, title, date, location, sector, meetingId, meetingCategory,
            creatorEmail, customLetterhead
     FROM dbo.[Meeting]
     WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

// Fetch attendees for a meeting
async function getAttendeesByMeetingId(meetingId: string): Promise<Attendee[]> {
  const { rows } = await safeQuery<Attendee>(
    `SELECT id, name, email, phoneNumber, designation, organization, signatureData, createdAt
     FROM dbo.[Attendee]
     WHERE meetingId = $1
     ORDER BY createdAt ASC`,
    [meetingId],
  );
  return rows;
}

export default async function AttendeesPage({
  params,
}: {
  params: { id: string };
}) {
  // 1. Authenticate
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  // 2. Get user record (for role checks if needed later)
  const user = await getUserByEmail(session.user.email);
  if (!user) {
    redirect("/admin/login");
  }

  // 3. Get meeting
  const meeting = await getMeetingById(params.id);
  if (!meeting) {
    // Let the client component handle the "not found" state
    return <AttendeesClient meeting={null} attendees={[]} />;
  }

  // 4. Get attendees
  const attendees = await getAttendeesByMeetingId(params.id);

  // Pass everything to the client component
  return <AttendeesClient meeting={meeting} attendees={attendees} />;
}
