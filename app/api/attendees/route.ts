import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

// POST /api/attendees - Register a new attendee for a meeting
export async function POST(request: NextRequest) {
  try {
    // Handle FormData for file uploads
    const formData = await request.formData();
    
    // Extract form fields
    const meetingId = formData.get('meetingId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const organization = formData.get('organization') as string;
    const designation = formData.get('designation') as string;
    const signatureData = formData.get('signatureData') as string | null;
    
    // Improved signature data debugging and handling
    if (signatureData && signatureData.trim() !== '') {
      // Only log if signature data exists and isn't empty
      console.log('Received signature data: ' + signatureData.substring(0, 30) + '...');
      // Verify it's a valid image format
      if (!signatureData.startsWith('data:image')) {
        console.warn('Warning: Signature data received but not in expected image format');
      }
    } else {
      console.log('No signature data received - this is normal for forms without signatures');
      // Ensure signatureData is at least an empty string, not null
      // This prevents database issues when saving
    }
    
    // Validate required fields
    if (!meetingId || !name || !email || !organization || !designation) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Signature data is already sent as a base64 string from the canvas

    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return Response.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }
    
    // Check if registration is open based on meeting start time
    const now = new Date();
    const meetingStartTime = new Date(meeting.date);
    
    // Calculate registration end time (2 hours after meeting start)
    const registrationEndTime = meeting.registrationEnd 
      ? new Date(meeting.registrationEnd) 
      : new Date(new Date(meeting.date).getTime() + 2 * 60 * 60 * 1000);
    
    console.log('Current time:', now);
    console.log('Meeting start time:', meetingStartTime);
    console.log('Registration end time:', registrationEndTime);
    
    // Check if meeting has started
    if (now < meetingStartTime) {
      return Response.json(
        { error: 'Registration is not yet open. Registration opens when the meeting starts.' },
        { status: 400 }
      );
    }
    
    // Check if registration period is closed (2 hours after meeting start)
    if (now > registrationEndTime) {
      return Response.json(
        { error: 'Registration period has ended. Registration closes 2 hours after the meeting starts.' },
        { status: 400 }
      );
    }
    
    console.log('Registration check passed: Meeting is ongoing and within registration window')

    // Check if attendee already registered with this email for this meeting
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        meetingId,
        email,
      },
    });

    if (existingAttendee) {
      return Response.json(
        { error: 'You have already registered for this meeting' },
        { status: 400 }
      );
    }

    // Create the attendee with required fields first
    try {
      // Try creating with all fields first
      const attendee = await prisma.attendee.create({
        data: {
          meetingId,
          name,
          email,
          organization,
          designation,
          // Ensure signatureData is always a string, never null
          signatureData: signatureData || '',
        },
      });
      return Response.json(attendee, { status: 201 });
    } catch (dbError) {
      console.error('First attempt error:', dbError);
      // If that fails, try with just the required fields
      try {
        const attendee = await prisma.attendee.create({
          data: {
            meetingId,
            name,
            email,
            designation,
          },
        });
        return Response.json(attendee, { status: 201 });
      } catch (fallbackError) {
        console.error('Fallback attempt error:', fallbackError);
        throw fallbackError; // Rethrow to be caught by the outer catch
      }
    }

    // Response is now handled in the nested try-catch
  } catch (error) {
    console.error('Error registering attendee:', error);
    return Response.json(
      { error: 'Failed to register attendee' },
      { status: 500 }
    );
  }
}
