import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// POST endpoint to clear data from the database
export async function POST(request: Request) {
  try {
    // First, delete attendees as they reference meetings
    await prisma.attendee.deleteMany({});

    // Delete meeting resources
    await prisma.meetingResource.deleteMany({});

    // Delete meetings
    await prisma.meeting.deleteMany({});

    // Create a response with special headers to prevent caching
    return new Response(
      JSON.stringify({
        message:
          "Successfully cleared all meetings, attendees, and resources data",
        deletedData: {
          meetings: true,
          attendees: true,
          resources: true,
        },
        refreshStats: true, // Signal to the client that stats should be refreshed
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error clearing database:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to clear database data",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
