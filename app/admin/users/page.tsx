import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { safeQuery } from "@/lib/db";
import UsersClient from "@/components/users/UsersClient";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  userLevel: string;
  customRole: string | null;
  createdAt: string;
  userLetterhead: string | null;
}

async function getUserByEmail(email: string) {
  const { rows } = await safeQuery<UserRecord>(
    `SELECT id, name, email, role, department, designation, userLevel, customRole, createdAt, userLetterhead
     FROM dbo.[User]
     WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

async function getUsers() {
  const { rows } = await safeQuery<UserRecord>(
    `SELECT id, name, email, role, department, designation, userLevel, customRole, createdAt, userLetterhead
     FROM dbo.[User]
     ORDER BY createdAt DESC`,
  );
  return rows;
}

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const currentUser = await getUserByEmail(session.user.email);
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/admin");
  }

  const users = await getUsers();

  return <UsersClient users={users} />;
}
