import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Add dynamic mode to ensure this route is properly rendered server-side
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorEmail = searchParams.get('creatorEmail');
    
    if (!creatorEmail) {
      return NextResponse.json(
        { error: "Creator email is required" },
        { status: 400 }
      );
    }

    // Single optimized query to get user role and meetings
    const user = await prisma.user.findUnique({
      where: { email: creatorEmail },
      select: { role: true }
    });
    
    const isAdmin = user?.role === 'ADMIN';

    // Build the query conditionally
    const whereClause = {
      ...(creatorEmail && !isAdmin ? { creatorEmail } : {}),
    };

    // Use Promise.all for concurrent queries
    const [totalMeetings, recentMeetings] = await Promise.all([
      prisma.meeting.count({ where: whereClause }),
      prisma.meeting.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
          meetingType: true,
          onlineMeetingUrl: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        orderBy: {
          date: "desc", // Changed to desc to get most recent first
        },
        take: 5,
      })
    ]);

    return NextResponse.json({
      meetings: recentMeetings,
      total: totalMeetings,
    });
  } catch (error) {
    console.error("Error fetching recent meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent meetings" },
      { status: 500 }
    );
  }
}
