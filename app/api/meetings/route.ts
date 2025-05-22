import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const showActive = searchParams.get('active') === 'true';
    const createdBy = searchParams.get('createdBy');
    const creatorEmail = searchParams.get('creatorEmail');
    const department = searchParams.get('department');
    const now = new Date();
    
    // Build the where clause based on query parameters
    let where: any = {};
    
    // Filter by meeting date (active/upcoming meetings)
    if (showActive) {
      where.date = {
        gte: now, // Meeting hasn't started yet
      };
    }
    
    // Note: There is no createdBy field in the Meeting model
    // We're not using the createdBy parameter as it doesn't map to our schema

    // Filter by creator email
    if (creatorEmail) {
      where.creatorEmail = creatorEmail;
    }
    
    // Filter by department
    if (department) {
      where.sector = department;
    }
    
    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      include: {
        _count: {
          select: { attendees: true },
        },
        resources: true,
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
export async function POST(request: Request) {
  try {
    // Handle multipart form data for file uploads
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const location = formData.get('location') as string;
    const sector = formData.get('sector') as string;
    const creatorEmail = formData.get('creatorEmail') as string;
    const creatorType = formData.get('creatorType') as string;
    const meetingType = formData.get('meetingType') as string || 'PHYSICAL';
    const onlineMeetingUrl = formData.get('onlineMeetingUrl') as string;
    const registrationEndStr = formData.get('registrationEnd') as string;
    
    // Validate required fields
    if (!title || !description || !dateStr || !location) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // For online or hybrid meetings, require a meeting URL
    if ((meetingType === 'ONLINE' || meetingType === 'HYBRID') && !onlineMeetingUrl) {
      return json({ error: 'Online meeting URL is required for online and hybrid meetings' }, { status: 400 });
    }
    
    // For hybrid meetings, also require a physical location
    if (meetingType === 'HYBRID' && !location) {
      return json({ error: 'Physical location is required for hybrid meetings' }, { status: 400 });
    }
    
    // Convert date strings to Date objects
    const date = new Date(dateStr);
    
    // Set registration end time (default: 2 hours after meeting start)
    let registrationEnd: Date | undefined;
    if (registrationEndStr) {
      registrationEnd = new Date(registrationEndStr);
    } else {
      registrationEnd = new Date(date);
      registrationEnd.setHours(registrationEnd.getHours() + 2);
    }
    
    // Handle both admin and public meeting creation
    let meetingId = formData.get('meetingId') as string;
    
    // For public submissions with no meetingId, generate one
    if (!meetingId && sector && creatorType) {
      const datePart = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '');
      const timePart = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        .replace(/:/g, '')
        .replace(/ /g, '');
      
      meetingId = `047/${sector}/${creatorType}/${datePart}-${timePart}`;
    }
    
    // Create the meeting with all necessary fields
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date,
        location,
        creatorEmail,
        sector: sector || 'IDE',  // Default sector if not provided
        creatorType: creatorType || 'ORG', // Default creator type if not provided
        meetingId,
        // Add these fields only if they are defined in the schema
        ...(meetingType && { meetingType }),
        ...((meetingType === 'ONLINE' || meetingType === 'HYBRID') && onlineMeetingUrl ? { onlineMeetingUrl } : {}),
        ...(registrationEnd ? { registrationEnd } : {}),
      },
    });
    
    // Process uploaded resource files
    const resourceFiles: { id: string, fileName: string, fileType: string, fileSize: number, fileUrl: string }[] = [];
    
    // Check for resource files in the form data
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.startsWith('resource-') && value instanceof File) {
        const file = value;
        
        // Create unique file ID and name
        const fileId = uuidv4();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileExtension = safeFileName.split('.').pop() || '';
        const storedFileName = `${fileId}.${fileExtension}`;
        
        // Create resources directory if it doesn't exist
        const resourcesDir = join(process.cwd(), 'public', 'resources');
        await mkdir(resourcesDir, { recursive: true });
        
        // Save file to disk
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const filePath = join(resourcesDir, storedFileName);
        await writeFile(filePath, fileBuffer);
        
        // Add file info to resources array
        resourceFiles.push({
          id: fileId,
          fileName: safeFileName,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: `/resources/${storedFileName}`,
        });
      }
    }
    
    // Add resources to the database
    if (resourceFiles.length > 0) {
      // Check if MeetingResource model exists before creating resources
      try {
        // @ts-ignore - Ignoring TypeScript error for prisma.meetingResource
        // This is valid since we know the model exists in our schema
        await Promise.all(
          resourceFiles.map(resource =>
            prisma.meetingResource.create({
              data: {
                meetingId: meeting.id,
                fileName: resource.fileName,
                fileType: resource.fileType,
                fileSize: resource.fileSize,
                fileUrl: resource.fileUrl,
              }
            })
          )
        );
      } catch (error) {
        console.error('Error creating meeting resources:', error);
        // Continue execution even if resource creation fails
      }
    }
    
    // Return the created meeting
    return json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
