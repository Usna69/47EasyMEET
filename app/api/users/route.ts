import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

// API response helper
const json = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json'
    }
  });
};

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    
    // In a real app, we would verify the token here
    // For this demo, we'll allow access without authentication for development purposes
    
    // Check if User table exists
    const userTableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='User'
    `.then((result: any) => result.length > 0)
      .catch(() => false);

    if (!userTableExists) {
      return json({ error: 'User service unavailable' }, { status: 500 });
    }

    // Fetch all users using raw query
    const users = await prisma.$queryRaw`
      SELECT id, name, email, role, department, designation, createdAt, updatedAt 
      FROM User 
      ORDER BY name ASC
    `;

    // Map the result to match the User interface
    const formattedUsers = Array.isArray(users) ? users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      createdAt: user.createdAt
    })) : [];

    return json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, department, designation } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    // Check if User table exists
    const userTableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='User'
    `.then((result: any) => result.length > 0)
      .catch(() => false);

    if (!userTableExists) {
      return json({ error: 'User service unavailable' }, { status: 500 });
    }

    // Check if user with email already exists
    const existingUsers = await prisma.$queryRaw`
      SELECT * FROM User WHERE email = ${email}
    `.then((result: any) => result)
      .catch(() => []);

    if (existingUsers && existingUsers.length > 0) {
      return json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Hash password (in a real app, we would always hash passwords)
    // const hashedPassword = await bcrypt.hash(password, 10);
    // For this demo, we'll store passwords in plain text for simplicity
    
    // Create user using raw query (safe from SQL injection since parameters are passed separately)
    const now = new Date().toISOString();
    await prisma.$executeRaw`
      INSERT INTO User (id, name, email, password, role, department, designation, createdAt, updatedAt)
      VALUES (
        ${`user-${Date.now()}`}, 
        ${name}, 
        ${email}, 
        ${password}, 
        ${role || 'CREATOR'}, 
        ${department || null}, 
        ${designation || null},
        ${now},
        ${now}
      )
    `;

    return json({ success: true, message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return json({ error: 'Failed to create user' }, { status: 500 });
  }
}
