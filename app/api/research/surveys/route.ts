/**
 * API routes for surveys
 */
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { FORM_TABLES } from '@/utils/constants/tables';

// Schema for survey validation
const SurveySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string().default('survey'),
  config: z.object({
    fields: z.array(
      z.object({
        label: z.string().min(1, 'Question text is required'),
        type: z.enum(['text', 'textarea', 'radio', 'checkbox', 'select', 'rating']),
        required: z.boolean().default(false),
        options: z.array(
          z.object({
            value: z.string(),
            label: z.string()
          })
        ).optional(),
        milestone: z.string().optional(),
        order: z.number().optional()
      })
    ).min(1, 'At least one question is required')
  })
});

/**
 * GET handler for retrieving all surveys
 */
export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Use the forms table as defined in the documentation
    const { data, error } = await supabase
      .from(FORM_TABLES.FORMS)
      .select('*, response_count:form_responses(form_id)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching surveys:', error);
      return NextResponse.json(
        { error: 'Failed to fetch surveys' },
        { status: 500 }
      );
    }
    
    // Process the response data to include response count
    const surveys = data.map(survey => ({
      ...survey,
      response_count: Array.isArray(survey.response_count) ? survey.response_count.length : 0
    }));
    
    return NextResponse.json({ surveys });
  } catch (error) {
    console.error('Error in GET /api/research/surveys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new survey
 */
export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const body = await request.json();
    
    // Validate the request body
    const validationResult = SurveySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid survey data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const survey = validationResult.data;
    
    // Create the survey in the forms table
    const { data, error } = await supabase
      .from(FORM_TABLES.FORMS)
      .insert({
        name: survey.name,
        description: survey.description || '',
        type: survey.type,
        config: survey.config,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating survey:', error);
      return NextResponse.json(
        { error: 'Failed to create survey' },
        { status: 500 }
      );
    }
    
    // If the survey has fields, insert them into form_fields
    if (survey.config.fields && survey.config.fields.length > 0) {
      const fields = survey.config.fields.map((field, index) => ({
        form_id: data.id,
        label: field.label,
        type: field.type,
        options: field.options || null,
        required: field.required || false,
        order: field.order || index,
        milestone: field.milestone || null
      }));
      
      const { error: fieldsError } = await supabase
        .from(FORM_TABLES.FORM_FIELDS)
        .insert(fields);
      
      if (fieldsError) {
        console.error('Error inserting form fields:', fieldsError);
        // Continue as the main form was created successfully
      }
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/research/surveys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
