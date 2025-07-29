import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { 
  createSuccessResponse, 
  notFoundResponse,
  handleDatabaseError
} from "@/lib/api-utils";

// Add dynamic mode to ensure this route is properly rendered server-side
export const dynamic = 'force-dynamic';

// GET a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        createdAt: true,
        userLetterhead: true,
        swgLetterhead: true,
      },
    });

    if (!user) {
      return notFoundResponse("User");
    }

    return createSuccessResponse(user, "User fetched successfully");

  } catch (error) {
    return handleDatabaseError(error, "fetch user");
  }
}

// DELETE a user by ID
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFoundResponse("User");
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return createSuccessResponse(null, "User deleted successfully");

  } catch (error) {
    return handleDatabaseError(error, "delete user");
  }
}
