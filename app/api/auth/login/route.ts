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

    // Add request logging for debugging
    console.log(`Login attempt for email: ${email}`);

    // Validate required fields
    const validation = validateRequiredFields({ email, password }, ["email", "password"]);
    if (!validation.isValid) {
      console.log(`Login failed - Missing fields: ${validation.missingFields.join(", ")}`);
      return badRequestResponse(`Missing required fields: ${validation.missingFields.join(", ")}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`Login failed - Invalid email format: ${email}`);
      return badRequestResponse("Invalid email format");
    }

    // Find user by email with better error handling
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email },
      });
    } catch (dbError) {
      console.error(`Database error during login:`, dbError);
      return handleDatabaseError(dbError, "find user during login");
    }

    if (!user) {
      console.log(`Login failed - User not found: ${email}`);
      return unauthorizedResponse("Invalid credentials");
    }

    // Verify password with better error handling
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error(`Password comparison error:`, bcryptError);
      return unauthorizedResponse("Invalid credentials");
    }

    if (!isValidPassword) {
      console.log(`Login failed - Invalid password for user: ${email}`);
      return unauthorizedResponse("Invalid credentials");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`Login successful for user: ${email} (Role: ${user.role})`);

    return createSuccessResponse(
      { user: userWithoutPassword },
      "Login successful"
    );

  } catch (error) {
    console.error(`Unexpected login error:`, error);
    return handleDatabaseError(error, "authenticate user");
  }
}
