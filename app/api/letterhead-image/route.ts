import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// This API route serves letterhead images directly from the public folder
// to ensure they're properly loaded with correct content-type headers

// Export configuration to tell Next.js this route should be dynamically rendered
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Use the URL constructor directly with the request url
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const imagePath = searchParams.get('path');
  
  if (!imagePath) {
    return new Response('Image path is required', { status: 400 });
  }
  
  try {
    // Ensure the path is valid and within the public directory
    // This prevents directory traversal attacks
    const validatedPath = path.normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(process.cwd(), 'public', validatedPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return new Response(`Image not found: ${validatedPath}`, { status: 404 });
    }
    
    // Read file
    const file = fs.readFileSync(fullPath);
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (fullPath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (fullPath.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (fullPath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    }
    
    // Return file with proper content type
    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving letterhead image:', error);
    return new Response('Error serving image', { status: 500 });
  }
}
