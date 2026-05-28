import { redirect } from "next/navigation";
import { safeQuery } from "@/lib/db";
import { auth } from "@/auth";
import MeetingsClient from "@/components/meetings/MeetingsClient";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  userLevel?: string;
}

async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await safeQuery<UserRecord>(
    `SELECT id, name, email, role, department, userLevel
     FROM dbo.[User]
     WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export default async function MeetingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    redirect("/admin/login");
  }

  // Pass user data to the client component
  return <MeetingsClient user={user} />;
}
