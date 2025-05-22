import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma client
const prismaClient = new PrismaClient();

// Seed test user (temporary for development)
async function seedTestUser() {
  try {
    // Check if User model exists in the Prisma schema
    const modelExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='User'
    `.then((result: any) => result.length > 0)
      .catch(() => false);
    
    if (!modelExists) {
      console.log('User model not found in database - skipping seed');
      return;
    }
    
    // Check if admin user exists
    const userCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM User WHERE email = 'admin@example.com'
    `.then((result: any) => Number(result[0].count))
      .catch(() => 0);
    
    if (userCount === 0) {
      // Using raw query to avoid TypeScript errors with potentially missing models
      await prisma.$executeRaw`
        INSERT INTO User (id, email, name, password, role, department, designation, createdAt, updatedAt)
        VALUES (
          'admin-user-id', 
          'admin@example.com', 
          'Admin User', 
          'admin123', 
          'ADMIN', 
          'Administration', 
          'System Administrator',
          datetime('now'),
          datetime('now')
        )
      `;
      console.log('Created test admin user');
    }
  } catch (error) {
    console.error('Error seeding test user:', error);
  }
}

// Attempt to seed a test user
seedTestUser().catch(console.error);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' }, { status: 400 }
      );
    }

    // Check if User table exists
    const userTableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='User'
    `.then((result: any) => result.length > 0)
      .catch(() => false);

    if (!userTableExists) {
      console.error('User table does not exist');
      return Response.json(
        { error: 'Authentication service unavailable' }, { status: 500 }
      );
    }

    // Find user by email using raw query to avoid TypeScript errors
    const users = await prisma.$queryRaw`
      SELECT * FROM User WHERE email = ${email}
    `.then((result: any) => result)
      .catch(() => []);

    if (!users || users.length === 0) {
      // For security reasons, don't specify if the email doesn't exist
      return Response.json(
        { error: 'Invalid credentials' }, { status: 401 }
      );
    }

    const user = users[0];
    
    // Since this is a new implementation, we'll temporarily allow direct password matching
    // for testing, but in a real-world scenario, we would use bcrypt.compare
    const isPasswordValid = user.password === password;
    // For bcrypt: const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid credentials' }, { status: 401 }
      );
    }

    // Create a sanitized user object without password
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      designation: user.designation
    };
    
    return Response.json(
      userWithoutPassword, { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Authentication failed' }, { status: 500 }
    );
  }
}
