import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { isTokenExpired } from "../../../../lib/email";

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

// Type for user row
interface UserRow {
  id: string;
  passwordResetToken: string | null;
  passwordResetTokenExpiry: Date | null;
}

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    // Validate input
    if (!token || !newPassword) {
      return json(
        { error: "Reset token and new password are required" },
        { status: 400 },
      );
    }

    // Find user by reset token
    const findQuery = `
      SELECT id, passwordResetToken, passwordResetTokenExpiry
      FROM dbo.[User]
      WHERE passwordResetToken = $1
    `;
    const { rows } = await safeQuery<UserRow>(findQuery, [token]);

    if (rows.length === 0) {
      return json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const user = rows[0];

    // Check if token is expired
    if (
      !user.passwordResetTokenExpiry ||
      isTokenExpired(user.passwordResetTokenExpiry)
    ) {
      return json({ error: "Reset token has expired" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with new password and clear reset token
    const updateQuery = `
      UPDATE dbo.[User]
      SET
        password = $1,
        passwordResetRequested = 0,
        passwordResetToken = NULL,
        passwordResetTokenExpiry = NULL,
        updatedAt = SYSUTCDATETIME()
      WHERE id = $2
    `;
    await safeQuery(updateQuery, [hashedPassword, user.id]);

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
