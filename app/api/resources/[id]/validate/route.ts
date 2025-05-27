import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * POST handler for validating a password for a protected resource
 * Returns a token if the password is valid
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id: resourceId } = await params;

    console.log(`Resource download request for ID: ${resourceId}`);

    // Parse the request body to get the password
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Fetch the resource from the database to check if it exists
    const resource = await prisma.meetingResource.findUnique({
      where: {
        id: resourceId,
      },
      include: {
        // Include the meeting for verification
        meeting: true,
      },
    });

    // If the resource doesn't exist, return a 404
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Password protection feature has been simplified/removed
    // Return success without checking password
    return NextResponse.json(
      { status: "success", token: resourceId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating resource password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Validates a password for a meeting
 * @param meetingId The meeting ID
 * @param password The password to validate
 * @returns A boolean indicating if the password is valid
 */
async function validateResourcePassword(
  meetingId: string,
  password: string
): Promise<boolean> {
  // Since the document password protection feature has been removed,
  // we'll simplify this function to always return true
  // This allows existing code to continue working without errors

  try {
    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
    });

    // If meeting exists, consider the password valid
    // This is a temporary simplification since document protection was removed
    if (meeting) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error validating resource password:", error);
    return false;
  }
}
