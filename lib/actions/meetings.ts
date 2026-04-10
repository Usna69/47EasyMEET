// lib/actions/meetings.ts
// Server-side data-access functions for Meeting, replacing Prisma calls.
// Uses the safeQuery wrapper from lib/db.ts.

import { safeQuery, DatabaseError } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MeetingRow {
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
  // Aggregated counts (joined)
  attendeeCount: number;
  resourceCount: number;
}

export interface MeetingWithCounts extends Omit<
  MeetingRow,
  "attendeeCount" | "resourceCount"
> {
  _count: {
    attendees: number;
    resources: number;
  };
}

export interface MeetingFilters {
  sector?: string;
  creatorEmail?: string;
  userEmail?: string;
  userLevel?: string;
  userRole?: string;
  isAdmin?: boolean;
  page?: number;
  limit?: number;
  dateFilter?: "upcoming" | "ongoing" | "past" | "all";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Map a raw DB row to the MeetingWithCounts shape expected by UI components.
 */
function toMeetingWithCounts(row: MeetingRow): MeetingWithCounts {
  const { attendeeCount, resourceCount, ...rest } = row;
  return {
    ...rest,
    restrictedAccess: Boolean(row.restrictedAccess), // bit → boolean
    _count: {
      attendees: attendeeCount ?? 0,
      resources: resourceCount ?? 0,
    },
  };
}

/**
 * Build the WHERE fragment and params array for date-range filters.
 * Returns { clause, params, nextIndex } so callers can chain more params.
 */
function buildDateFilter(
  filter: "upcoming" | "ongoing" | "past" | "all",
  startIndex: number,
): { clause: string; params: unknown[]; nextIndex: number } {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  if (filter === "upcoming") {
    return {
      clause: `m.date >= $${startIndex}`,
      params: [now],
      nextIndex: startIndex + 1,
    };
  }
  if (filter === "ongoing") {
    return {
      clause: `m.date >= $${startIndex} AND m.date < $${startIndex + 1}`,
      params: [twoHoursAgo, now],
      nextIndex: startIndex + 2,
    };
  }
  if (filter === "past") {
    return {
      clause: `m.date < $${startIndex}`,
      params: [now],
      nextIndex: startIndex + 1,
    };
  }
  return { clause: "1=1", params: [], nextIndex: startIndex };
}

// ─── Public actions ───────────────────────────────────────────────────────────

/**
 * Fetch upcoming meetings for the home page (server component use).
 * Equivalent to the Prisma call in the original Home page.
 */
export async function getUpcomingMeetings(): Promise<MeetingWithCounts[]> {
  try {
    const now = new Date();

    const query = `
      SELECT
        m.id,
        m.title,
        m.description,
        m.date,
        m.location,
        m.creatorEmail,
        m.sector,
        m.creatorType,
        m.meetingId,
        m.meetingType,
        m.onlineMeetingUrl,
        m.registrationEnd,
        m.createdAt,
        m.updatedAt,
        m.customLetterhead,
        m.meetingCategory,
        m.organization,
        m.password,
        m.meetingLevel,
        m.restrictedAccess,
        (SELECT COUNT(*) FROM dbo.Attendee a WHERE a.meetingId = m.id) AS attendeeCount,
        (SELECT COUNT(*) FROM dbo.MeetingResource r WHERE r.meetingId = m.id) AS resourceCount
      FROM dbo.Meeting m
      WHERE m.date >= $1
      ORDER BY m.date ASC
    `;

    const { rows } = await safeQuery<MeetingRow>(query, [now]);
    return rows.map(toMeetingWithCounts);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    console.error("getUpcomingMeetings failed:", error);
    throw error;
  }
}

/**
 * Fetch meetings with flexible filtering (used by the /api/meetings route).
 */
export async function getMeetings(
  filters: MeetingFilters = {},
): Promise<{ meetings: MeetingWithCounts[]; total: number }> {
  try {
    const {
      sector,
      creatorEmail,
      userLevel,
      userRole,
      isAdmin = false,
      page = 1,
      limit = 20,
      dateFilter = "all",
    } = filters;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let pi = 1; // parameter index

    // ── Date range ──
    const {
      clause: dateClause,
      params: dateParams,
      nextIndex,
    } = buildDateFilter(dateFilter, pi);
    conditions.push(dateClause);
    params.push(...dateParams);
    pi = nextIndex;

    // ── Creator filter ──
    if (creatorEmail && !isAdmin) {
      conditions.push(`m.creatorEmail = $${pi}`);
      params.push(creatorEmail);
      pi++;
    }

    // ── Sector filter ──
    if (sector) {
      conditions.push(`m.sector = $${pi}`);
      params.push(sector);
      pi++;
    }

    // ── Access control ──
    if (!isAdmin) {
      if (userRole === "ADMIN") {
        // no restriction
      } else if (userLevel === "BOARD_MEMBER") {
        conditions.push(
          `(m.meetingLevel IN ('BOARD','REGULAR') OR m.restrictedAccess = 0)`,
        );
      } else if (userLevel === "GOVERNOR_OFFICE") {
        conditions.push(
          `(m.meetingLevel IN ('GOVERNOR','BOARD','REGULAR') OR m.restrictedAccess = 0)`,
        );
      } else if (userLevel === "CABINET") {
        conditions.push(
          `(m.meetingLevel IN ('CABINET','GOVERNOR','BOARD','REGULAR') OR m.restrictedAccess = 0)`,
        );
      } else {
        conditions.push(
          `(m.meetingLevel = 'REGULAR' OR m.restrictedAccess = 0)`,
        );
      }
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // ── Total count ──
    const countQuery = `SELECT COUNT(*) AS total FROM dbo.Meeting m ${where}`;
    const { rows: countRows } = await safeQuery<{ total: number }>(
      countQuery,
      params,
    );
    const total = countRows[0]?.total ?? 0;

    // ── Paginated data ──
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT
        m.id,
        m.title,
        m.description,
        m.date,
        m.location,
        m.creatorEmail,
        m.sector,
        m.creatorType,
        m.meetingId,
        m.meetingType,
        m.onlineMeetingUrl,
        m.registrationEnd,
        m.createdAt,
        m.updatedAt,
        m.customLetterhead,
        m.meetingCategory,
        m.organization,
        m.password,
        m.meetingLevel,
        m.restrictedAccess,
        (SELECT COUNT(*) FROM dbo.Attendee a WHERE a.meetingId = m.id) AS attendeeCount,
        (SELECT COUNT(*) FROM dbo.MeetingResource r WHERE r.meetingId = m.id) AS resourceCount
      FROM dbo.Meeting m
      ${where}
      ORDER BY m.createdAt DESC, m.date ASC
      OFFSET $${pi} ROWS FETCH NEXT $${pi + 1} ROWS ONLY
    `;

    const { rows } = await safeQuery<MeetingRow>(dataQuery, [
      ...params,
      offset,
      limit,
    ]);
    return { meetings: rows.map(toMeetingWithCounts), total };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    console.error("getMeetings failed:", error);
    throw error;
  }
}

/**
 * Fetch a single meeting by its primary key id.
 */
export async function getMeetingById(
  id: string,
): Promise<MeetingWithCounts | null> {
  try {
    const query = `
      SELECT
        m.id,
        m.title,
        m.description,
        m.date,
        m.location,
        m.creatorEmail,
        m.sector,
        m.creatorType,
        m.meetingId,
        m.meetingType,
        m.onlineMeetingUrl,
        m.registrationEnd,
        m.createdAt,
        m.updatedAt,
        m.customLetterhead,
        m.meetingCategory,
        m.organization,
        m.password,
        m.meetingLevel,
        m.restrictedAccess,
        (SELECT COUNT(*) FROM dbo.Attendee a WHERE a.meetingId = m.id) AS attendeeCount,
        (SELECT COUNT(*) FROM dbo.MeetingResource r WHERE r.meetingId = m.id) AS resourceCount
      FROM dbo.Meeting m
      WHERE m.id = $1
    `;

    const { rows } = await safeQuery<MeetingRow>(query, [id]);
    if (rows.length === 0) return null;
    return toMeetingWithCounts(rows[0]);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    console.error("getMeetingById failed:", error);
    throw error;
  }
}

/**
 * Create a new meeting. Returns the newly created row.
 */
export interface CreateMeetingInput {
  title: string;
  description: string;
  date: Date;
  location: string;
  creatorEmail?: string;
  password?: string;
  sector?: string;
  creatorType?: string;
  meetingId?: string;
  organization?: string;
  meetingCategory?: string;
  meetingType?: string;
  onlineMeetingUrl?: string;
  registrationEnd?: Date;
  customLetterhead?: string;
}

export async function createMeeting(
  input: CreateMeetingInput,
): Promise<MeetingWithCounts> {
  try {
    const id = crypto.randomUUID(); // app-generated id (cuid replacement)

    const query = `
      INSERT INTO dbo.Meeting (
        id, title, description, date, location,
        creatorEmail, password, sector, creatorType, meetingId,
        organization, meetingCategory, meetingType, onlineMeetingUrl,
        registrationEnd, customLetterhead, createdAt, updatedAt
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, SYSUTCDATETIME(), SYSUTCDATETIME()
      );

      SELECT
        m.id,
        m.title,
        m.description,
        m.date,
        m.location,
        m.creatorEmail,
        m.sector,
        m.creatorType,
        m.meetingId,
        m.meetingType,
        m.onlineMeetingUrl,
        m.registrationEnd,
        m.createdAt,
        m.updatedAt,
        m.customLetterhead,
        m.meetingCategory,
        m.organization,
        m.password,
        m.meetingLevel,
        m.restrictedAccess,
        0 AS attendeeCount,
        0 AS resourceCount
      FROM dbo.Meeting m
      WHERE m.id = $1;
    `;

    const { rows } = await safeQuery<MeetingRow>(query, [
      id,
      input.title,
      input.description,
      input.date,
      input.location,
      input.creatorEmail ?? null,
      input.password ?? null,
      input.sector ?? "IDE",
      input.creatorType ?? "ORG",
      input.meetingId ?? null,
      input.organization ?? null,
      input.meetingCategory ?? null,
      input.meetingType ?? "PHYSICAL",
      input.onlineMeetingUrl ?? null,
      input.registrationEnd ?? null,
      input.customLetterhead ?? null,
    ]);

    return toMeetingWithCounts(rows[0]);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    console.error("createMeeting failed:", error);
    throw error;
  }
}
