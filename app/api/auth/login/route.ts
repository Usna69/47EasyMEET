// app/api/admin/login/route.ts

import { NextRequest } from "next/server";
import { safeQuery } from "@/lib/db";
import {
  createSuccessResponse,
  badRequestResponse,
  unauthorizedResponse,
  handleDatabaseError,
  validateRequiredFields,
} from "@/lib/api-utils";
import bcrypt from "bcryptjs";

interface UserRow {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  department: string | null;
  designation: string | null;
  userLevel: string;
  customRole: string | null;
  passwordResetRequested: boolean;
  passwordResetRequestedAt: Date | null;
  isFirstLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
  customLetterhead: string | null;
  swgLetterhead: string | null;
  userLetterhead: string | null;
  passwordResetToken: string | null;
  passwordResetTokenExpiry: Date | null;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log(`Login attempt for email: ${email}`);

    // Validate required fields
    const validation = validateRequiredFields({ email, password }, [
      "email",
      "password",
    ]);
    if (!validation.isValid) {
      console.log(
        `Login failed - Missing fields: ${validation.missingFields.join(", ")}`,
      );
      return badRequestResponse(
        `Missing required fields: ${validation.missingFields.join(", ")}`,
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`Login failed - Invalid email format: ${email}`);
      return badRequestResponse("Invalid email format");
    }

    // Find user by email
    let user: UserRow | undefined;
    try {
      const { rows } = await safeQuery<UserRow>(
        `SELECT TOP 1
           id, email, name, password, role,
           department, designation, userLevel, customRole,
           passwordResetRequested, passwordResetRequestedAt,
           isFirstLogin, createdAt, updatedAt,
           customLetterhead, swgLetterhead, userLetterhead,
           passwordResetToken, passwordResetTokenExpiry
         FROM dbo.[User]
         WHERE email = $1`,
        [email],
      );
      user = rows[0];
    } catch (dbError) {
      console.error("Database error during login:", dbError);
      return handleDatabaseError(dbError, "find user during login");
    }

    if (!user) {
      console.log(`Login failed - User not found: ${email}`);
      return unauthorizedResponse("Invalid credentials");
    }

    // Verify password
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error("Password comparison error:", bcryptError);
      return unauthorizedResponse("Invalid credentials");
    }

    if (!isValidPassword) {
      console.log(`Login failed - Invalid password for user: ${email}`);
      return unauthorizedResponse("Invalid credentials");
    }

    // Strip password before returning
    const { password: _, ...userWithoutPassword } = user;

    // Normalise bit fields that MSSQL returns as 0/1
    const safeUser = {
      ...userWithoutPassword,
      passwordResetRequested: Boolean(
        userWithoutPassword.passwordResetRequested,
      ),
      isFirstLogin: Boolean(userWithoutPassword.isFirstLogin),
    };

    console.log(`Login successful for user: ${email} (Role: ${user.role})`);
    console.log(`User level: ${user.userLevel}`);
    console.log("Full user object:", safeUser);

    return createSuccessResponse({ user: safeUser }, "Login successful");
  } catch (error) {
    console.error("Unexpected login error:", error);
    return handleDatabaseError(error, "authenticate user");
  }
}
