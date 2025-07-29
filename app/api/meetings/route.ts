import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { 
  createSuccessResponse, 
  createPaginatedResponse,
  handleDatabaseError,
  getPaginationParams,
  getDateRange
} from "@/lib/api-utils";
import { 
  getMeetingDateRange, 
  addStatusToMeetings,
  validateMeetingData,
  generateMeetingId
} from "@/lib/meeting-utils";

// GET /api/meetings - Get all meetings
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const showActive = searchParams.get("active") === "true";
    const showOngoing = searchParams.get("ongoing") === "true";
    const creatorEmail = searchParams.get("creatorEmail");
    const department = searchParams.get("department");
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Build the where clause based on query parameters
    let where: any = {};

    // Filter by meeting date based on filter type
    if (showActive) {
      where.date = getMeetingDateRange('upcoming');
    } else if (showOngoing) {
      where.date = getMeetingDateRange('ongoing');
    }

    // Handle different filtering scenarios
    const isAdminRequest = searchParams.get("isAdmin") === "true";
    const isCreatorRequest = searchParams.get("isCreator") === "true";

    // Apply user-specific filters
    if (creatorEmail && !isAdminRequest) {
      where.creatorEmail = creatorEmail;
    }

    if (department) {
      where.sector = department;
    }

    // Get total count and meetings concurrently
    const [total, meetings] = await Promise.all([
      prisma.meeting.count({ where }),
      prisma.meeting.findMany({
        where,
        orderBy: [
          { createdAt: "desc" },
          { date: "asc" },
        ],
        include: {
          _count: {
            select: { attendees: true },
          },
          resources: true,
        },
        skip,
        take: limit,
      })
    ]);

    // Add status to meetings
    const meetingsWithStatus = addStatusToMeetings(meetings);

    return createPaginatedResponse(meetingsWithStatus, page, limit, total);

  } catch (error) {
    return handleDatabaseError(error, "fetch meetings");
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data for file uploads
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dateStr = formData.get("date") as string;
    const organization = formData.get("organization") as string;
    const location = formData.get("location") as string;
    const creatorEmail = formData.get("creatorEmail") as string;
    const password = formData.get("password") as string;
    const sector = formData.get("sector") as string;
    const creatorType = formData.get("creatorType") as string;
    const meetingId = formData.get("meetingId") as string;
    const meetingCategory = formData.get("meetingCategory") as string;
    const meetingType = formData.get("meetingType") as string;
    const onlineMeetingUrl = formData.get("onlineMeetingUrl") as string;
    const registrationEndStr = formData.get("registrationEnd") as string;
    const selectedLetterheadPath = formData.get("selectedLetterheadPath") as string;

    // Validate meeting data
    const validation = validateMeetingData({
      title,
      date: dateStr,
      location,
      sector,
      meetingCategory
    });

    if (!validation.isValid) {
      return createSuccessResponse(
        { error: validation.errors.join(", ") },
        "Validation failed"
      );
    }

    // Parse date
    const date = new Date(dateStr);

    // Generate meeting ID if not provided
    let finalMeetingId = meetingId;
    if (!finalMeetingId && sector && meetingCategory) {
      finalMeetingId = generateMeetingId(sector, meetingCategory, date);
    }

    // Create the meeting
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date,
        location,
        creatorEmail,
        ...(password ? { password } : {}),
        sector: sector || "IDE",
        creatorType: creatorType || "ORG",
        meetingId: finalMeetingId,
        ...(organization ? { organization } : {}),
        ...(meetingCategory ? { meetingCategory } : {}),
        ...(meetingType && { meetingType }),
        ...(meetingType === "ONLINE" || (meetingType === "HYBRID" && onlineMeetingUrl)
          ? { onlineMeetingUrl }
          : {}),
        ...(registrationEndStr ? { registrationEnd: new Date(registrationEndStr) } : {}),
        customLetterhead: selectedLetterheadPath,
      },
    });

    // Process uploaded resource files if any
    const resourceFiles = formData.getAll("resources") as File[];
    if (resourceFiles.length > 0) {
      const resourcePromises = resourceFiles.map(async (file) => {
        if (file.size > 0) {
          const formDataForResource = new FormData();
          formDataForResource.append("file", file);
          formDataForResource.append("meetingId", meeting.id);

          const response = await fetch("/api/resources", {
            method: "POST",
            body: formDataForResource,
          });

          if (response.ok) {
            return response.json();
          }
        }
      });

      await Promise.all(resourcePromises);
    }

    return createSuccessResponse(meeting, "Meeting created successfully");

  } catch (error) {
    return handleDatabaseError(error, "create meeting");
  }
}
