// app/api/stats/route.ts
// Thin HTTP handler — all DB logic lives in lib/actions/stats.ts.

import { getPlatformStats } from "@/lib/actions/stats";
import { DatabaseError } from "@/lib/db";

const NO_CACHE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    const stats = await getPlatformStats();

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    const message =
      error instanceof DatabaseError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";

    console.error("GET /api/stats error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch statistics", details: message }),
      { status: 500, headers: NO_CACHE_HEADERS },
    );
  }
}
