import { NextRequest } from "next/server";
import { safeQuery, DatabaseError } from "../../../../lib/db";
import {
  generateResetToken,
  sendPasswordResetEmail,
} from "../../../../lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Extract the request origin for dynamic URL generation
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/[^\/]*$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    console.log("Request origin for password reset:", origin);

    // Find the user by email
    const findQuery = `
      SELECT id, email, name
      FROM dbo.[User]
      WHERE email = $1
    `;
    const { rows } = await safeQuery<{
      id: string;
      email: string;
      name: string;
    }>(findQuery, [email]);

    if (rows.length === 0) {
      console.log(`Password reset rejected for non-existent user: ${email}`);
      return Response.json(
        {
          success: false,
          message: "No user is registered with this email address",
        },
        { status: 400 },
      );
    }

    const user = rows[0];

    try {
      // Generate a secure reset token
      const resetToken = generateResetToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Update user with reset token and expiry
      const updateQuery = `
        UPDATE dbo.[User]
        SET
          passwordResetRequested = 1,
          passwordResetRequestedAt = SYSUTCDATETIME(),
          passwordResetToken = $1,
          passwordResetTokenExpiry = $2,
          updatedAt = SYSUTCDATETIME()
        WHERE id = $3
      `;
      await safeQuery(updateQuery, [resetToken, tokenExpiry, user.id]);

      // Send password reset email with dynamic base URL
      const emailSent = await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name,
        origin,
      );

      if (emailSent) {
        console.log(`Password reset email sent successfully to: ${email}`);
        return Response.json(
          {
            success: true,
            message: "Password reset link has been sent to your email address",
          },
          { status: 200 },
        );
      } else {
        console.error(`Failed to send password reset email to: ${email}`);
        return Response.json(
          {
            error:
              "Failed to send password reset email. Please try again later.",
          },
          { status: 500 },
        );
      }
    } catch (dbError) {
      console.error("Database error during password reset:", dbError);
      return Response.json(
        {
          error:
            "An error occurred while processing your request. Please try again later.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database connection error during password reset:", error);
      return Response.json(
        { error: "Database connection error. Please try again later." },
        { status: 500 },
      );
    }
    console.error("Password reset request error:", error);
    return Response.json(
      { error: "An error occurred while processing your request" },
      { status: 500 },
    );
  }
}
