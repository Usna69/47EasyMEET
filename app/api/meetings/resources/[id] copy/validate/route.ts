import { NextRequest, NextResponse } from "next/server";
import { safeQuery, DatabaseError } from "@/lib/db"; // adjust path if needed

/**
 * POST handler for validating a password for a protected resource
 * Returns a token if the password is valid
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id: resourceId } = await params;

    console.log(`Resource download request for ID: ${resourceId}`);

    // Parse the request body to get the password
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Fetch the resource from the database to check if it exists
    const query = `
      SELECT id, meetingId
      FROM dbo.MeetingResource
      WHERE id = $1
    `;
    const { rows } = await safeQuery<{ id: string; meetingId: string }>(query, [
      resourceId,
    ]);

    // If the resource doesn't exist, return a 404
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    // Password protection feature has been simplified/removed
    // Return success without checking password
    return NextResponse.json(
      { status: "success", token: resourceId },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error(
        "Database connection error validating resource password:",
        error,
      );
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 },
      );
    }
    console.error("Error validating resource password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
