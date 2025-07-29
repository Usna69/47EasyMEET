const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Generate a temporary password
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send welcome email
async function sendWelcomeEmail(userEmail, userName, userPassword, userRole) {
  try {
    // Use environment variable or fallback to localhost
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/admin/login`;
    
    const mailOptions = {
      from: `"EASYMEETNCCG" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to EasyMEET System - Your Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #014a2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">
              <span style="color: #fbbf24;">Easy</span>MEET
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">NCCG Authorized User Access</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #014a2f; margin-bottom: 20px;">Welcome to EasyMEET System</h2>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Hello ${userName},
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Welcome to the EasyMEET system! Your account has been successfully created. 
              Below are your login credentials for your first access to the system.
            </p>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0c4a6e; margin-top: 0;">Your Login Credentials</h3>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin: 10px 0;"><strong>Password:</strong> ${userPassword}</p>
              <p style="margin: 10px 0;"><strong>Role:</strong> ${userRole}</p>
            </div>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              <strong>Important:</strong> For security reasons, you will be required to change your password on your first login.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #014a2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Login to EasyMEET
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #92400e; margin-top: 0;">First Login Instructions</h4>
              <ol style="color: #92400e; margin: 10px 0; padding-left: 20px;">
                <li>Click the "Login to EasyMEET" button above</li>
                <li>Enter your email and temporary password</li>
                <li>You will be redirected to set a new password</li>
                <li>Create a strong password (minimum 6 characters)</li>
                <li>Confirm your new password</li>
                <li>You will then have access to the system</li>
              </ol>
            </div>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                If you have any issues accessing your account, please contact your system administrator.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message from the EasyMEET system.</p>
            <p>Please do not reply to this email.</p>
            <p>Keep your login credentials secure and do not share them with others.</p>
          </div>
        </div>
      `,
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

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'adminmeets@nairobi.go.ke' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists in database');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    
    // Hash the admin password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'adminmeets@nairobi.go.ke',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Administration',
        designation: 'System Administrator',
        isFirstLogin: true
      }
    });

    console.log('Admin user created successfully:');
    console.log('ID:', adminUser.id);
    console.log('Email:', adminUser.email);
    console.log('Name:', adminUser.name);
    console.log('Role:', adminUser.role);
    console.log('Department:', adminUser.department);
    console.log('Temporary Password:', tempPassword);
    
    // Send welcome email
    await sendWelcomeEmail(
      adminUser.email,
      adminUser.name,
      tempPassword,
      adminUser.role
    );
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 