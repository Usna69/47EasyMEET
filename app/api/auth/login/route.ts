import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { 
  createSuccessResponse, 
  badRequestResponse,
  unauthorizedResponse,
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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return unauthorizedResponse("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return unauthorizedResponse("Invalid credentials");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return createSuccessResponse(
      { user: userWithoutPassword },
      "Login successful"
    );

  } catch (error) {
    return handleDatabaseError(error, "authenticate user");
  }
}
