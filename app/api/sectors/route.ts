import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../lib/db";
import { createSuccessResponse, handleDatabaseError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    // Get all distinct non-null sectors from the Meeting table
    const query = `
      SELECT DISTINCT sector
      FROM dbo.Meeting
      WHERE sector IS NOT NULL
    `;

    const { rows } = await safeQuery<{ sector: string }>(query, []);

    // Extract sector values from rows
    const sectors = rows.map((row) => row.sector);

    return createSuccessResponse({ sectors }, "Sectors fetched successfully");
  } catch (error) {
    if (error instanceof DatabaseError) {
      // You can still use handleDatabaseError if it accepts DatabaseError or generic errors
      return handleDatabaseError(error, "fetch sectors");
    }
    return handleDatabaseError(error, "fetch sectors");
  }
}
