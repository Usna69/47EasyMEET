import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const headersList = headers();
  
  console.log('Stats API called with params:', Object.fromEntries(url.searchParams.entries()));
  
  try {
    console.log('Fetching stats data...');
    
    // Use the same filter criteria for all stats to ensure consistency
    const userCreatedFilter = {
      creatorEmail: { not: null },
    };
    
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
    
    // Execute all queries concurrently for better performance
    const [
      allMeetingsCount,
      meetingCount,
      attendeeCount,
      sectorsData,
      upcomingCount,
      ongoingCount,
      pastMeetings
    ] = await Promise.all([
      // Total meetings count
      prisma.meeting.count(),
      
      // User-created meetings count
      prisma.meeting.count({ where: userCreatedFilter }),
      
      // Total attendees for user-created meetings (optimized query)
      prisma.attendee.count({
        where: {
          meeting: {
            creatorEmail: { not: null }
          }
        }
      }),
      
      // Unique sectors
      prisma.meeting.findMany({
        select: { sector: true },
        distinct: ["sector"],
        where: { 
          ...userCreatedFilter,
          sector: { not: null } 
        },
      }),
      
      // Upcoming meetings
      prisma.meeting.count({
        where: {
          ...userCreatedFilter,
          date: { gte: now },
        },
      }),
      
      // Ongoing meetings
      prisma.meeting.count({
        where: {
          ...userCreatedFilter,
          date: { 
            gte: twoHoursAgo,
            lt: now
          },
        },
      }),
      
      // Past meetings with attendees for attendance calculation
      prisma.meeting.findMany({
        where: {
          ...userCreatedFilter,
          date: { lt: now },
        },
        select: {
          meetingType: true,
          attendees: {
            select: { id: true }
          }
        },
      })
    ]);
    
    console.log('ALL meetings in database:', allMeetingsCount);
    console.log('Total user-created meetings:', meetingCount);
    console.log('Total attendees for user-created meetings:', attendeeCount);
    console.log('Sectors represented in user-created meetings:', sectorsData.length);
    console.log('Upcoming user-created meetings:', upcomingCount);
    console.log('Ongoing user-created meetings:', ongoingCount);
    console.log(`Found ${pastMeetings.length} past meetings for attendance calculation`);
    
    // Calculate attendance rate
    let attendanceRate = 0;
    
    if (pastMeetings.length > 0) {
      const totalActualAttendees = pastMeetings.reduce((sum, meeting) => {
        return sum + meeting.attendees.length;
      }, 0);
      
      const totalExpectedAttendees = pastMeetings.reduce((sum, meeting) => {
        const expectedPerMeeting = meeting.meetingType === 'PHYSICAL' ? 25 : 15;
        return sum + expectedPerMeeting;
      }, 0);
      
      if (totalExpectedAttendees > 0) {
        attendanceRate = Math.round((totalActualAttendees / totalExpectedAttendees) * 100);
        attendanceRate = Math.min(attendanceRate, 100);
      }
      
      console.log(`Attendance calculation: ${totalActualAttendees} actual attendees / ${totalExpectedAttendees} expected = ${attendanceRate}%`);
    } else {
      attendanceRate = 0;
      console.log('No past meetings found, setting attendance rate to 0%');
    }

    const responseData = {
      totalMeetings: meetingCount,
      totalAttendees: attendeeCount,
      sectorsRepresented: sectorsData.length,
      upcomingMeetings: upcomingCount,
      ongoingMeetings: ongoingCount,
      attendanceRate: attendanceRate,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Returning stats data:', responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Detailed error in stats API:", error);

    return new Response(JSON.stringify({
      error: "Failed to fetch statistics",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
