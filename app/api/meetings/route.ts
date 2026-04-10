// app/api/meetings/route.ts
// Thin HTTP handler — all DB logic lives in lib/actions/meetings.ts.

import { NextRequest } from "next/server";
import {
  getMeetings,
  createMeeting,
  CreateMeetingInput,
} from "@/lib/actions/meetings";
import { validateMeetingData, generateMeetingId } from "@/lib/meeting-utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── GET /api/meetings ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const showActive = searchParams.get("active") === "true";
    const showOngoing = searchParams.get("ongoing") === "true";
    const isAdmin = searchParams.get("isAdmin") === "true";
    const creatorEmail = searchParams.get("creatorEmail") ?? undefined;
    const sector = searchParams.get("department") ?? undefined;
    const userEmail = searchParams.get("userEmail") ?? undefined;
    const userLevel = searchParams.get("userLevel") ?? undefined;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
    );

    // Determine date filter
    let dateFilter: "upcoming" | "ongoing" | "past" | "all" = "all";
    if (showActive) dateFilter = "upcoming";
    if (showOngoing) dateFilter = "ongoing";

    // Resolve user role from DB when userEmail is provided
    // (kept lightweight — only the role column matters for access control here)
    let userRole: string | undefined;
    if (userEmail && !isAdmin) {
      try {
        const { safeQuery } = await import("@/lib/db");
        const { rows } = await safeQuery<{ role: string; userLevel: string }>(
          `SELECT TOP 1 role, userLevel FROM dbo.[User] WHERE email = $1`,
          [userEmail],
        );
        if (rows[0]) {
          userRole = rows[0].role;
          // Let the caller-supplied userLevel take precedence; fall back to DB value
        }
      } catch {
        // Non-fatal: fall through with no role — access control will default to REGULAR
      }
    }

    const { meetings, total } = await getMeetings({
      sector,
      creatorEmail,
      userEmail,
      userLevel,
      userRole,
      isAdmin,
      page,
      limit,
      dateFilter,
    });

    // Return a paginated envelope consistent with the original createPaginatedResponse helper
    return json({
      success: true,
      data: meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/meetings error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: "Failed to fetch meetings", details: message }, 500);
  }
}

// ─── POST /api/meetings ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dateStr = formData.get("date") as string;
    const location = formData.get("location") as string;
    const creatorEmail = formData.get("creatorEmail") as string | null;
    const password = formData.get("password") as string | null;
    const sector = formData.get("sector") as string | null;
    const creatorType = formData.get("creatorType") as string | null;
    const meetingIdField = formData.get("meetingId") as string | null;
    const meetingCategory = formData.get("meetingCategory") as string | null;
    const meetingType = formData.get("meetingType") as string | null;
    const onlineMeetingUrl = formData.get("onlineMeetingUrl") as string | null;
    const registrationEndStr = formData.get("registrationEnd") as string | null;
    const customLetterhead = formData.get("selectedLetterheadPath") as
      | string
      | null;
    const organization = formData.get("organization") as string | null;

    // Validate
    const validation = validateMeetingData({
      title,
      date: dateStr,
      location,
      sector: sector ?? undefined,
      meetingCategory: meetingCategory ?? undefined,
    });

    if (!validation.isValid) {
      return json({ error: validation.errors.join(", ") }, 400);
    }

    const date = new Date(dateStr);

    // Generate meeting ID if not supplied
    let finalMeetingId = meetingIdField ?? undefined;
    if (!finalMeetingId && sector && meetingCategory) {
      finalMeetingId = generateMeetingId(sector, meetingCategory, date);
    }

    const input: CreateMeetingInput = {
      title,
      description,
      date,
      location,
      creatorEmail: creatorEmail ?? undefined,
      password: password ?? undefined,
      sector: sector ?? undefined,
      creatorType: creatorType ?? undefined,
      meetingId: finalMeetingId,
      organization: organization ?? undefined,
      meetingCategory: meetingCategory ?? undefined,
      meetingType: meetingType ?? undefined,
      onlineMeetingUrl:
        (meetingType === "ONLINE" || meetingType === "HYBRID") &&
        onlineMeetingUrl
          ? onlineMeetingUrl
          : undefined,
      registrationEnd: registrationEndStr
        ? new Date(registrationEndStr)
        : undefined,
      customLetterhead: customLetterhead ?? undefined,
    };

    const meeting = await createMeeting(input);

    // Handle optional resource file uploads (delegates to existing /api/resources route)
    const resourceFiles = formData.getAll("resources") as File[];
    if (resourceFiles.length > 0) {
      await Promise.all(
        resourceFiles.map(async (file) => {
          if (file.size === 0) return;
          const fd = new FormData();
          fd.append("file", file);
          fd.append("meetingId", meeting.id);
          await fetch("/api/resources", { method: "POST", body: fd });
        }),
      );
    }

    return json(
      { success: true, data: meeting, message: "Meeting created successfully" },
      201,
    );
  } catch (error) {
    console.error("POST /api/meetings error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: "Failed to create meeting", details: message }, 500);
  }
}
