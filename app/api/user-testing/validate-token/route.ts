import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SAMPLE_FORMS_DB } from '@/utils/sample-surveys-db';

// Schema for token validation request
const TokenValidationSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

/**
 * POST /api/user-testing/validate-token
 * 
 * Validates a user testing token and returns available surveys
 * Returns 401 if token is invalid
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = TokenValidationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { token } = result.data;
    
    // In a real implementation, validate the token against the database
    // For now, we'll just simulate validation
    const isValid = typeof token === 'string' && token.length > 8;
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // In a real implementation, fetch surveys assigned to this token
    // For now, return all sample surveys
    const availableSurveys = SAMPLE_FORMS_DB
      .filter(survey => survey.is_active)
      .map(survey => ({
        id: survey.id,
        name: survey.name,
        description: survey.description,
        type: survey.type
      }));
    
    return NextResponse.json({
      valid: true,
      token,
      surveys: availableSurveys
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'An error occurred while validating the token' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user-testing/validate-token?token=xyz
 * 
 * Alternative GET endpoint that accepts token as query parameter
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from query parameter
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, validate the token against the database
    // For now, we'll just simulate validation
    const isValid = typeof token === 'string' && token.length > 8;
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // In a real implementation, fetch surveys assigned to this token
    // For now, return all sample surveys
    const availableSurveys = SAMPLE_FORMS_DB
      .filter(survey => survey.is_active)
      .map(survey => ({
        id: survey.id,
        name: survey.name,
        description: survey.description,
        type: survey.type
      }));
    
    return NextResponse.json({
      valid: true,
      token,
      surveys: availableSurveys
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'An error occurred while validating the token' },
      { status: 500 }
    );
  }
} 