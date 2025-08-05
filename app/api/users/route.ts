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
import { sendWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

// Generate a temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
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
          userLevel: true,
          customRole: true,
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
    const { 
      name, 
      email, 
      password, 
      role, 
      department, 
      designation, 
      userLevel,
      customRole,
      userLetterheadPath,
      swgLetterheadPath
    } = body;

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

    // Extract the request origin for dynamic URL generation
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^\/]*$/, '') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('Request origin for welcome email:', origin);

    // Generate temporary password if not provided or empty
    const tempPassword = (password && password.trim()) ? password : generateTemporaryPassword();
    console.log('Password provided:', !!password, 'Using temp password:', !password || !password.trim());
    
    // Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        department: department || null,
        designation: designation || null,
        userLevel: userLevel || "REGULAR",
        customRole: customRole || null,
        userLetterhead: role === "VIEW_ONLY" ? null : (userLetterheadPath || null),
        swgLetterhead: role === "VIEW_ONLY" ? null : (swgLetterheadPath || null),
        isFirstLogin: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        userLevel: true,
        customRole: true,
        createdAt: true,
        isFirstLogin: true,
      },
    });

    // Send welcome email with credentials and dynamic base URL
    try {
      await sendWelcomeEmail(
        user.email,
        user.name,
        tempPassword,
        user.role,
        origin
      );
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    return createSuccessResponse(user, "User created successfully");

  } catch (error) {
    return handleDatabaseError(error, "create user");
  }
}
