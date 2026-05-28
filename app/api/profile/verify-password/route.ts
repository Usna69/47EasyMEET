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

export async function POST(req: NextRequest) {
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
    const { password } = body;
    if (!password) {
      return badRequestResponse("Current password is required");
    }

    // Fetch stored hash
    const { rows } = await safeQuery<PasswordRow>(
      `SELECT password FROM dbo.[User] WHERE id = $1`,
      [userRows[0].id],
    );
    if (rows.length === 0) {
      return badRequestResponse("User not found");
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return badRequestResponse("Incorrect current password");
    }

    return createSuccessResponse({ verified: true }, "Password verified");
  } catch (error) {
    return handleDatabaseError(error, "verify password");
  }
}
