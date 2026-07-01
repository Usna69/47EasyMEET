// app/admin/page.tsx (server component)
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardClient from "@/components/admin/DashboardClient";
import { getUser } from "@/lib/actions/loginActions";
import { getRecentMeetings } from "@/lib/actions/meetings";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const user = await getUser(session?.user?.email ?? "");

  if (user?.role === "VIEW_ONLY") {
    redirect("/view-only");
  }

  let initialMeetings: any[] = [];
  let totalMeetings = 0;
  let fetchError: string | null = null;

  try {
    const data = await getRecentMeetings(session?.user?.email ?? "");
    initialMeetings = data.meetings;
    totalMeetings = data.total;
  } catch (error: any) {
    console.error("Server-side data fetch failed:", error);
    fetchError = error.message;
  }

  return (
    <DashboardClient
      user={user}
      initialMeetings={initialMeetings}
      initialTotal={totalMeetings}
      initialFetchError={fetchError}
    />
  );
}
