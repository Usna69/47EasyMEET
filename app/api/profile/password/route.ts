import { NextRequest } from "next/server";

import { safeQuery } from "@/lib/db";
import {
  createSuccessResponse,
  handleDatabaseError,
  badRequestResponse,
  unauthorizedResponse,
} from "@/lib/api-utils";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

interface PasswordRow {
  password: string;
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return unauthorizedResponse("Not authenticated");
    }

    // Fetch user id using email
    const { rows: userRows } = await safeQuery<{ id: string }>(
      `SELECT id FROM dbo.[User] WHERE email = $1`,
      [session.user.email],
    );
    if (userRows.length === 0) {
      return badRequestResponse("User not found");
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return badRequestResponse(
        "Current password and new password are required",
      );
    }

    if (newPassword.length < 8) {
      return badRequestResponse("New password must be at least 8 characters");
    }

    // Fetch current hash and verify
    const { rows } = await safeQuery<PasswordRow>(
      `SELECT password FROM dbo.[User] WHERE id = $1`,
      [userRows[0].id],
    );
    if (rows.length === 0) {
      return badRequestResponse("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return badRequestResponse("Current password is incorrect");
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await safeQuery(
      `UPDATE dbo.[User]
       SET password = $1, updatedAt = SYSUTCDATETIME()
       WHERE id = $2`,
      [hashedPassword, userRows[0].id],
    );

    return createSuccessResponse(null, "Password changed successfully");
  } catch (error) {
    return handleDatabaseError(error, "change password");
  }
}
