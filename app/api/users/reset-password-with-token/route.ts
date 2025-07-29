import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { isTokenExpired } from "../../../../lib/email";

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

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    // Validate input
    if (!token || !newPassword) {
      return json(
        { error: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Check if token is expired
    if (!user.passwordResetTokenExpiry || isTokenExpired(user.passwordResetTokenExpiry)) {
      return json({ error: "Reset token has expired" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetRequested: false,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
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