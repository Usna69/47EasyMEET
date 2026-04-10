// lib/actions/stats.ts
// Server-side data-access functions for platform statistics.
// Replaces the Prisma calls in the original /api/stats route handler.

import { safeQuery, DatabaseError } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalMeetings: number;
  totalAttendees: number;
  sectorsRepresented: number;
  upcomingMeetings: number;
  ongoingMeetings: number;
  attendanceRate: number;
  timestamp: string;
}

// Row shapes returned by individual queries
interface CountRow {
  total: number;
}

interface SectorRow {
  sector: string;
}

interface AttendanceRow {
  meetingType: string;
  attendeeCount: number;
}

// ─── Public action ────────────────────────────────────────────────────────────

/**
 * Fetch all platform statistics in a single database round-trip set.
 * All queries use the same "user-created" filter (creatorEmail IS NOT NULL)
 * to stay consistent with the original Prisma implementation.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // ── 1. Total user-created meetings ────────────────────────────────────────
    const { rows: meetingRows } = await safeQuery<CountRow>(
      `SELECT COUNT(*) AS total
       FROM dbo.Meeting
       WHERE creatorEmail IS NOT NULL`,
      [],
    );
    const totalMeetings = meetingRows[0]?.total ?? 0;

    // ── 2. Total attendees across user-created meetings ───────────────────────
    const { rows: attendeeRows } = await safeQuery<CountRow>(
      `SELECT COUNT(*) AS total
       FROM dbo.Attendee a
       INNER JOIN dbo.Meeting m ON a.meetingId = m.id
       WHERE m.creatorEmail IS NOT NULL`,
      [],
    );
    const totalAttendees = attendeeRows[0]?.total ?? 0;

    // ── 3. Distinct sectors represented ──────────────────────────────────────
    const { rows: sectorRows } = await safeQuery<SectorRow>(
      `SELECT DISTINCT sector
       FROM dbo.Meeting
       WHERE creatorEmail IS NOT NULL
         AND sector IS NOT NULL`,
      [],
    );
    const sectorsRepresented = sectorRows.length;

    // ── 4. Upcoming meetings (date >= now) ────────────────────────────────────
    const { rows: upcomingRows } = await safeQuery<CountRow>(
      `SELECT COUNT(*) AS total
       FROM dbo.Meeting
       WHERE creatorEmail IS NOT NULL
         AND date >= $1`,
      [now],
    );
    const upcomingMeetings = upcomingRows[0]?.total ?? 0;

    // ── 5. Ongoing meetings (started within last 2 hours) ─────────────────────
    const { rows: ongoingRows } = await safeQuery<CountRow>(
      `SELECT COUNT(*) AS total
       FROM dbo.Meeting
       WHERE creatorEmail IS NOT NULL
         AND date >= $1
         AND date < $2`,
      [twoHoursAgo, now],
    );
    const ongoingMeetings = ongoingRows[0]?.total ?? 0;

    // ── 6. Attendance rate ────────────────────────────────────────────────────
    // Fetch past meetings with actual attendee counts in one query
    const { rows: attendanceRows } = await safeQuery<AttendanceRow>(
      `SELECT
         m.meetingType,
         (SELECT COUNT(*) FROM dbo.Attendee a WHERE a.meetingId = m.id) AS attendeeCount
       FROM dbo.Meeting m
       WHERE m.creatorEmail IS NOT NULL
         AND m.date < $1`,
      [now],
    );

    let attendanceRate = 0;

    if (attendanceRows.length > 0) {
      const totalActual = attendanceRows.reduce(
        (sum, r) => sum + (r.attendeeCount ?? 0),
        0,
      );

      const totalExpected = attendanceRows.reduce((sum, r) => {
        const expected = r.meetingType === "PHYSICAL" ? 25 : 15;
        return sum + expected;
      }, 0);

      if (totalExpected > 0) {
        attendanceRate = Math.min(
          Math.round((totalActual / totalExpected) * 100),
          100,
        );
      }
    }

    return {
      totalMeetings,
      totalAttendees,
      sectorsRepresented,
      upcomingMeetings,
      ongoingMeetings,
      attendanceRate,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    console.error("getPlatformStats failed:", error);
    throw error;
  }
}
