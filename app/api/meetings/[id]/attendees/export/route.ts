import { NextRequest } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

// GET /api/meetings/[id]/attendees/export - Export attendees as CSV
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = (await context.params);

    // Get all attendees for the meeting
    const attendees = await prisma.attendee.findMany({
      where: {
        meetingId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get meeting details
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return new Response(JSON.stringify({ error: 'Meeting not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone Number', 'Organization', 'Designation', 'Registration Date'];
    
    const rows = attendees.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.phoneNumber || '',
      attendee.organization || '',
      attendee.designation || '',
      new Date(attendee.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Get a safe filename
    const safeTitle = meeting.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `attendees-${safeTitle}.csv`;

    // Return CSV file
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      }
    });
  } catch (error) {
    console.error('Error exporting attendees:', error);
    return new Response(JSON.stringify({ error: 'Failed to export attendees' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
