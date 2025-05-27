import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Handle FormData for file uploads
    const formData = await request.formData();
    
    // Extract form fields
    const meetingId = formData.get('meetingId') as string;
    const file = formData.get('letterhead') as File;
    const password = formData.get('password') as string;
    
    // Validate required fields
    if (!meetingId) {
      return Response.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }
    
    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: 'Letterhead file is required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/jpeg') && file.type !== 'image/jpg') {
      return Response.json(
        { error: 'Only JPG/JPEG image formats are allowed' },
        { status: 400 }
      );
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: 'File size exceeds the limit of 5MB' },
        { status: 400 }
      );
    }
    
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
    
    // Create unique filename
    const timestamp = Date.now();
    const filename = `letterhead-${meetingId}-${timestamp}.jpg`;
    
    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'letterheads');
    await mkdir(uploadDir, { recursive: true });
    
    // Save file to disk
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Update meeting with letterhead path
    const letterheadPath = `/uploads/letterheads/${filename}`;
    
    // Generate a secure code for password protection if a password was provided
    let documentSecretCode = null;
    if (password && password.trim().length > 0) {
      // Generate a random token to use as the secret code
      documentSecretCode = crypto.randomBytes(16).toString('hex');
      
      console.log(`Setting document protection with password for meeting ${meetingId}`);
    }
    
    // Use a more flexible approach for TypeScript compatibility
    const updateData: any = { 
      customLetterhead: letterheadPath,
      // Only set the secret code if a password was provided
      ...(documentSecretCode && { documentSecretCode })
    };
    
    await prisma.meeting.update({
      where: { id: meetingId },
      data: updateData
    });
    
    return Response.json({
      success: true,
      letterheadPath
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error uploading letterhead:', error);
    return Response.json(
      { error: 'Failed to upload letterhead' },
      { status: 500 }
    );
  }
}
