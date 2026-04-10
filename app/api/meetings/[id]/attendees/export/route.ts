import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../../../../lib/db";

// Types for database rows
interface AttendeeRow {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  organization: string | null;
  designation: string;
  createdAt: Date;
}

interface MeetingRow {
  id: string;
  title: string;
}

// GET /api/meetings/[id]/attendees/export - Export attendees as CSV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id } = await params;

    // Get all attendees for the meeting
    const attendeesQuery = `
      SELECT name, email, phoneNumber, organization, designation, createdAt
      FROM dbo.Attendee
      WHERE meetingId = $1
      ORDER BY createdAt DESC
    `;
    const { rows: attendees } = await safeQuery<AttendeeRow>(attendeesQuery, [
      id,
    ]);

    // Get meeting details
    const meetingQuery = `
      SELECT id, title
      FROM dbo.Meeting
      WHERE id = $1
    `;
    const { rows: meetingRows } = await safeQuery<MeetingRow>(meetingQuery, [
      id,
    ]);

    if (meetingRows.length === 0) {
      return new Response(JSON.stringify({ error: "Meeting not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const meeting = meetingRows[0];

    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Phone Number",
      "Organization",
      "Designation",
      "Registration Date",
    ];

    const rows = attendees.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.phoneNumber || "",
      attendee.organization || "",
      attendee.designation || "",
      new Date(attendee.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Get a safe filename
    const safeTitle = meeting.title.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const fileName = `attendees-${safeTitle}.csv`;

    // Return CSV file
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting attendees:", error);
    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: "Database connection error while exporting attendees",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    return new Response(
      JSON.stringify({ error: "Failed to export attendees" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
