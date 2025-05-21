import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Stats API called');
    
    // Get total meetings
    console.log('Getting meeting count...');
    const meetingCount = await prisma.meeting.count();
    console.log('Meeting count:', meetingCount);
    
    // Get total attendees
    console.log('Getting attendee count...');
    const attendeeCount = await prisma.attendee.count();
    console.log('Attendee count:', attendeeCount);
    
    // Get unique sectors from meetings (since attendees don't have department field)
    console.log('Getting unique sectors...');
    const sectorsData = await prisma.meeting.findMany({
      select: { sector: true },
      distinct: ['sector'],
      where: { sector: { not: null } }
    });
    const sectorsCount = sectorsData.length;
    console.log('Sectors found:', sectorsCount);
    
    // Calculate upcoming meetings
    console.log('Calculating upcoming meetings...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingCount = await prisma.meeting.count({
      where: {
        date: { gte: today }
      }
    });
    console.log('Upcoming meetings:', upcomingCount);
    
    // We don't have checkedIn field, so let's use a placeholder attendance rate
    // In a real app, this would be calculated based on actual check-ins
    const attendanceRate = 85; // Fixed placeholder
    
    // Prepare the response data
    const responseData = {
      totalMeetings: meetingCount,
      totalAttendees: attendeeCount,
      sectorsRepresented: sectorsCount,
      upcomingMeetings: upcomingCount,
      attendanceRate: attendanceRate
    };
    
    console.log('Returning stats data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Detailed error in stats API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
