import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * Get fields for a form
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient();
    
    const { data, error } = await supabase
      .from(TABLES.FORM_FIELDS)
      .select('*')
      .eq('form_id', formId)
      .order('order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching form fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form fields' },
      { status: 500 }
    );
  }
} 