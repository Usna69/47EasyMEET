import { redirect } from "next/navigation";

import { auth } from "@/auth";
import DashboardClient from "@/components/admin/DashboardClient";
import { getUser } from "@/lib/actions/loginActions";

export default async function AdminDashboardPage() {
  const session = await auth();

  console.log(session);
  if (!session?.user) {
    redirect("/admin/login");
  }

  const user = await getUser(session?.user?.email ?? "");

  if (user?.role === "VIEW_ONLY") {
    redirect("/view-only");
  }

  // Use the base URL defined in environment variables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  let initialMeetings: any[] = [];
  let totalMeetings = 0;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${baseUrl}/api/meetings/recent?creatorEmail=${encodeURIComponent(session?.user?.email ?? "")}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    initialMeetings = data.data?.meetings || data.meetings || [];
    totalMeetings = data.data?.total || data.total || 0;
  } catch (error: any) {
    console.error("Server-side fetch failed:", error);
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
