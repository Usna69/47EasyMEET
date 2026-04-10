import { safeQuery, DatabaseError } from "../../../../lib/db";

// POST endpoint to clear data from the database
export async function POST(request: Request) {
  try {
    // First, delete attendees as they reference meetings
    await safeQuery(`DELETE FROM dbo.Attendee`, []);

    // Delete meeting resources
    await safeQuery(`DELETE FROM dbo.MeetingResource`, []);

    // Delete meetings
    await safeQuery(`DELETE FROM dbo.Meeting`, []);

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
      },
    );
  } catch (error) {
    console.error("Error clearing database:", error);

    // Check if it's our custom DatabaseError
    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: "Database connection error while clearing data",
          message: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Failed to clear database data",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
