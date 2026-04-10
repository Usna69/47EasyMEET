import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../../lib/db";
import {
  createSuccessResponse,
  badRequestResponse,
  handleDatabaseError,
  validateRequiredFields,
} from "@/lib/api-utils";
import bcrypt from "bcryptjs";

// Type for user row returned from database
interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  isFirstLogin: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    const validation = validateRequiredFields({ email, password }, [
      "email",
      "password",
    ]);
    if (!validation.isValid) {
      return badRequestResponse(
        `Missing required fields: ${validation.missingFields.join(", ")}`,
      );
    }

    // Validate password length
    if (password.length < 6) {
      return badRequestResponse("Password must be at least 6 characters long");
    }

    // Find user by email and get isFirstLogin status
    const findQuery = `
      SELECT id, name, email, role, department, designation, isFirstLogin
      FROM dbo.[User]
      WHERE email = $1
    `;
    const { rows } = await safeQuery<UserRow>(findQuery, [email]);

    if (rows.length === 0) {
      return badRequestResponse("User not found");
    }

    const user = rows[0];

    // Check if user is on first login
    if (!user.isFirstLogin) {
      return badRequestResponse("Password has already been set");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and mark as not first login
    const updateQuery = `
      UPDATE dbo.[User]
      SET password = $1, isFirstLogin = 0, updatedAt = SYSUTCDATETIME()
      WHERE email = $2;

      SELECT id, name, email, role, department, designation, isFirstLogin
      FROM dbo.[User]
      WHERE email = $2;
    `;

    const { rows: updatedRows } = await safeQuery<UserRow>(updateQuery, [
      hashedPassword,
      email,
    ]);
    const updatedUser = updatedRows[0];

    return createSuccessResponse(updatedUser, "Password set successfully");
  } catch (error) {
    if (error instanceof DatabaseError) {
      return handleDatabaseError(error, "reset first login password");
    }
    return handleDatabaseError(error, "reset first login password");
  }
}
