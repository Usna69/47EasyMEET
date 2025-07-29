import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { generateResetToken, sendPasswordResetEmail } from '../../../../lib/email';

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
      // Log the attempt for non-existent user
      console.log(`Password reset rejected for non-existent user: ${email}`);
      
      // Return a 400 status to indicate the user doesn't exist
      return Response.json(
        { success: false, message: 'No user is registered with this email address' },
        { status: 400 }
      );
    }
    
    try {
      // Generate a secure reset token
      const resetToken = generateResetToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      // Update user with reset token and expiry
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetRequested: true,
          passwordResetRequestedAt: new Date(),
          passwordResetToken: resetToken,
          passwordResetTokenExpiry: tokenExpiry,
        },
      });
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name
      );
      
      if (emailSent) {
        console.log(`Password reset email sent successfully to: ${email}`);
      return Response.json(
          { success: true, message: 'Password reset link has been sent to your email address' },
        { status: 200 }
      );
      } else {
        console.error(`Failed to send password reset email to: ${email}`);
        return Response.json(
          { error: 'Failed to send password reset email. Please try again later.' },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error('Database error during password reset:', dbError);
      return Response.json(
        { error: 'An error occurred while processing your request. Please try again later.' },
        { status: 500 }
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
