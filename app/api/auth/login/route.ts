import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
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

// POST /api/auth/login - Authenticate a user
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const isValidPassword = await bcrypt.compare(
      password,
      "$2b$10$VJZLOxlp8Y6nXMvUhnF6U.T4Gs01PxRgPZmVE5cWDAtCBsmaO459O"
    );
    // Admin hardcoded credentials (for fallback)
    if (email === "Adminmeets@nairobi.go.ke" && isValidPassword) {
      return json({
        success: true,
        user: {
          role: "ADMIN",
          email: email,
          name: "Admin User",
        },
      });
    }

    // Fetch user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    // Check password (plain text comparison for this demo)
    if (!validPassword) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error authenticating user:", error);
    return json({ error: "Authentication failed" }, { status: 500 });
  }
}
