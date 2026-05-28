import { redirect } from "next/navigation";
import { safeQuery } from "@/lib/db";

import { auth } from "@/auth";
import CreateMeetingClient from "./CreateMeetingClient";

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

export default async function CreateMeetingPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    redirect("/admin/login");
  }

  const canCreate = user.role === "ADMIN" || user.role === "CREATOR";

  return (
    <CreateMeetingClient
      userEmail={user.email}
      userRole={user.role}
      userDepartment={user.department || ""}
      canCreate={canCreate}
    />
  );
}
