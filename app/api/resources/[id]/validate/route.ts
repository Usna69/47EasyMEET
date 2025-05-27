import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * POST handler for validating a password for a protected resource
 * Returns a token if the password is valid
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the resource ID from the params
    const resourceId = params.id;
    
    // Parse the request body to get the password
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Fetch the resource from the database to check if it exists and is password protected
    const resource = await prisma.meetingResource.findUnique({
      where: {
        id: resourceId,
      },
      include: {
        // Include the meeting to check for password protection
        meeting: true
      }
    });
    
    // If the resource doesn't exist, return a 404
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    // If the meeting has no password protection, return an error
    if (!resource.meeting?.documentSecretCode) {
      return NextResponse.json(
        { error: 'This resource is not password protected' },
        { status: 400 }
      );
    }
    
    // Check if the provided password matches the expected password
    // In a real implementation, you would use a proper password hashing and verification system
    // For simplicity, we're using a direct comparison here
    const correctPassword = await validateResourcePassword(resource.meeting.id, password);
    
    if (!correctPassword) {
      // Intentionally add a delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    // If the password is correct, generate a token
    // In a production app, you would use a proper JWT with signing
    // For simplicity, we're just using the resource ID as the token
    const token = resourceId;
    
    // Return the token
    return NextResponse.json({ token });
    
  } catch (error) {
    console.error('Error validating resource password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validates a password for a meeting
 * @param meetingId The meeting ID
 * @param password The password to validate
 * @returns A boolean indicating if the password is valid
 */
async function validateResourcePassword(meetingId: string, password: string): Promise<boolean> {
  // In a real implementation, this would use a proper password hashing and verification system
  // For demonstration purposes, we're just checking if the meeting has document protection and
  // if the password matches a simple hash (could be improved with proper password hashing)
  
  try {
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      select: {
        documentSecretCode: true,
      }
    });
    
    if (!meeting?.documentSecretCode) {
      return false;
    }
    
    // Simple verification - in real production, use a proper password verification
    // This is just for demo purposes
    // In reality, you would hash the password with the same salt and compare the hashes
    
    // Create a simple hash of the password to compare (not secure, just for demo)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password + meetingId) // Using meeting ID as salt for simplicity
      .digest('hex');
    
    // Check if the last 8 characters of the hashed password match the first 8 of the secret code
    // (This is a very simplified and insecure approach, just for demonstration)
    const passwordHash = hashedPassword.slice(-8);
    const secretCodeStart = meeting.documentSecretCode.slice(0, 8);
    
    return passwordHash === secretCodeStart;
    
  } catch (error) {
    console.error('Error validating resource password:', error);
    return false;
  }
}
