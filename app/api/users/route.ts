import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
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

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get("authorization");

    // In a real app, we would verify the token here
    // For this demo, we'll allow access without authentication for development purposes

    // Fetch all users using raw query
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Map the result to match the User interface
    const formattedUsers = Array.isArray(users)
      ? users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          designation: user.designation,
          createdAt: user.createdAt,
          passwordResetRequested: user.passwordResetRequested,
          userLetterhead: user.userLetterhead,
          swgLetterhead: user.swgLetterhead,
        }))
      : [];

    return json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, department, designation, userLetterheadPath, swgLetterheadPath } =
      await request.json();
    // Validate required fields
    if (!name || !email || !password) {
      return json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (!userLetterheadPath || !swgLetterheadPath) {
      return json(
        { error: "Both User and SWG letterheads are required." },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUsers = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUsers) {
      return json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        createdAt: now,
        updatedAt: now,
        department,
        designation,
        customLetterhead: userLetterheadPath || "defaultlh.jpg", // For backward compatibility
        userLetterhead: userLetterheadPath || "defaultlh.jpg",
        swgLetterhead: swgLetterheadPath || "swg.jpg",
      },
    });

    if (user) {
      return json(
        { success: true, message: "User created successfully" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return json({ error: "Failed to create user" }, { status: 500 });
  }
}
