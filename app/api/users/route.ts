import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { 
  createSuccessResponse, 
  createPaginatedResponse,
  handleDatabaseError,
  getPaginationParams,
  badRequestResponse,
  unauthorizedResponse
} from "@/lib/api-utils";
import { validateUserForm, convertValidationErrorsToFormErrors } from "@/lib/validation";
import bcrypt from "bcryptjs";

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorizedResponse("Authentication required");
    }

    const { page, limit, skip } = getPaginationParams(new URL(request.url).searchParams);

    // Get users with pagination
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      })
    ]);

    return createPaginatedResponse(users, page, limit, total);

  } catch (error) {
    return handleDatabaseError(error, "fetch users");
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, department, designation, letterheadPath } = body;

    // Validate user data
    const validation = validateUserForm({ name, email, password, role });
    
    if (!validation.isValid) {
      const formErrors = convertValidationErrorsToFormErrors(validation.errors);
      return badRequestResponse(Object.values(formErrors).join(", "));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return badRequestResponse("A user with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        department: department || null,
        designation: designation || null,
        userLetterhead: letterheadPath || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        createdAt: true,
      },
    });

    return createSuccessResponse(user, "User created successfully");

  } catch (error) {
    return handleDatabaseError(error, "create user");
  }
}
