import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { 
  createSuccessResponse, 
  createErrorResponse,
  handleDatabaseError
} from "@/lib/api-utils";

// GET /api/meetings/recent - Get recent meetings for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const creatorEmail = searchParams.get('creatorEmail');
    
    if (!creatorEmail) {
      return createErrorResponse("Creator email is required", 400);
    }

    // Get user role to determine if admin or creator
    const user = await prisma.user.findUnique({
      where: { email: creatorEmail },
      select: { role: true }
    });
    
    if (!user) {
      return createErrorResponse("User not found", 404);
    }
    
    const isAdmin = user.role === 'ADMIN';

    // Build the query conditionally
    // Admins see all meetings, creators see only their meetings
    const whereClause = {
      ...(creatorEmail && !isAdmin ? { creatorEmail } : {}),
    };

    // Get recent meetings and total count
    const [totalMeetings, recentMeetings] = await Promise.all([
      prisma.meeting.count({ where: whereClause }),
      prisma.meeting.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          location: true,
          meetingType: true,
          onlineMeetingUrl: true,
          creatorEmail: true,
          sector: true,
          meetingCategory: true,
          organization: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              attendees: true,
              resources: true,
            },
          },
        },
        orderBy: {
          date: "desc", // Most recent first
        },
        take: 5, // Limit to 5 recent meetings
      })
    ]);

    return createSuccessResponse({
      meetings: recentMeetings,
      total: totalMeetings,
    }, "Recent meetings fetched successfully");

  } catch (error) {
    return handleDatabaseError(error, "fetch recent meetings");
  }
} 