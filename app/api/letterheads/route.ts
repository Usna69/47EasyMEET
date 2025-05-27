import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// API route to provide letterhead documents or images based on sector code
// Export configuration to tell Next.js this route should be dynamically rendered
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use the URL constructor directly with the request url
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Get file parameter from URL query string
    const file = searchParams.get('file');
    
    // If no file parameter is provided, return error
    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'File parameter is required' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Sanitize file name to prevent directory traversal attacks
    const sanitizedFileName = file.replace(/\.\.|\/|\\/g, '');
    
    // Determine letterhead file path in public/letterheads directory
    const letterheadPath = path.join(process.cwd(), 'public', 'letterheads', sanitizedFileName);
    
    console.log(`Attempting to serve letterhead file: ${letterheadPath}`);
    
    // Check if letterhead file exists
    if (!fs.existsSync(letterheadPath)) {
      console.error(`Letterhead file not found: ${letterheadPath}`);
      return new NextResponse(JSON.stringify({ error: 'Letterhead file not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Read the file
    const fileData = fs.readFileSync(letterheadPath);
    console.log(`Successfully read letterhead file: ${sanitizedFileName}, size: ${fileData.length} bytes`);
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (sanitizedFileName.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (sanitizedFileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (sanitizedFileName.endsWith('.jpg') || sanitizedFileName.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (sanitizedFileName.endsWith('.png')) {
      contentType = 'image/png';
    }
    
    console.log(`Serving letterhead file with content type: ${contentType}`);
    
    // Return the letterhead file with appropriate content type
    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${sanitizedFileName}"`,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
    
  } catch (error) {
    console.error('Error serving letterhead file:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to serve letterhead file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
