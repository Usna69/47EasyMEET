// app/api/attendees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { safeQuery, DatabaseError } from "@/lib/db";
import {
  createSuccessResponse,
  createErrorResponse,
  badRequestResponse,
  notFoundResponse,
  handleDatabaseError,
  validateRequiredFields,
} from "@/lib/api-utils";
import {
  validateRegistrationForm,
  convertValidationErrorsToFormErrors,
} from "@/lib/validation";
import { isRegistrationOpen } from "@/lib/meeting-utils";

// Types for database rows
interface AttendeeRow {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  organization: string | null;
  designation: string;
  signatureData: string | null;
  meetingId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MeetingRowForAttendee {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  meetingType: string;
  sector: string | null;
  meetingLevel: string;
  restrictedAccess: boolean;
}

// POST /api/attendees - Register a new attendee for a meeting
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const meetingId = formData.get("meetingId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("contact") as string;
    const organization = formData.get("organization") as string;
    const designation = formData.get("designation") as string;
    const signatureData = formData.get("signatureData") as string | null;

    // Validate required fields
    const requiredFields = [
      "meetingId",
      "name",
      "email",
      "contact",
      "designation",
    ];
    const validation = validateRequiredFields(
      { meetingId, name, email, contact: phoneNumber, designation },
      requiredFields,
    );

    if (!validation.isValid) {
      return badRequestResponse(
        `Missing required fields: ${validation.missingFields.join(", ")}`,
      );
    }

    // Check if meeting exists and get meeting details
    const meetingQuery = `
      SELECT id, date, meetingCategory
      FROM dbo.Meeting
      WHERE id = $1
    `;
    const { rows: meetingRows } = await safeQuery<{
      id: string;
      date: Date;
      meetingCategory: string;
    }>(meetingQuery, [meetingId]);

    if (meetingRows.length === 0) {
      return notFoundResponse("Meeting");
    }
    const meeting = meetingRows[0];

    // Check if registration is open
    if (!isRegistrationOpen(meeting.date)) {
      return badRequestResponse("Registration is not open for this meeting");
    }

    // Validate registration form data
    const isInternalMeeting = meeting.meetingCategory === "INTERNAL";
    const formDataForValidation = {
      name,
      email,
      contact: phoneNumber,
      designation,
      organization: organization || "",
    };

    const formValidation = validateRegistrationForm(
      formDataForValidation,
      isInternalMeeting,
    );
    if (!formValidation.isValid) {
      const formErrors = convertValidationErrorsToFormErrors(
        formValidation.errors,
      );
      return badRequestResponse(Object.values(formErrors).join(", "));
    }

    // Check if attendee already exists for this meeting
    const existingQuery = `
      SELECT id FROM dbo.Attendee
      WHERE meetingId = $1 AND email = $2
    `;
    const { rows: existingRows } = await safeQuery<{ id: string }>(
      existingQuery,
      [meetingId, email],
    );
    if (existingRows.length > 0) {
      return badRequestResponse("You have already registered for this meeting");
    }

    // Create the attendee
    const attendeeId = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO dbo.Attendee (
        id, name, email, phoneNumber, organization, designation,
        signatureData, meetingId, createdAt, updatedAt
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, SYSUTCDATETIME(), SYSUTCDATETIME()
      );

      SELECT id, name, email, phoneNumber, organization, designation,
             signatureData, meetingId, createdAt, updatedAt
      FROM dbo.Attendee
      WHERE id = $1;
    `;

    const { rows: newAttendeeRows } = await safeQuery<AttendeeRow>(
      insertQuery,
      [
        attendeeId,
        name,
        email,
        phoneNumber,
        organization || null,
        designation,
        signatureData || null,
        meetingId,
      ],
    );

    const attendee = newAttendeeRows[0];

    return createSuccessResponse(
      {
        attendee,
        message:
          "Registration successful! You will receive a confirmation email shortly.",
      },
      "Registration successful",
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      return handleDatabaseError(error, "register attendee");
    }
    console.error("Error in POST /api/attendees:", error);
    return createErrorResponse("Failed to register attendee", 500);
  }
}

// DELETE /api/attendees - Delete an attendee by ID (requires authentication)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const attendeeId = searchParams.get("id");
    const meetingId = searchParams.get("meetingId");
    const authHeader = request.headers.get("Authorization");

    if (!attendeeId) {
      return Response.json(
        { error: "Attendee ID is required" },
        { status: 400 },
      );
    }

    // Verify user is authenticated with the Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // In a real application, you would verify the JWT token here
    const token = authHeader.split(" ")[1];
    // For this implementation, we assume the token is valid

    // Check if the attendee exists first
    const attendeeQuery = `
      SELECT a.id, a.meetingId, m.id as meetingIdFromJoin
      FROM dbo.Attendee a
      LEFT JOIN dbo.Meeting m ON a.meetingId = m.id
      WHERE a.id = $1
    `;
    const { rows: attendeeRows } = await safeQuery<{
      id: string;
      meetingId: string;
      meetingIdFromJoin: string;
    }>(attendeeQuery, [attendeeId]);

    if (attendeeRows.length === 0) {
      return Response.json({ error: "Attendee not found" }, { status: 404 });
    }

    // If meetingId is provided, verify the meeting exists (optional permission check)
    if (meetingId) {
      const meetingQuery = `SELECT id FROM dbo.Meeting WHERE id = $1`;
      const { rows: meetingRows } = await safeQuery<{ id: string }>(
        meetingQuery,
        [meetingId],
      );
      if (meetingRows.length === 0) {
        return Response.json({ error: "Meeting not found" }, { status: 404 });
      }
      // In a production app, you would decode the JWT token and check permissions
    }

    // Delete the attendee
    const deleteQuery = `DELETE FROM dbo.Attendee WHERE id = $1`;
    await safeQuery(deleteQuery, [attendeeId]);

    return Response.json(
      { message: "Attendee deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      return Response.json(
        { error: "Database error while deleting attendee" },
        { status: 500 },
      );
    }
    console.error("Error deleting attendee:", error);
    return Response.json(
      { error: "Failed to delete attendee" },
      { status: 500 },
    );
  }
}

// GET /api/attendees - Fetch attendees for a specific user by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 },
      );
    }

    // Fetch attendees for the specific user with meeting details
    const query = `
      SELECT
        a.id,
        a.name,
        a.email,
        a.phoneNumber,
        a.organization,
        a.designation,
        a.signatureData,
        a.meetingId,
        a.createdAt,
        a.updatedAt,
        m.id as meeting_id,
        m.title,
        m.description,
        m.date,
        m.location,
        m.meetingType,
        m.sector,
        m.meetingLevel,
        m.restrictedAccess
      FROM dbo.Attendee a
      INNER JOIN dbo.Meeting m ON a.meetingId = m.id
      WHERE a.email = $1
      ORDER BY a.createdAt DESC
    `;

    const { rows } = await safeQuery<any>(query, [userEmail]);

    // Transform rows into the expected shape: each attendee with a nested meeting object
    const attendees = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      organization: row.organization,
      designation: row.designation,
      signatureData: row.signatureData,
      meetingId: row.meetingId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      meeting: {
        id: row.meeting_id,
        title: row.title,
        description: row.description,
        date: row.date,
        location: row.location,
        meetingType: row.meetingType,
        sector: row.sector,
        meetingLevel: row.meetingLevel,
        restrictedAccess: Boolean(row.restrictedAccess),
      },
    }));

    return NextResponse.json({ success: true, data: attendees });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { success: false, error: "Database error while fetching attendees" },
        { status: 500 },
      );
    }
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendees" },
      { status: 500 },
    );
  }
}
