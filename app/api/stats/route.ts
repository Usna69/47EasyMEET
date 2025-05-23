import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const meetingCount = await prisma.meeting.count();
    const attendeeCount = await prisma.attendee.count();
    const sectorsData = await prisma.meeting.findMany({
      select: { sector: true },
      distinct: ["sector"],
      where: { sector: { not: null } },
    });
    const sectorsCount = sectorsData.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingCount = await prisma.meeting.count({
      where: {
        date: { gte: today },
      },
    });

    const attendanceRate = 85;

    const responseData = {
      totalMeetings: meetingCount,
      totalAttendees: attendeeCount,
      sectorsRepresented: sectorsCount,
      upcomingMeetings: upcomingCount,
      attendanceRate: attendanceRate,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Detailed error in stats API:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
