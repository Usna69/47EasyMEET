import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../../lib/db";
import {
  createSuccessResponse,
  notFoundResponse,
  handleDatabaseError,
} from "@/lib/api-utils";

// Add dynamic mode to ensure this route is properly rendered server-side
export const dynamic = "force-dynamic";

// Types for database rows
interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  createdAt: Date;
  userLetterhead: string | null;
  swgLetterhead: string | null;
}

// GET a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const query = `
      SELECT
        id, name, email, role, department, designation,
        createdAt, userLetterhead, swgLetterhead
      FROM dbo.[User]
      WHERE id = $1
    `;
    const { rows } = await safeQuery<UserRow>(query, [id]);

    if (rows.length === 0) {
      return notFoundResponse("User");
    }

    return createSuccessResponse(rows[0], "User fetched successfully");
  } catch (error) {
    if (error instanceof DatabaseError) {
      return handleDatabaseError(error, "fetch user");
    }
    return handleDatabaseError(error, "fetch user");
  }
}

// DELETE a user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if user exists
    const checkQuery = `SELECT id FROM dbo.[User] WHERE id = $1`;
    const { rows } = await safeQuery<{ id: string }>(checkQuery, [id]);

    if (rows.length === 0) {
      return notFoundResponse("User");
    }

    // Delete user
    const deleteQuery = `DELETE FROM dbo.[User] WHERE id = $1`;
    await safeQuery(deleteQuery, [id]);

    return createSuccessResponse(null, "User deleted successfully");
  } catch (error) {
    if (error instanceof DatabaseError) {
      return handleDatabaseError(error, "delete user");
    }
    return handleDatabaseError(error, "delete user");
  }
}
