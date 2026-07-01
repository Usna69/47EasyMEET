import { redirect } from "next/navigation";
import { safeQuery } from "@/lib/db";
import { auth } from "@/auth";
import MeetingDetailsClient from "./MeetingDetailsClient";

// ─── Types ──────────────────────────────────────────────────────
interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  creatorEmail: string;
  sector: string;
  creatorType: string;
  meetingId: string;
  organization?: string;
  meetingCategory?: string;
  meetingType: string;
  onlineMeetingUrl?: string;
  registrationEnd?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendees: number;
    resources?: number;
  };
  resources?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
  }>;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
}

async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await safeQuery<UserRecord>(
    `SELECT id, name, email, role, department
     FROM dbo.[User]
     WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

async function getMeetingById(id: string): Promise<Meeting | null> {
  const { rows } = await safeQuery<Meeting>(
    `SELECT *
     FROM dbo.[Meeting]
     WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export default async function MeetingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    redirect("/admin/login");
  }

  const meeting = await getMeetingById(params.id);
  if (!meeting) {
    // Will be handled by the client component as a "not found" state
    return (
      <MeetingDetailsClient
        meeting={null}
        user={user}
        baseUrl={process.env.NEXT_PUBLIC_BASE_URL ?? ""}
      />
    );
  }

  return (
    <MeetingDetailsClient
      meeting={meeting}
      user={user}
      baseUrl={process.env.NEXT_PUBLIC_BASE_URL ?? ""}
    />
  );
}
