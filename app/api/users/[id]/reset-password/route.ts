import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../../../lib/db";
import bcrypt from "bcryptjs";

// API response helper
const json = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
  });
};

// Add dynamic mode to ensure this route is properly rendered server-side
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id } = await params;
    const userId = id;
    const { newPassword } = await request.json();

    // Validate input
    if (!userId || !newPassword) {
      return json(
        { error: "User ID and new password are required" },
        { status: 400 },
      );
    }

    // Find the user to reset password
    const userQuery = `SELECT id FROM dbo.[User] WHERE id = $1`;
    const { rows: userRows } = await safeQuery<{ id: string }>(userQuery, [
      userId,
    ]);

    if (userRows.length === 0) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user record with new password and clear reset request
    const updateQuery = `
      UPDATE dbo.[User]
      SET password = $1, passwordResetRequested = 0, updatedAt = SYSUTCDATETIME()
      WHERE id = $2
    `;
    await safeQuery(updateQuery, [hashedPassword, userId]);

    return json(
      { success: true, message: "Password reset successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database error resetting password:", error);
      return json({ error: "Database connection error" }, { status: 500 });
    }
    console.error("Error resetting password:", error);
    return json(
      { error: "An error occurred while resetting the password" },
      { status: 500 },
    );
  }
}
