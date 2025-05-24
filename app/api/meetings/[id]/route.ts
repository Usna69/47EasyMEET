import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/meetings/[id] - Get a specific meeting
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = (await context.params);

    const meeting = await prisma.meeting.findUnique({
      where: {
        id,
      },
      include: {
        attendees: true,
        resources: true,
        _count: {
          select: {
            attendees: true,
            resources: true,
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

// PUT /api/meetings/[id] - Update a meeting
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = (await context.params);
    console.log('Attempting to update meeting with ID:', id);
    
    // First check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      console.error('Meeting not found with ID:', id);
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    console.log('Found existing meeting:', existingMeeting);
    
    // Get request body
    const body = await request.json();
    console.log('Update request body:', body);
    
    // Basic validation
    if (!body.title || !body.description || !body.date || !body.location) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, date, and location are required" },
        { status: 400 }
      );
    }
    
    // Extremely simplified update logic - only update the most basic fields
    // and preserve everything else from the existing meeting
    const updateData: Record<string, any> = {
      title: body.title,
      description: body.description,
      location: body.location,
      date: new Date(body.date),
      // Keep original values for these fields
      sector: body.sector || existingMeeting.sector,
      creatorEmail: existingMeeting.creatorEmail,
      creatorType: existingMeeting.creatorType,
      meetingId: existingMeeting.meetingId,
    };
    
    // The meetingCategory field is not in the Prisma schema so we should not include it
    // Instead, we need to make sure we include the meetingType field if it exists
    if (body.meetingType || (existingMeeting as any).meetingType) {
      updateData.meetingType = body.meetingType || (existingMeeting as any).meetingType;
    }
    
    // Also include onlineMeetingUrl if it exists
    if (body.onlineMeetingUrl || (existingMeeting as any).onlineMeetingUrl) {
      updateData.onlineMeetingUrl = body.onlineMeetingUrl || (existingMeeting as any).onlineMeetingUrl;
    }
    
    console.log('Final update data:', updateData);

    // Update the meeting with a simplified approach
    try {
      const updatedMeeting = await prisma.meeting.update({
        where: { id },
        data: updateData,
      });

      console.log('Meeting updated successfully:', updatedMeeting);
      return NextResponse.json(updatedMeeting);
    } catch (dbError) {
      console.error('Database error updating meeting:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in meeting update:", error);
    return NextResponse.json(
      { error: `Failed to update meeting: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Delete a meeting
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = (await context.params);

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Delete all attendees associated with the meeting first
    await prisma.attendee.deleteMany({
      where: {
        meetingId: id,
      },
    });

    // Delete the meeting
    await prisma.meeting.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Meeting deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
