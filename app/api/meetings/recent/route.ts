// app/api/meetings/recent/route.ts
import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getRecentMeetings } from "@/lib/actions/meetings";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorEmail = searchParams.get("creatorEmail");

    if (!creatorEmail) {
      return createErrorResponse("Creator email is required", 400);
    }

    const data = await getRecentMeetings(creatorEmail);
    return createSuccessResponse(data, "Recent meetings fetched successfully");
  } catch (error: any) {
    return createErrorResponse(
      error.message || "Failed to fetch recent meetings",
      500,
    );
  }
}
