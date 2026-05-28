import { redirect } from "next/navigation";
import { safeQuery } from "@/lib/db";
import ProfileClient from "@/components/profile/ProfileClient";
import { auth } from "@/auth";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  designation?: string | null;
  userLevel?: string;
  customRole?: string | null;
}

// Helper to get full user by email (can be imported from a shared lib later)
async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const { rows } = await safeQuery<UserProfile>(
    `SELECT id, name, email, role, department, designation, userLevel, customRole
     FROM dbo.[User]
     WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    // User not found in DB – force logout or show error
    redirect("/admin/login");
  }

  // Derive admin status from the actual database record
  const isAdmin = user.role === "ADMIN";

  return <ProfileClient profile={user} isAdmin={isAdmin} />;
}
