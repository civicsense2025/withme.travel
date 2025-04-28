import { NextResponse } from 'next/server';
import { ApiError, ApiErrorCode, createApiRouter } from '@/utils/api-error';
import { ErrorCategory } from '@/utils/error-logger';

/**
 * API route for handling client-side error logs
 * POST /api/logs/error
 */
async function POST(req: Request) {
  try {
    // Parse the error log from the request body
    const errorLog = await req.json();
    
    // Validate the error log
    if (!errorLog.message) {
      return ApiError.badRequest('Missing required fields', {
        missingFields: ['message']
      }).toResponse();
    }
    
    // Log the error to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error('[CLIENT ERROR]', errorLog);
    }
    
    // In a real application, you would store the error in a database
    // or send it to an error monitoring service like Sentry
    
    // Example: Log to Sentry
    try {
      // This would typically use the Sentry SDK
      // Sentry.captureMessage(errorLog.message, {
      //   level: 'error',
      //   tags: {
      //     category: errorLog.category || ErrorCategory.UNKNOWN,
      //     source: errorLog.source || 'client',
      //   },
      //   extra: errorLog.context || {},
      // });
    } catch (sentryError) {
      console.error('Failed to log error to Sentry:', sentryError);
    }
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling error log:', error);
    return ApiError.internal('Failed to process error log').toResponse();
  }
}

export { POST };

// Alternative pattern using the API router utility:
// export const { POST } = createApiRouter({
//   POST: async (req: Request) => {
//     const errorLog = await req.json();
//     
//     // Process error log...
//     
//     return NextResponse.json({ success: true });
//   }
// }); 