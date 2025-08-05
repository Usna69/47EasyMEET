import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  badRequestResponse,
  notFoundResponse,
  handleDatabaseError,
  validateRequiredFields,
  validateEmail
} from "@/lib/api-utils";
import { validateRegistrationForm, convertValidationErrorsToFormErrors } from "@/lib/validation";
import { isRegistrationOpen } from "@/lib/meeting-utils";

// POST /api/attendees - Register a new attendee for a meeting
export async function POST(request: NextRequest) {
  try {
    // Handle FormData for file uploads
    const formData = await request.formData();

    // Extract form fields
    const meetingId = formData.get("meetingId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("contact") as string;
    const organization = formData.get("organization") as string;
    const designation = formData.get("designation") as string;
    const signatureData = formData.get("signatureData") as string | null;

    // Validate required fields
    const requiredFields = ["meetingId", "name", "email", "contact", "designation"];
    const validation = validateRequiredFields(
      { meetingId, name, email, contact: phoneNumber, designation },
      requiredFields
    );

    if (!validation.isValid) {
      return badRequestResponse(`Missing required fields: ${validation.missingFields.join(", ")}`);
    }

    // Check if meeting exists and get meeting details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return notFoundResponse("Meeting");
    }

    // Check if registration is open
    if (!isRegistrationOpen(meeting.date)) {
      return badRequestResponse("Registration is not open for this meeting");
    }

    // Validate registration form data
    const isInternalMeeting = meeting.meetingCategory === "INTERNAL";
    const formDataForValidation = {
      name,
      email,
      contact: phoneNumber,
      designation,
      organization: organization || ""
    };

    const formValidation = validateRegistrationForm(formDataForValidation, isInternalMeeting);
    
    if (!formValidation.isValid) {
      const formErrors = convertValidationErrorsToFormErrors(formValidation.errors);
      return badRequestResponse(Object.values(formErrors).join(", "));
    }

    // Check if attendee already exists for this meeting
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        meetingId: meetingId,
        email: email,
      },
    });

    if (existingAttendee) {
      return badRequestResponse("You have already registered for this meeting");
    }

    // Create the attendee
    const attendee = await prisma.attendee.create({
      data: {
        name,
        email,
        phoneNumber,
        organization: organization || null,
        designation,
        signatureData: signatureData || null,
        meetingId: meetingId,
      },
    });

    return createSuccessResponse(
      { 
        attendee,
        message: "Registration successful! You will receive a confirmation email shortly."
      },
      "Registration successful"
    );

  } catch (error) {
    return handleDatabaseError(error, "register attendee");
  }
}

// DELETE /api/attendees - Delete an attendee by ID (requires authentication)
export async function DELETE(request: NextRequest) {
  try {
    // Get attendee ID from URL parameters
    const searchParams = new URL(request.url).searchParams;
    const attendeeId = searchParams.get("id");
    const meetingId = searchParams.get("meetingId");
    const authHeader = request.headers.get("Authorization");

    if (!attendeeId) {
      return Response.json(
        { error: "Attendee ID is required" },
        { status: 400 }
      );
    }

    // Verify user is authenticated with the Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract and verify the JWT token
    const token = authHeader.split(" ")[1];
    // In a real application, you would verify the token
    // For this implementation, we'll assume a simplified approach

    // Check if the attendee exists first
    const attendee = await prisma.attendee.findUnique({
      where: { id: attendeeId },
      include: { meeting: true },
    });

    if (!attendee) {
      return Response.json({ error: "Attendee not found" }, { status: 404 });
    }

    // If meetingId is provided, verify the user has permission to delete attendees
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      if (!meeting) {
        return Response.json({ error: "Meeting not found" }, { status: 404 });
      }

      // In a production app, you would decode the JWT token and check permissions
      // For this implementation, we'll assume the client has validated permissions
    }

    // Delete the attendee since we already verified it exists
    await prisma.attendee.delete({
      where: { id: attendeeId },
    });

    return Response.json(
      { message: "Attendee deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting attendee:", error);
    return Response.json(
      { error: "Failed to delete attendee" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }

    // Fetch attendees for the specific user
    const attendees = await prisma.attendee.findMany({
      where: {
        email: userEmail
      },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            location: true,
            meetingType: true,
            sector: true,
            meetingLevel: true,
            restrictedAccess: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      data: attendees
    });

  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}
