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
    const body = await request.json();
    console.log(body);
    // Validate required fields
    const {
      title,
      description,
      date,
      location,
      sector,
      creatorType,
      meetingCategory,
    } = body;

    if (
      !title &&
      !description &&
      !date &&
      !location &&
      !sector &&
      !creatorType &&
      !meetingCategory
    ) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Update the meeting
    let updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (location) updateData.location = location;
    if (sector) updateData.sector = sector;
    if (creatorType) updateData.creatorType = creatorType;
    if (meetingCategory) updateData.meetingCategory = meetingCategory;

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
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
