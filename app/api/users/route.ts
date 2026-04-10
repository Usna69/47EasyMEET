// app/api/users/route.ts

import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "@/lib/db";
import {
  createSuccessResponse,
  createPaginatedResponse,
  handleDatabaseError,
  getPaginationParams,
  badRequestResponse,
} from "@/lib/api-utils";
import {
  validateUserForm,
  convertValidationErrorsToFormErrors,
} from "@/lib/validation";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserListRow {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  userLevel: string;
  customRole: string | null;
  createdAt: Date;
  userLetterhead: string | null;
  swgLetterhead: string | null;
}

interface UserCreatedRow {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  userLevel: string;
  customRole: string | null;
  createdAt: Date;
  isFirstLogin: boolean;
}

interface CountRow {
  total: number;
}

interface ExistsRow {
  id: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTemporaryPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ─── GET /api/users ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(
      new URL(request.url).searchParams,
    );

    const [{ rows: countRows }, { rows: users }] = await Promise.all([
      safeQuery<CountRow>(`SELECT COUNT(*) AS total FROM dbo.[User]`, []),

      safeQuery<UserListRow>(
        `SELECT
           id, name, email, role,
           department, designation, userLevel, customRole,
           createdAt, userLetterhead, swgLetterhead
         FROM dbo.[User]
         ORDER BY createdAt DESC
         OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY`,
        [skip, limit],
      ),
    ]);

    const total = countRows[0]?.total ?? 0;
    return createPaginatedResponse(users, page, limit, total);
  } catch (error) {
    return handleDatabaseError(error, "fetch users");
  }
}

// ─── POST /api/users ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      department,
      designation,
      userLevel,
      customRole,
      userLetterheadPath,
      swgLetterheadPath,
    } = body;

    // Validate
    const validation = validateUserForm({ name, email, password, role });
    if (!validation.isValid) {
      const formErrors = convertValidationErrorsToFormErrors(validation.errors);
      return badRequestResponse(Object.values(formErrors).join(", "));
    }

    // Check for duplicate email
    const { rows: existing } = await safeQuery<ExistsRow>(
      `SELECT TOP 1 id FROM dbo.[User] WHERE email = $1`,
      [email],
    );
    if (existing.length > 0) {
      return badRequestResponse("A user with this email already exists");
    }

    // Derive base URL for welcome email
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/[^\/]*$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Use provided password or generate a temporary one
    const tempPassword =
      password && password.trim() ? password : generateTemporaryPassword();

    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const id = crypto.randomUUID();

    const isViewOnly = role === "VIEW_ONLY";
    const resolvedUserLetterhead = isViewOnly
      ? null
      : (userLetterheadPath ?? null);
    const resolvedSwgLetterhead = isViewOnly
      ? null
      : (swgLetterheadPath ?? null);

    // Insert and return the new user in one round-trip
    const { rows: created } = await safeQuery<UserCreatedRow>(
      `INSERT INTO dbo.[User] (
         id, name, email, password, role,
         department, designation, userLevel, customRole,
         userLetterhead, swgLetterhead,
         isFirstLogin, createdAt, updatedAt
       )
       VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9,
         $10, $11,
         1, SYSUTCDATETIME(), SYSUTCDATETIME()
       );

       SELECT TOP 1
         id, name, email, role,
         department, designation, userLevel, customRole,
         createdAt, isFirstLogin
       FROM dbo.[User]
       WHERE id = $1;`,
      [
        id,
        name,
        email,
        hashedPassword,
        role ?? "USER",
        department ?? null,
        designation ?? null,
        userLevel ?? "REGULAR",
        customRole ?? null,
        resolvedUserLetterhead,
        resolvedSwgLetterhead,
      ],
    );

    const user = {
      ...created[0],
      isFirstLogin: Boolean(created[0].isFirstLogin),
    };

    // Send welcome email (non-fatal)
    try {
      await sendWelcomeEmail(
        user.email,
        user.name,
        tempPassword,
        user.role,
        origin,
      );
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

    return createSuccessResponse(user, "User created successfully");
  } catch (error) {
    return handleDatabaseError(error, "create user");
  }
}
