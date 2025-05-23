import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const creatorEmail = url.searchParams.get("creatorEmail");

  const isAdmin = creatorEmail === "Adminmeets@nairobi.go.ke";

  try {
    // Build the query conditionally
    const whereClause = {
      ...(creatorEmail && !isAdmin ? { creatorEmail } : {}), // Filter by creator if not admin
    };

    const totalMeetings = await prisma.meeting.count({
      where: whereClause,
    });

    const recentMeetings = await prisma.meeting.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        meetingType: true,
        onlineMeetingUrl: true,
        resources: true,
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 5,
    });

    return NextResponse.json({
      meetings: recentMeetings,
      total: totalMeetings,
    });
  } catch (error) {
    console.error("Error fetching recent meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent meetings" },
      { status: 500 }
    );
  }
}
