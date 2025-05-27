import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add dynamic mode to ensure this route is properly rendered server-side
export const dynamic = 'force-dynamic';

/**
 * GET handler for resource downloads
 * Returns the file with appropriate content type
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the resource ID from the params
    const resourceId = context.params.id;
    
    console.log(`Resource download request for ID: ${resourceId}`);
    
    // Fetch the resource from the database using the MeetingResource model
    const resource = await prisma.meetingResource.findUnique({
      where: {
        id: resourceId,
      },
      include: {
        meeting: true
      }
    });
    
    // If the resource doesn't exist, return a 404
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    // Use the fileUrl from the resource to determine the correct path
    // The fileUrl is typically stored as '/resources/filename.ext'
    let filePath;
    if (resource.fileUrl) {
      // Remove the leading slash if present
      const relativePath = resource.fileUrl.startsWith('/') ? resource.fileUrl.substring(1) : resource.fileUrl;
      filePath = path.join(process.cwd(), 'public', relativePath);
    } else {
      // Fallback to a direct path based on filename
      filePath = path.join(process.cwd(), 'public', 'resources', resource.fileName);
    }
    
    try {
      // Try to read the file
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine the correct content type based on fileType
      let contentType = 'application/octet-stream'; // Default content type
      
      if (resource.fileType.includes('pdf')) {
        contentType = 'application/pdf';
      } else if (resource.fileType.includes('image/jpeg') || resource.fileType.includes('jpg')) {
        contentType = 'image/jpeg';
      } else if (resource.fileType.includes('image/png')) {
        contentType = 'image/png';
      } else if (resource.fileType.includes('application/msword') || resource.fileType.includes('doc')) {
        contentType = 'application/msword';
      } else if (resource.fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
                resource.fileType.includes('docx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (resource.fileType.includes('text/csv') || resource.fileType.includes('csv')) {
        contentType = 'text/csv';
      } else if (resource.fileType.includes('application/vnd.ms-excel') || resource.fileType.includes('xls')) {
        contentType = 'application/vnd.ms-excel';
      } else if (resource.fileType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || 
                resource.fileType.includes('xlsx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      
      // Log the download attempt for debugging
      console.log(`Serving file: ${resource.fileName}, Size: ${fileBuffer.length} bytes, Type: ${contentType}`);
      
      // Set headers for file download - using a plain object for better compatibility
      const headers = {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(resource.fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
        // Disable caching to prevent issues with file downloads
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Return the file as a response
      return new Response(fileBuffer, {
        status: 200,
        headers: headers,
      });
      
    } catch (fileError) {
      console.error('Error reading file:', fileError);
      return NextResponse.json({ error: 'File not found or cannot be read' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Error retrieving resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
