import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Import Response properly for Next.js App Router API
const Response = globalThis.Response;
const json = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
  });
};

// GET /api/meetings - Get all meetings
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const showActive = searchParams.get("active") === "true";
    const showOngoing = searchParams.get("ongoing") === "true";
    const creatorEmail = searchParams.get("creatorEmail");
    const department = searchParams.get("department");
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "9");
    const now = new Date();

    // Build the where clause based on query parameters
    let where: any = {};

    // Filter by meeting date based on filter type
    if (showActive) {
      // Upcoming meetings: those that haven't started yet
      // Convert the date to ISO string for accurate comparison
      console.log('Filtering for upcoming meetings. Current time:', now);
      where.date = {
        gte: now.toISOString(),
      };
      console.log('Using where clause for upcoming meetings query:', JSON.stringify(where));
    } else if (showOngoing) {
      // Ongoing meetings: those that have started but are still within the 2-hour registration window
      // Based on the meeting registration requirements from memory
      const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
      
      console.log('Filtering for ongoing meetings. Current time:', now);
      console.log('Registration window cutoff (2 hours ago):', twoHoursAgo);
      
      // Between 2 hours ago and now
      where.date = {
        gte: twoHoursAgo.toISOString(),
        lte: now.toISOString(),
      };
      
      console.log('Using where clause for ongoing meetings query:', JSON.stringify(where));
    }

    // Filter by creator email and department
    if (creatorEmail && department) {
      where.OR = [{ creatorEmail }, { sector: department }];
    } else {
      if (creatorEmail) {
        where.creatorEmail = creatorEmail;
      }
      if (department) {
        where.sector = department;
      }
    }

    // Get total count
    const total = await prisma.meeting.count({
      where,
    });

    // Get paginated meetings
    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: [
        // Order by creation date (newest first)
        { createdAt: "desc" },
        // Secondary ordering by meeting date
        { date: "asc" }
      ],
      include: {
        _count: {
          select: { attendees: true },
        },
        resources: true,
      },
      skip: page * limit,
      take: limit,
    });
    
    console.log(`Found ${meetings.length} meetings matching criteria:`, 
      meetings.map(m => ({ id: m.id, title: m.title, date: m.date })));

    // Return the meetings array directly as the client expects
    console.log('Returning API response with meetings count:', meetings.length);
    
    // Add meeting status to each meeting based on the date
    const meetingsWithStatus = meetings.map(meeting => {
      // Calculate meeting status based on registration requirements
      // Meeting registration is only allowed for ongoing meetings (not upcoming ones)
      // Registration closes automatically 2 hours after meeting start
      const meetingDate = new Date(meeting.date);
      const twoHoursAfterStart = new Date(meetingDate.getTime() + (2 * 60 * 60 * 1000));
      
      // Log meeting date information for debugging
      console.log(`Meeting ${meeting.id}: Date=${meetingDate.toISOString()}, Now=${now.toISOString()}`);
      console.log(`  - Is Upcoming: ${meetingDate > now}`);
      
      let status = 'UPCOMING';
      if (meetingDate <= now) {
        if (now <= twoHoursAfterStart) {
          status = 'ONGOING'; // Meeting is in progress and registration is still open
        } else {
          status = 'CLOSED'; // Meeting has ended or registration period is over
        }
      }
      
      return {
        ...meeting,
        status
      };
    });
    
    return json(meetingsWithStatus);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: Request) {
  try {
    // Handle multipart form data for file uploads
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dateStr = formData.get("date") as string;
    const location = formData.get("location") as string;
    const sector = formData.get("sector") as string;
    const creatorEmail = formData.get("creatorEmail") as string;
    const creatorType = formData.get("creatorType") as string;
    const meetingType = (formData.get("meetingType") as string) || "PHYSICAL";
    const meetingCategory =
      (formData.get("meetingCategory") as string) || "INTERNAL";
    const onlineMeetingUrl = formData.get("onlineMeetingUrl") as string;
    const registrationEndStr = formData.get("registrationEnd") as string;

    // Validate required fields
    if (!title || !description || !dateStr || !location) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // For online or hybrid meetings, require a meeting URL
    if (
      (meetingType === "ONLINE" || meetingType === "HYBRID") &&
      !onlineMeetingUrl
    ) {
      return json(
        {
          error:
            "Online meeting URL is required for online and hybrid meetings",
        },
        { status: 400 }
      );
    }

    // For hybrid meetings, also require a physical location
    if (meetingType === "HYBRID" && !location) {
      return json(
        { error: "Physical location is required for hybrid meetings" },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const date = new Date(dateStr);
    
    // Validate that the meeting date is not in the past
    const now = new Date();
    if (date < now) {
      return json({ error: "Cannot create meetings in the past" }, { status: 400 });
    }

    // Set registration end time (default: 2 hours after meeting start)
    let registrationEnd: Date | undefined;
    if (registrationEndStr) {
      registrationEnd = new Date(registrationEndStr);
      
      // Validate that registration end is after meeting start
      if (registrationEnd < date) {
        return json({ error: "Registration end time must be after meeting start time" }, { status: 400 });
      }
    } else {
      registrationEnd = new Date(date);
      registrationEnd.setHours(registrationEnd.getHours() + 2);
    }

    // Handle both admin and public meeting creation
    let meetingId = formData.get("meetingId") as string;

    // For public submissions with no meetingId, generate one
    if (!meetingId && sector && creatorType) {
      // Format date as DDMMYYYY
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const datePart = `${day}${month}${year}`;

      // Format time as HHMM in 24-hour format
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const timePart = `${hours}${minutes}`;

      // Create meeting ID in format: 047/SECTOR_CODE/MEETING_TYPE/DDMMYYYY-HHMM
      // Example: 047/IDE/INT/21052025-1430
      // Meeting types: INT (INTERNAL), EXT (EXTERNAL), STK (STAKEHOLDER)
      const meetingTypeCode =
        meetingCategory === "INTERNAL"
          ? "INT"
          : meetingCategory === "EXTERNAL"
          ? "EXT"
          : meetingCategory === "STAKEHOLDER"
          ? "STK"
          : "INT";

      meetingId = `047/${sector}/${meetingTypeCode}/${datePart}-${timePart}`;
    }

    // Create the meeting with all necessary fields
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date,
        location,
        creatorEmail,
        sector: sector || "IDE", // Default sector if not provided
        creatorType: creatorType || "ORG", // Default creator type if not provided
        meetingId,
        // Add these fields only if they are defined in the schema
        ...(meetingType && { meetingType }),
        ...((meetingType === "ONLINE" || meetingType === "HYBRID") &&
        onlineMeetingUrl
          ? { onlineMeetingUrl }
          : {}),
        ...(registrationEnd ? { registrationEnd } : {}),
      },
    });

    // Process uploaded resource files
    const resourceFiles: {
      id: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      fileUrl: string;
    }[] = [];

    // Check for resource files in the form data
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.startsWith("resource-") && value instanceof File) {
        const file = value;

        // Create unique file ID and name
        const fileId = uuidv4();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileExtension = safeFileName.split(".").pop() || "";
        const storedFileName = `${fileId}.${fileExtension}`;

        // Create resources directory if it doesn't exist
        const resourcesDir = join(process.cwd(), "public", "resources");
        await mkdir(resourcesDir, { recursive: true });

        // Save file to disk
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const filePath = join(resourcesDir, storedFileName);
        await writeFile(filePath, fileBuffer);

        // Add file info to resources array
        resourceFiles.push({
          id: fileId,
          fileName: safeFileName,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: `/resources/${storedFileName}`,
        });
      }
    }

    // Add resources to the database
    if (resourceFiles.length > 0) {
      // Check if MeetingResource model exists before creating resources
      try {
        // @ts-ignore - Ignoring TypeScript error for prisma.meetingResource
        // This is valid since we know the model exists in our schema
        await Promise.all(
          resourceFiles.map((resource) =>
            prisma.meetingResource.create({
              data: {
                meetingId: meeting.id,
                fileName: resource.fileName,
                fileType: resource.fileType,
                fileSize: resource.fileSize,
                fileUrl: resource.fileUrl,
              },
            })
          )
        );
      } catch (error) {
        console.error("Error creating meeting resources:", error);
        // Continue execution even if resource creation fails
      }
    }

    // Return the created meeting
    return json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
