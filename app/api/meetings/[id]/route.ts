// app/api/meetings/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeQuery } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeetingRow {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  creatorEmail: string | null;
  sector: string | null;
  creatorType: string | null;
  meetingId: string | null;
  meetingType: string;
  onlineMeetingUrl: string | null;
  registrationEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customLetterhead: string | null;
  meetingCategory: string | null;
  organization: string | null;
  password: string | null;
  meetingLevel: string;
  restrictedAccess: boolean;
}

interface AttendeeRow {
  id: string;
  meetingId: string;
  name: string;
  email: string;
  organization: string | null;
  designation: string;
  signatureData: string | null;
  phoneNumber: string | null;
  createdAt: Date;
}

interface ResourceRow {
  id: string;
  meetingId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  description: string | null;
  uploadedAt: Date;
}

interface CountRow {
  attendeeCount: number;
  resourceCount: number;
}

interface ExistsRow {
  id: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const MEETING_COLUMNS = `
  m.id, m.title, m.description, m.date, m.location,
  m.creatorEmail, m.sector, m.creatorType, m.meetingId,
  m.meetingType, m.onlineMeetingUrl, m.registrationEnd,
  m.createdAt, m.updatedAt, m.customLetterhead, m.meetingCategory,
  m.organization, m.password, m.meetingLevel, m.restrictedAccess
`;

async function fetchMeetingById(id: string) {
  const [
    { rows: meetingRows },
    { rows: attendeeRows },
    { rows: resourceRows },
    { rows: countRows },
  ] = await Promise.all([
    safeQuery<MeetingRow>(
      `SELECT TOP 1 ${MEETING_COLUMNS} FROM dbo.Meeting m WHERE m.id = $1`,
      [id],
    ),
    safeQuery<AttendeeRow>(
      `SELECT id, meetingId, name, email, organization, designation,
                signatureData, phoneNumber, createdAt
         FROM dbo.Attendee WHERE meetingId = $1`,
      [id],
    ),
    safeQuery<ResourceRow>(
      `SELECT id, meetingId, fileName, fileType, fileSize, fileUrl,
                description, uploadedAt
         FROM dbo.MeetingResource WHERE meetingId = $1`,
      [id],
    ),
    safeQuery<CountRow>(
      `SELECT
           (SELECT COUNT(*) FROM dbo.Attendee  WHERE meetingId = $1) AS attendeeCount,
           (SELECT COUNT(*) FROM dbo.MeetingResource WHERE meetingId = $1) AS resourceCount`,
      [id],
    ),
  ]);

  if (meetingRows.length === 0) return null;

  return {
    ...meetingRows[0],
    restrictedAccess: Boolean(meetingRows[0].restrictedAccess),
    attendees: attendeeRows,
    resources: resourceRows,
    _count: {
      attendees: countRows[0]?.attendeeCount ?? 0,
      resources: countRows[0]?.resourceCount ?? 0,
    },
  };
}

async function meetingExists(id: string): Promise<MeetingRow | null> {
  const { rows } = await safeQuery<MeetingRow>(
    `SELECT TOP 1 ${MEETING_COLUMNS} FROM dbo.Meeting m WHERE m.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

// ─── GET /api/meetings/[id] ───────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const meeting = await fetchMeetingById(id);

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 },
    );
  }
}

// ─── PUT /api/meetings/[id] ───────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    console.log("Attempting to update meeting with ID:", id);

    const existing = await meetingExists(id);
    if (!existing) {
      console.error("Meeting not found with ID:", id);
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    console.log("Found existing meeting:", existing);

    const body = await request.json();
    console.log("Update request body:", body);

    if (!body.title || !body.description || !body.date || !body.location) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, date, and location are required",
        },
        { status: 400 },
      );
    }

    const meetingDate = new Date(body.date);
    const registrationEnd = new Date(meetingDate);
    registrationEnd.setHours(registrationEnd.getHours() + 2);

    const sector = body.sector || existing.sector;
    const meetingType = body.meetingType || existing.meetingType;
    const onlineMeetingUrl =
      body.onlineMeetingUrl || existing.onlineMeetingUrl || null;

    console.log(
      "Recalculated registration end time:",
      registrationEnd.toISOString(),
    );

    try {
      await safeQuery(
        `UPDATE dbo.Meeting SET
           title            = $1,
           description      = $2,
           location         = $3,
           date             = $4,
           sector           = $5,
           meetingType      = $6,
           onlineMeetingUrl = $7,
           registrationEnd  = $8,
           updatedAt        = SYSUTCDATETIME()
         WHERE id = $9`,
        [
          body.title,
          body.description,
          body.location,
          meetingDate,
          sector,
          meetingType,
          onlineMeetingUrl,
          registrationEnd,
          id,
        ],
      );

      const updatedMeeting = await meetingExists(id);
      console.log("Meeting updated successfully:", updatedMeeting);
      return NextResponse.json(updatedMeeting);
    } catch (dbError) {
      console.error("Database error updating meeting:", dbError);
      return NextResponse.json(
        {
          error: `Database error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in meeting update:", error);
    return NextResponse.json(
      {
        error: `Failed to update meeting: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/meetings/[id] ─────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await meetingExists(id);
    if (!existing) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Build SET clause dynamically from only the fields that were provided
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let pi = 1;

    if (body.customLetterhead !== undefined) {
      setClauses.push(`customLetterhead = $${pi++}`);
      params.push(body.customLetterhead);
    }

    if (body.meetingCategory !== undefined) {
      setClauses.push(`meetingCategory = $${pi++}`);
      params.push(body.meetingCategory);
    }

    if (setClauses.length === 0) {
      // Nothing to update — return the existing meeting as-is
      return NextResponse.json(existing);
    }

    setClauses.push(`updatedAt = SYSUTCDATETIME()`);
    params.push(id); // for the WHERE clause

    await safeQuery(
      `UPDATE dbo.Meeting SET ${setClauses.join(", ")} WHERE id = $${pi}`,
      params,
    );

    const updatedMeeting = await meetingExists(id);
    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/meetings/[id] ────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const existing = await meetingExists(id);
    if (!existing) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Attendees and resources have ON DELETE CASCADE in the schema,
    // so deleting the meeting is sufficient. Explicit attendee deletion
    // is kept here as a safety net for environments without CASCADE.
    await safeQuery(`DELETE FROM dbo.Attendee WHERE meetingId = $1`, [id]);
    await safeQuery(`DELETE FROM dbo.Meeting  WHERE id        = $1`, [id]);

    return NextResponse.json(
      { message: "Meeting deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 },
    );
  }
}
