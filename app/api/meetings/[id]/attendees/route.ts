import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../../../lib/db";

// Helper function for consistent JSON responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Types for database rows
interface AttendeeRow {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  organization: string | null;
  designation: string;
  signatureData: string | null;
  createdAt: Date;
}

// GET /api/meetings/[id]/attendees - Get all attendees for a meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate that the meeting exists
    const meetingQuery = `SELECT id FROM dbo.Meeting WHERE id = $1`;
    const { rows: meetingRows } = await safeQuery<{ id: string }>(
      meetingQuery,
      [id],
    );

    if (meetingRows.length === 0) {
      return jsonResponse({ error: "Meeting not found" }, 404);
    }

    // Get all attendees for the meeting, explicitly including signature data
    const attendeesQuery = `
      SELECT id, name, email, phoneNumber, organization, designation, signatureData, createdAt
      FROM dbo.Attendee
      WHERE meetingId = $1
      ORDER BY createdAt DESC
    `;
    const { rows: attendees } = await safeQuery<AttendeeRow>(attendeesQuery, [
      id,
    ]);

    // Log the presence of signature data for debugging
    attendees.forEach((attendee) => {
      if (attendee.signatureData) {
        console.log(
          `API: Attendee ${attendee.name} has signature data (${attendee.signatureData.length} chars)`,
        );
      } else {
        console.log(`API: Attendee ${attendee.name} has no signature data`);
      }
    });

    return jsonResponse(attendees);
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database error fetching attendees:", error);
      return jsonResponse({ error: "Database connection error" }, 500);
    }
    console.error("Error fetching attendees:", error);
    return jsonResponse({ error: "Failed to fetch attendees" }, 500);
  }
}

// POST /api/meetings/[id]/attendees - Add an attendee to a meeting
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    const { name, email, phoneNumber, designation, organization } = body;

    if (!name || !email) {
      return jsonResponse({ error: "Name and email are required" }, 400);
    }

    // Validate that the meeting exists
    const meetingQuery = `SELECT id FROM dbo.Meeting WHERE id = $1`;
    const { rows: meetingRows } = await safeQuery<{ id: string }>(
      meetingQuery,
      [id],
    );

    if (meetingRows.length === 0) {
      return jsonResponse({ error: "Meeting not found" }, 404);
    }

    // Check if the attendee is already registered
    const existingQuery = `
      SELECT id FROM dbo.Attendee
      WHERE email = $1 AND meetingId = $2
    `;
    const { rows: existingRows } = await safeQuery<{ id: string }>(
      existingQuery,
      [email, id],
    );

    if (existingRows.length > 0) {
      return jsonResponse(
        { error: "You are already registered for this meeting" },
        409,
      );
    }

    // Create the attendee
    const attendeeId = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO dbo.Attendee (
        id, name, email, phoneNumber, designation, organization, meetingId, createdAt, updatedAt
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, SYSUTCDATETIME(), SYSUTCDATETIME());

      SELECT id, name, email, phoneNumber, organization, designation, signatureData, createdAt
      FROM dbo.Attendee
      WHERE id = $1;
    `;

    const { rows: newAttendeeRows } = await safeQuery<AttendeeRow>(
      insertQuery,
      [
        attendeeId,
        name,
        email,
        phoneNumber || "",
        designation || "",
        organization || "",
        id,
      ],
    );

    const attendee = newAttendeeRows[0];

    return jsonResponse(attendee, 201);
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database error creating attendee:", error);
      return jsonResponse({ error: "Database connection error" }, 500);
    }
    console.error("Error creating attendee:", error);
    return jsonResponse({ error: "Failed to register for the meeting" }, 500);
  }
}
