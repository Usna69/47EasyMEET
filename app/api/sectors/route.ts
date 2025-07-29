import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { 
  createSuccessResponse, 
  handleDatabaseError
} from '@/lib/api-utils';

export async function GET(request: NextRequest) {
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
    
    return createSuccessResponse({ sectors }, "Sectors fetched successfully");

  } catch (error) {
    return handleDatabaseError(error, "fetch sectors");
  }
}
