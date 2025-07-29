// Centralized API response utilities

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Standard response functions
export const createSuccessResponse = <T>(data: T, message?: string): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

export const createErrorResponse = (error: string, status: number = 500): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): Response => {
  const hasMore = (page + 1) * limit < total;
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      hasMore
    }
  };
  
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

// Common error responses
export const notFoundResponse = (resource: string = 'Resource') => 
  createErrorResponse(`${resource} not found`, 404);

export const badRequestResponse = (message: string) => 
  createErrorResponse(message, 400);

export const unauthorizedResponse = (message: string = 'Unauthorized') => 
  createErrorResponse(message, 401);

export const forbiddenResponse = (message: string = 'Forbidden') => 
  createErrorResponse(message, 403);

export const internalServerErrorResponse = (message: string = 'Internal server error') => 
  createErrorResponse(message, 500);

// Validation error response
export const validationErrorResponse = (errors: Record<string, string>) => {
  const errorMessage = Object.values(errors).join(', ');
  return badRequestResponse(errorMessage);
};

// Database error handler
export const handleDatabaseError = (error: any, operation: string): Response => {
  console.error(`Database error during ${operation}:`, error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return badRequestResponse('A record with this information already exists');
  }
  
  if (error.code === 'P2025') {
    return notFoundResponse('Record');
  }
  
  if (error.code === 'P2003') {
    return badRequestResponse('Invalid reference to related record');
  }
  
  return internalServerErrorResponse(`Failed to ${operation}`);
};

// Async error wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<Response> => {
  try {
    const result = await operation();
    return createSuccessResponse(result);
  } catch (error) {
    return handleDatabaseError(error, operationName);
  }
};

// Request validation utilities
export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => !data[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Pagination utilities
export const getPaginationParams = (searchParams: URLSearchParams) => {
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = page * limit;
  
  return { page, limit, skip };
};

// Date utilities for API
export const isDateInPast = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

export const isDateInFuture = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

export const getDateRange = (hours: number) => {
  const now = new Date();
  const hoursAgo = new Date(now.getTime() - (hours * 60 * 60 * 1000));
  return { now, hoursAgo };
}; 