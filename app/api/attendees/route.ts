import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";

// POST /api/attendees - Register a new attendee for a meeting
export async function POST(request: NextRequest) {
  try {
    // Handle FormData for file uploads
    const formData = await request.formData();

    // Extract form fields
    const meetingId = formData.get("meetingId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("contact") as string; // Use contact from form but map to phoneNumber in DB
    const organization = formData.get("organization") as string;
    const designation = formData.get("designation") as string;
    const signatureData = formData.get("signatureData") as string | null;

    // Improved signature data debugging and handling
    if (signatureData && signatureData.trim() !== "") {
      // Only log if signature data exists and isn't empty
      // Verify it's a valid image format
      if (!signatureData.startsWith("data:image")) {
        console.warn(
          "Warning: Signature data received but not in expected image format"
        );
      }
    } else {
      console.log(
        "No signature data received - this is normal for forms without signatures"
      );
      // Ensure signatureData is at least an empty string, not null
      // This prevents database issues when saving
    }

    // Check if meeting exists first
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    // Use any type for flexibility with schema fields
    const meetingData = meeting as any;

    if (!meeting) {
      return Response.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Validate required fields
    const isInternalMeeting = meetingData.meetingCategory === "INTERNAL";
    if (
      !meetingId ||
      !name ||
      !email ||
      !phoneNumber ||
      !designation ||
      (!organization && !isInternalMeeting)
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Signature data is already sent as a base64 string from the canvas

    // Check if registration is open based on meeting start time
    const now = new Date();
    const meetingStartTime = new Date(meeting.date);

    // Calculate registration end time (2 hours after meeting start)
    const registrationEndTime = meeting.registrationEnd
      ? new Date(meeting.registrationEnd)
      : new Date(new Date(meeting.date).getTime() + 2 * 60 * 60 * 1000);

    console.log("Current time:", now);
    console.log("Meeting start time:", meetingStartTime);
    console.log("Registration end time:", registrationEndTime);

    // Check if meeting has started
    if (now < meetingStartTime) {
      return Response.json(
        {
          error:
            "Registration is not yet open. Registration opens when the meeting starts.",
        },
        { status: 400 }
      );
    }

    // Check if meeting date is in the past (more than a day ago)
    // For meetings that happened on a previous day, we consider them ended
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (meetingStartTime < yesterday) {
      return Response.json(
        {
          error: "This meeting has ended. Registration is no longer available.",
        },
        { status: 400 }
      );
    }

    // Check if registration period is closed (2 hours after meeting start)
    if (now > registrationEndTime) {
      return Response.json(
        {
          error:
            "Registration period has ended. Registration closes 2 hours after the meeting starts.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Registration check passed: Meeting is ongoing and within registration window"
    );

    // Check if attendee already registered with this email for this meeting
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        meetingId,
        email,
      },
    });

    if (existingAttendee) {
      return Response.json(
        { error: "You have already registered for this meeting" },
        { status: 400 }
      );
    }

    // Create the attendee with required fields first
    try {
      // Try creating with all fields first
      // Use type assertion to handle schema flexibility
      const attendeeData: any = {
        meetingId,
        name,
        email,
        phoneNumber, // Using phoneNumber field from Prisma schema
        organization,
        designation,
        // Ensure signatureData is always a string, never null
        signatureData: signatureData || "",
      };

      const attendee = await prisma.attendee.create({
        data: attendeeData,
      });
      return Response.json(attendee, { status: 201 });
    } catch (dbError) {
      console.error("First attempt error:", dbError);
      // If that fails, try with just the required fields
      try {
        // Use type assertion to handle schema flexibility
        const fallbackData: any = {
          meetingId,
          name,
          email,
          phoneNumber, // Using phoneNumber field from Prisma schema
          designation,
        };

        const attendee = await prisma.attendee.create({
          data: fallbackData,
        });
        return Response.json(attendee, { status: 201 });
      } catch (fallbackError) {
        console.error("Fallback attempt error:", fallbackError);
        throw fallbackError; // Rethrow to be caught by the outer catch
      }
    }

    // Response is now handled in the nested try-catch
  } catch (error) {
    console.error("Error registering attendee:", error);
    return Response.json(
      { error: "Failed to register attendee" },
      { status: 500 }
    );
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
