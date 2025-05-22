import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all users with password reset requests
    const users = await prisma.user.findMany({
      where: {
        passwordResetRequested: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordResetRequested: true,
        passwordResetRequestedAt: true,
      },
    });

    return Response.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching password reset requests:', error);
    return Response.json(
      { error: 'An error occurred while fetching password reset requests' },
      { status: 500 }
    );
  }
}
