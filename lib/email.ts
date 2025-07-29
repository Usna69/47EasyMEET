import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { generatePasswordResetEmailTemplate } from './email-templates';

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Email configuration missing. Please check EMAIL_USER and EMAIL_PASS in .env');
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate a secure reset token
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send password reset email
export async function sendPasswordResetEmail(
  userEmail: string,
  resetToken: string,
  userName: string
): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request - EasyMEET System',
      html: generatePasswordResetEmailTemplate(userName, resetUrl)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Verify reset token
export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
} 