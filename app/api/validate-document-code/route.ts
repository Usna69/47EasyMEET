import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, resourceId } = body;
    
    if (!code || !resourceId) {
      return Response.json(
        { error: 'Secret code and resource ID are required' },
        { status: 400 }
      );
    }
    
    // Find the meeting associated with the resource to check its secret code
    const resource = await prisma.meetingResource.findUnique({
      where: { id: resourceId }
    });
    
    if (!resource) {
      return Response.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    // Get the meeting data (use a more flexible approach for TypeScript)
    const meeting = await prisma.meeting.findUnique({
      where: { id: resource.meetingId }
    }) as any; // Use 'any' to handle the new fields
    
    if (!meeting) {
      return Response.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }
    
    // Check if the meeting has a secret code set
    if (!meeting.documentSecretCode) {
      return Response.json(
        { success: true, message: 'No secret code required' }
      );
    }
    
    // Validate the secret code
    if (code !== meeting.documentSecretCode) {
      return Response.json(
        { error: 'Invalid secret code' },
        { status: 403 }
      );
    }
    
    // If code is valid, return success
    return Response.json({
      success: true,
      message: 'Secret code validated successfully'
    });
    
  } catch (error) {
    console.error('Error validating document code:', error);
    return Response.json(
      { error: 'Failed to validate document code' },
      { status: 500 }
    );
  }
}
