import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// POST /api/attendees - Register a new attendee for a meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { meetingId, name, email, designation } = body;
    
    if (!meetingId || !name || !email || !designation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Check if attendee already registered with this email for this meeting
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        meetingId,
        email,
      },
    });

    if (existingAttendee) {
      return NextResponse.json(
        { error: 'You have already registered for this meeting' },
        { status: 400 }
      );
    }

    // Create the attendee
    const attendee = await prisma.attendee.create({
      data: {
        meetingId,
        name,
        email,
        designation,
      },
    });

    return NextResponse.json(attendee, { status: 201 });
  } catch (error) {
    console.error('Error registering attendee:', error);
    return NextResponse.json(
      { error: 'Failed to register attendee' },
      { status: 500 }
    );
  }
}
