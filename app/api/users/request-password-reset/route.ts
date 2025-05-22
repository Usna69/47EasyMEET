import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security reasons, but log the issue
      console.log(`Password reset attempted for non-existent user: ${email}`);
      
      // Always return a 200 status with generic message to prevent email enumeration
      return Response.json(
        { success: true, message: 'If your email is registered, a password reset request has been sent to the admin' },
        { status: 200 }
      );
    }
    
    try {
      // Create or update password reset request
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetRequested: true,
          passwordResetRequestedAt: new Date(),
        },
      });
      
      console.log(`Password reset request processed for user: ${email}`);
      
      return Response.json(
        { success: true, message: 'Password reset request sent to admin' },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error during password reset:', dbError);
      // Still return 200 with generic message to prevent user enumeration
      return Response.json(
        { success: true, message: 'If your email is registered, a password reset request has been sent to the admin' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    return Response.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
