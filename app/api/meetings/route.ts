import type { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Import Response properly for Next.js App Router API
const Response = globalThis.Response;
const json = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json'
    }
  });
};

// GET /api/meetings - Get all meetings
export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    });

    return json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { title, description, date, location } = body;
    
    if (!title || !description || !date || !location) {
      return json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle both admin and public meeting creation
    let meetingId = body.meetingId;
    
    // For public submissions with no meetingId, generate one
    if (!meetingId && body.sector && body.creatorType) {
      const dateObj = new Date(date);
      const datePart = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '');
      const timePart = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        .replace(/:/g, '')
        .replace(/ /g, '');
      
      meetingId = `047/${body.sector}/${body.creatorType}/${datePart}-${timePart}`;
    }
    
    // Create the meeting with all necessary fields
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        creatorEmail: body.creatorEmail,
        sector: body.sector || 'IDE',  // Default sector if not provided
        creatorType: body.creatorType || 'ORG', // Default creator type if not provided
        meetingId,
      },
    });

    return json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
