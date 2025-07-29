import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { generatePasswordResetEmailTemplate, generateWelcomeEmailTemplate } from './email-templates';

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
  userName: string,
  baseUrl?: string
): Promise<boolean> {
  try {
    // Use provided baseUrl or fallback to environment variable or localhost
    const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/admin/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"EASYMEETNCCG" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Password Reset Request - EasyMEET System',
      html: generatePasswordResetEmailTemplate(userName, resetUrl),
      replyTo: 'noreply@easymeetnccg.go.ke', // Block replies
      headers: {
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'Precedence': 'bulk'
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Send welcome email with credentials
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  userPassword: string,
  userRole: string,
  baseUrl?: string
): Promise<boolean> {
  try {
    // Use provided baseUrl or fallback to environment variable or localhost
    const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const mailOptions = {
      from: `"EASYMEETNCCG" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to EasyMEET System - Your Account Credentials',
      html: generateWelcomeEmailTemplate(userName, userEmail, userPassword, userRole, appUrl),
      replyTo: 'noreply@easymeetnccg.go.ke', // Block replies
      headers: {
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'Precedence': 'bulk'
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Verify reset token
export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
} 