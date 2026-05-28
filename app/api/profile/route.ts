import { NextRequest } from "next/server";

import { safeQuery } from "@/lib/db";
import {
  createSuccessResponse,
  handleDatabaseError,
  badRequestResponse,
  unauthorizedResponse,
} from "@/lib/api-utils";
import { auth } from "@/auth";

// ─── Types ──────────────────────────────────────────────────────
interface UserProfileRow {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  userLevel: string;
  customRole: string | null;
}

// Helper to get full user from email (you can replace with your own import)
async function getUserByEmail(email: string): Promise<UserProfileRow | null> {
  const { rows } = await safeQuery<UserProfileRow>(
    `SELECT id, name, email, role, department, designation, userLevel, customRole
     FROM dbo.[User]
     WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

// ─── GET ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return unauthorizedResponse("Not authenticated");
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return badRequestResponse("User not found");
    }

    return createSuccessResponse(user);
  } catch (error) {
    return handleDatabaseError(error, "fetch user profile");
  }
}

// ─── PUT ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return unauthorizedResponse("Not authenticated");
    }

    // Fetch the full user record to get id and current role
    const currentUser = await getUserByEmail(session.user.email);
    if (!currentUser) {
      return badRequestResponse("User not found");
    }

    const body = await req.json();
    const { name, email, department, designation, userLevel, customRole } =
      body;

    if (!name || !email) {
      return badRequestResponse("Name and email are required");
    }

    // Email uniqueness check (excluding current user)
    const { rows: existing } = await safeQuery<{ id: string }>(
      `SELECT TOP 1 id FROM dbo.[User] WHERE email = $1 AND id <> $2`,
      [email, currentUser.id],
    );
    if (existing.length > 0) {
      return badRequestResponse("Email is already in use by another account");
    }

    // Role‑based restrictions: only admins can change userLevel and customRole
    const isAdmin = currentUser.role === "ADMIN";
    const finalUserLevel = isAdmin ? userLevel || "REGULAR" : undefined;
    const finalCustomRole = isAdmin ? customRole || null : undefined;

    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 0;

    const addUpdate = (field: string, value: any) => {
      paramIndex++;
      updates.push(`${field} = $${paramIndex}`);
      params.push(value);
    };

    addUpdate("name", name);
    addUpdate("email", email);
    addUpdate("department", department || null);
    addUpdate("designation", designation || null);

    if (finalUserLevel !== undefined) {
      addUpdate("userLevel", finalUserLevel);
    }
    if (finalCustomRole !== undefined) {
      addUpdate("customRole", finalCustomRole);
    }

    // Always add updatedAt
    paramIndex++;
    updates.push(`updatedAt = SYSUTCDATETIME()`);

    // Where clause using current user's id
    paramIndex++;
    params.push(currentUser.id);
    const whereIndex = paramIndex;

    const query = `
      UPDATE dbo.[User]
      SET ${updates.join(", ")}
      WHERE id = $${whereIndex};

      SELECT id, name, email, role, department, designation, userLevel, customRole
      FROM dbo.[User]
      WHERE id = $${whereIndex};
    `;

    const { rows: updated } = await safeQuery<UserProfileRow>(query, params);

    if (updated.length === 0) {
      return badRequestResponse("Failed to update user");
    }

    return createSuccessResponse(updated[0], "Profile updated successfully");
  } catch (error) {
    return handleDatabaseError(error, "update user profile");
  }
}
