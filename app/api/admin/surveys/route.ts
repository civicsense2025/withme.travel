import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FORM_TABLES } from '@/utils/constants/tables';

interface Survey {
  id: string;
  name: string;
  description: string | null;
  type: string;
  config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ResponseCount {
  form_id: string;
  count: number;
}

export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    // Verify the user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch surveys with response counts
    const { data: forms, error: formsError } = await supabase
      .from(FORM_TABLES.FORMS)
      .select(`
        id,
        name,
        description,
        type,
        config,
        is_active,
        created_at,
        updated_at
      `)
      .eq('type', 'survey')
      .order('created_at', { ascending: false });

    if (formsError) {
      console.error('Error fetching surveys:', formsError);
      return NextResponse.json(
        { error: 'Failed to fetch surveys' },
        { status: 500 }
      );
    }

    // Get response counts for each survey using individual count queries
    const responseCounts: ResponseCount[] = [];
    
    for (const form of forms) {
      const { count, error: countError } = await supabase
        .from(FORM_TABLES.FORM_RESPONSES)
        .select('*', { count: 'exact', head: true })
        .eq('form_id', form.id);
        
      if (countError) {
        console.error(`Error counting responses for form ${form.id}:`, countError);
      }
      
      responseCounts.push({
        form_id: form.id,
        count: count || 0
      });
    }

    // Map response counts to surveys
    const surveysWithCounts = forms.map((survey: Survey) => {
      const responseData = responseCounts.find(r => r.form_id === survey.id);
      return {
        ...survey,
        response_count: responseData ? responseData.count : 0
      };
    });

    return NextResponse.json({ surveys: surveysWithCounts });
  } catch (error) {
    console.error('Error in surveys API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
