// app/api/meetings/recent/route.ts

import { NextRequest } from "next/server";
import { safeQuery } from "@/lib/db";
import {
  createSuccessResponse,
  createErrorResponse,
  handleDatabaseError,
} from "@/lib/api-utils";

interface UserRoleRow {
  role: string;
}

interface RecentMeetingRow {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  meetingType: string;
  onlineMeetingUrl: string | null;
  creatorEmail: string | null;
  sector: string | null;
  meetingCategory: string | null;
  organization: string | null;
  createdAt: Date;
  updatedAt: Date;
  attendeeCount: number;
  resourceCount: number;
}

interface RecentMeeting extends Omit<
  RecentMeetingRow,
  "attendeeCount" | "resourceCount"
> {
  _count: {
    attendees: number;
    resources: number;
  };
}

function toRecentMeeting(row: RecentMeetingRow): RecentMeeting {
  const { attendeeCount, resourceCount, ...rest } = row;
  return {
    ...rest,
    _count: {
      attendees: attendeeCount ?? 0,
      resources: resourceCount ?? 0,
    },
  };
}

// GET /api/meetings/recent - Get recent meetings for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorEmail = searchParams.get("creatorEmail");

    if (!creatorEmail) {
      return createErrorResponse("Creator email is required", 400);
    }

    // Resolve user role
    const { rows: userRows } = await safeQuery<UserRoleRow>(
      `SELECT TOP 1 role FROM dbo.[User] WHERE email = $1`,
      [creatorEmail],
    );

    if (userRows.length === 0) {
      return createErrorResponse("User not found", 404);
    }

    const isAdmin = userRows[0].role === "ADMIN";

    // Admins see all meetings; creators see only their own
    const whereClause = isAdmin ? `1=1` : `m.creatorEmail = $1`;
    const params = isAdmin ? [] : [creatorEmail];

    // Run count and recent-5 queries
    const [{ rows: countRows }, { rows: meetingRows }] = await Promise.all([
      safeQuery<{ total: number }>(
        `SELECT COUNT(*) AS total FROM dbo.Meeting m WHERE ${whereClause}`,
        params,
      ),
      safeQuery<RecentMeetingRow>(
        `SELECT TOP 5
           m.id,
           m.title,
           m.description,
           m.date,
           m.location,
           m.meetingType,
           m.onlineMeetingUrl,
           m.creatorEmail,
           m.sector,
           m.meetingCategory,
           m.organization,
           m.createdAt,
           m.updatedAt,
           (SELECT COUNT(*) FROM dbo.Attendee a WHERE a.meetingId = m.id) AS attendeeCount,
           (SELECT COUNT(*) FROM dbo.MeetingResource r WHERE r.meetingId = m.id) AS resourceCount
         FROM dbo.Meeting m
         WHERE ${whereClause}
         ORDER BY m.date DESC`,
        params,
      ),
    ]);

    return createSuccessResponse(
      {
        meetings: meetingRows.map(toRecentMeeting),
        total: countRows[0]?.total ?? 0,
      },
      "Recent meetings fetched successfully",
    );
  } catch (error) {
    return handleDatabaseError(error, "fetch recent meetings");
  }
}
