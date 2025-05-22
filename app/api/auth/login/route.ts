import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';

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

// POST /api/auth/login - Authenticate a user
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Admin hardcoded credentials (for fallback)
    if (email === 'Adminmeets@nairobi.go.ke' && password === 'M@ST@meet047') {
      return json({
        success: true,
        user: {
          role: 'ADMIN',
          email: email,
          name: 'Admin User'
        }
      });
    }

    // Check if User table exists
    const userTableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='User'
    `.then((result: any) => result.length > 0)
      .catch(() => false);

    if (!userTableExists) {
      return json({ error: 'Authentication service unavailable' }, { status: 500 });
    }

    // Fetch user by email
    const users = await prisma.$queryRaw`
      SELECT id, name, email, password, role, department, designation
      FROM User 
      WHERE email = ${email}
    `.then((result: any) => result)
      .catch(() => []);

    if (!users || users.length === 0) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // Check password (plain text comparison for this demo)
    if (user.password !== password) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    return json({ error: 'Authentication failed' }, { status: 500 });
  }
}
