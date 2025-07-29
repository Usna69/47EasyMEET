import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { 
  createSuccessResponse, 
  badRequestResponse,
  handleDatabaseError,
  validateRequiredFields
} from "@/lib/api-utils";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    const validation = validateRequiredFields({ email, password }, ["email", "password"]);
    if (!validation.isValid) {
      return badRequestResponse(`Missing required fields: ${validation.missingFields.join(", ")}`);
    }

    // Validate password length
    if (password.length < 6) {
      return badRequestResponse("Password must be at least 6 characters long");
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return badRequestResponse("User not found");
    }

    // Check if user is on first login
    if (!user.isFirstLogin) {
      return badRequestResponse("Password has already been set");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and mark as not first login
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
        isFirstLogin: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        isFirstLogin: true,
      },
    });

    return createSuccessResponse(updatedUser, "Password set successfully");

  } catch (error) {
    return handleDatabaseError(error, "reset first login password");
  }
} 