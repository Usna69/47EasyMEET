import { NextRequest } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import bcrypt from "bcryptjs";

// API response helper
const json = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
  });
};

// Add dynamic mode to ensure this route is properly rendered server-side
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // For this endpoint, we don't have proper server-side session checking
    // In a production app, you would verify the admin session here

    // In Next.js 15, params is now a Promise, so we need to await it
    const { id } = await params;
    const userId = id;
    const { newPassword } = await request.json();

    // Validate input
    if (!userId || !newPassword) {
      return json(
        { error: "User ID and new password are required" },
        { status: 400 }
      );
    }

    // Find the user to reset password
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // In this demo we're using plain text passwords
    // In a production app, you'd use bcrypt or similar for password hashing
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user record with new password and clear reset request
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordResetRequested: false,
      },
    });

    return json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return json(
      { error: "An error occurred while resetting the password" },
      { status: 500 }
    );
  }
}
