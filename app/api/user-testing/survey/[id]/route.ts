import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SAMPLE_FORMS_DB, SAMPLE_FORM_FIELDS_DB } from '@/utils/sample-surveys-db';

// Schema for token validation
const TokenSchema = z.string().min(1, 'Token is required');

/**
 * GET /api/user-testing/survey/[id]
 * 
 * Retrieve a survey by ID with optional token validation
 * If token is provided, validate it belongs to the user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Extract token from query parameter
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Validate token if provided (real implementation would check database)
    if (token) {
      try {
        TokenSchema.parse(token);
        // In a real implementation, check that the token is valid for this survey
        // await validateToken(token, id);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }
    
    // Find the survey in our sample data
    const survey = SAMPLE_FORMS_DB.find((survey) => survey.id === id);
    
    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    // Get fields for this survey
    const fields = SAMPLE_FORM_FIELDS_DB.filter((field) => field.form_id === id);
    
    // Return survey with fields
    return NextResponse.json({
      survey: {
        ...survey,
        fields: fields.sort((a, b) => a.order - b.order)
      }
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the survey' },
      { status: 500 }
    );
  }
} 