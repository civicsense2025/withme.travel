import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_FORMS_DB } from '@/utils/sample-surveys-db';

// Helper to check if we're in dev mode
function isDevMode(request: NextRequest): boolean {
  const devMode = request.headers.get('x-dev-mode') === 'true';
  const queryDevMode = new URL(request.url).searchParams.get('dev-mode') === 'true';
  return process.env.NODE_ENV !== 'production' || devMode || queryDevMode;
}

/**
 * GET /api/user-testing/survey
 * 
 * List all active surveys
 */
export async function GET(request: NextRequest) {
  try {
    const devMode = isDevMode(request);
    console.log('[API] Survey list request mode:', devMode ? 'DEVELOPMENT' : 'PRODUCTION');
    
    // Always attempt to fetch from database first
    let surveys: any[] = [];
    
    try {
      console.log('[API] Attempting to fetch surveys from database');
      // Import Supabase client
      const { createRouteHandlerClient } = await import('@/utils/supabase/server');
      const { FORM_TABLES } = await import('@/utils/constants/research-tables');
      
      // Create Supabase client
      const supabase = await createRouteHandlerClient();
      
      // Get all active surveys from database
      const { data: dbSurveys, error } = await supabase
        .from(FORM_TABLES.FORMS)
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('[API] Database error fetching surveys:', error);
      } else if (dbSurveys && dbSurveys.length > 0) {
        console.log(`[API] Found ${dbSurveys.length} surveys in database`);
        surveys = dbSurveys;
      } else {
        console.log('[API] No surveys found in database');
      }
    } catch (dbError) {
      console.error('[API] Error accessing database:', dbError);
    }
    
    // If in dev mode and no database results, use sample data
    if (surveys.length === 0 && devMode) {
      console.log('[API] No database results or in dev mode. Using sample data.');
      surveys = SAMPLE_FORMS_DB;
    }
    
    return NextResponse.json({
      surveys: surveys.map(survey => ({
        id: survey.id,
        name: survey.name,
        description: survey.description,
        type: survey.type,
        is_active: survey.is_active,
        created_at: survey.created_at,
        milestones: survey.milestones || []
      }))
    });
  } catch (error) {
    console.error('Error listing surveys:', error);
    return NextResponse.json(
      { error: 'An error occurred while listing surveys' },
      { status: 500 }
    );
  }
} 