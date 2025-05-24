import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: Request) {
  // Force a new query each time by adding a timestamp to prevent caching
  const url = new URL(request.url);
  const headersList = headers();
  
  console.log('Stats API called with params:', Object.fromEntries(url.searchParams.entries()));
  
  // Force a database connection refresh and clear the query cache
  await prisma.$disconnect();
  await prisma.$connect();
  
  // Clear any cached data from memory
  global.gc && global.gc();
  try {
    console.log('Fetching stats data...');
    
    // Use the same filter criteria for all stats to ensure consistency
    // We'll only count meetings that were explicitly created by users (not from seed data)
    const userCreatedFilter = {
      creatorEmail: { not: null },
    };
    
    // Get total meetings count with a fresh query (no filter)
    const allMeetingsCount = await prisma.meeting.count();
    console.log('ALL meetings in database:', allMeetingsCount);
    
    // Get total user-created meetings count
    const meetingCount = await prisma.meeting.count({
      where: userCreatedFilter
    });
    console.log('Total user-created meetings:', meetingCount);
    
    // Get total attendees count for user-created meetings
    const userMeetingIds = await prisma.meeting.findMany({
      where: userCreatedFilter,
      select: { id: true }
    });
    
    const meetingIdList = userMeetingIds.map(m => m.id);
    
    const attendeeCount = await prisma.attendee.count({
      where: {
        meetingId: { in: meetingIdList }
      }
    });
    console.log('Total attendees for user-created meetings:', attendeeCount);
    
    // Get unique sectors represented in user-created meetings
    const sectorsData = await prisma.meeting.findMany({
      select: { sector: true },
      distinct: ["sector"],
      where: { 
        ...userCreatedFilter,
        sector: { not: null } 
      },
    });
    const sectorsCount = sectorsData.length;
    console.log('Sectors represented in user-created meetings:', sectorsCount);

    // Get upcoming user-created meetings (meetings that haven't started yet)
    // This should match the same definition used in the meetings API with ?active=true
    const now = new Date();
    
    const upcomingCount = await prisma.meeting.count({
      where: {
        ...userCreatedFilter,
        date: { gte: now }, // Use current time instead of midnight to exclude ongoing meetings
      },
    });
    console.log('Upcoming user-created meetings:', upcomingCount);
    
    // Get ongoing user-created meetings (started but within 2-hour registration window)
    const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
    const ongoingCount = await prisma.meeting.count({
      where: {
        ...userCreatedFilter,
        date: { 
          gte: twoHoursAgo,
          lt: now
        },
      },
    });
    console.log('Ongoing user-created meetings:', ongoingCount);

    // Calculate actual attendance rate based on real data
    // First, get all past meetings with their associated attendees
    // Our approach: Compare expected attendance with actual attendance
    
    // Get all past meetings
    const pastMeetings = await prisma.meeting.findMany({
      where: {
        ...userCreatedFilter,
        date: { lt: now }, // Only past meetings (use the 'now' variable we defined earlier)
      },
      include: {
        attendees: true, // Include the actual attendees
      },
    });
    
    console.log(`Found ${pastMeetings.length} past meetings for attendance calculation`);
    
    // Calculate attendance rate
    let attendanceRate = 0;
    
    if (pastMeetings.length > 0) {
      // Count the total number of attendees across all past meetings
      const totalActualAttendees = pastMeetings.reduce((sum, meeting) => {
        return sum + meeting.attendees.length;
      }, 0);
      
      // For expected attendance, we'll use a standard estimated value based on meeting type
      // This is a reasonable approach since we don't have a capacity field
      const totalExpectedAttendees = pastMeetings.reduce((sum, meeting) => {
        // Estimate expected attendance based on meeting type
        // Physical meetings typically have more expected attendees than online ones
        const expectedPerMeeting = meeting.meetingType === 'PHYSICAL' ? 25 : 15;
        return sum + expectedPerMeeting;
      }, 0);
      
      // Calculate the rate if we have expected attendees (avoid division by zero)
      if (totalExpectedAttendees > 0) {
        attendanceRate = Math.round((totalActualAttendees / totalExpectedAttendees) * 100);
        // Cap at 100% for display purposes if more people attended than expected
        attendanceRate = Math.min(attendanceRate, 100);
      }
      
      console.log(`Attendance calculation: ${totalActualAttendees} actual attendees / ${totalExpectedAttendees} expected = ${attendanceRate}%`);
    } else {
      // If no past meetings, set attendance rate to 0
      attendanceRate = 0;
      console.log('No past meetings found, setting attendance rate to 0%');
    }

    const responseData = {
      totalMeetings: meetingCount,
      totalAttendees: attendeeCount,
      sectorsRepresented: sectorsCount,
      upcomingMeetings: upcomingCount,
      ongoingMeetings: ongoingCount, // Add ongoing meetings count
      attendanceRate: attendanceRate,
      timestamp: new Date().toISOString() // Add timestamp to show when stats were generated
    };
    
    console.log('Returning stats data:', responseData);

    // Create a response with cache control headers
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

    // Return error with cache control headers
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
