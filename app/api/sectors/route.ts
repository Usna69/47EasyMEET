import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all meetings with non-null sectors
    const meetings = await prisma.meeting.findMany({
      where: {
        sector: {
          not: null
        }
      },
      select: {
        sector: true
      },
      distinct: ['sector']
    });
    
    // Extract unique sector values
    const sectors = meetings
      .map((meeting: { sector: string | null }) => meeting.sector)
      .filter((sector: string | null): sector is string => !!sector); // Filter out null/undefined values
    
    return new NextResponse(
      JSON.stringify({ sectors }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch sectors' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
