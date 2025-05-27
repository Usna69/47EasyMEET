import { NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// Helper function for consistent JSON responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/meetings/[id]/attendees - Get all attendees for a meeting
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id } = await params;
    
    // Validate that the meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });
    
    if (!meeting) {
      return jsonResponse({ error: 'Meeting not found' }, 404);
    }
    
    // Get all attendees for the meeting, explicitly including signature data
    const attendees = await prisma.attendee.findMany({
      where: {
        meetingId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true, 
        phoneNumber: true,
        organization: true,
        designation: true,
        signatureData: true,
        createdAt: true
      }
    });
    
    // Log the presence of signature data for debugging
    attendees.forEach(attendee => {
      if (attendee.signatureData) {
        console.log(`API: Attendee ${attendee.name} has signature data (${attendee.signatureData.length} chars)`);
      } else {
        console.log(`API: Attendee ${attendee.name} has no signature data`);
      }
    });
    
    return jsonResponse(attendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return jsonResponse({ error: 'Failed to fetch attendees' }, 500);
  }
}

// POST /api/meetings/[id]/attendees - Add an attendee to a meeting
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15, params is now a Promise, so we need to await it
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    const { name, email, phoneNumber, designation, organization } = body;
    
    if (!name || !email) {
      return jsonResponse({ error: 'Name and email are required' }, 400);
    }
    
    // Validate that the meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });
    
    if (!meeting) {
      return jsonResponse({ error: 'Meeting not found' }, 404);
    }
    
    // Check if the attendee is already registered
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        email,
        meetingId: id,
      },
    });
    
    if (existingAttendee) {
      return jsonResponse({ error: 'You are already registered for this meeting' }, 409);
    }
    
    // Create the attendee
    const attendee = await prisma.attendee.create({
      data: {
        name,
        email,
        phoneNumber: phoneNumber || '',
        designation: designation || '',
        organization: organization || '',
        meeting: {
          connect: {
            id,
          },
        },
      },
    });
    
    return jsonResponse(attendee, 201);
  } catch (error) {
    console.error('Error creating attendee:', error);
    return jsonResponse({ error: 'Failed to register for the meeting' }, 500);
  }
}
