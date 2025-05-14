import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkAdminAuth } from '@/app/admin/utils/auth';

/**
 * Update destinations for a specific continent
 */
export async function PUT(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    // Check if the user is an admin
    const { isAdmin, supabase, error } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const continentName = decodeURIComponent(params.name);

    // Parse the request body
    const { data } = await request.json();

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Filter out any protected fields that shouldn't be updated
    const protectedFields = ['id', 'continent', 'created_at', 'updated_at'];
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !protectedFields.includes(key))
    );

    // Add an updated_at field
    sanitizedData.updated_at = new Date().toISOString();

    // Update all destinations in this continent with the selected fields
    const { error: updateError } = await supabase
      .from('destinations')
      .update(sanitizedData)
      .eq('continent', continentName);

    if (updateError) {
      console.error('Error updating continent destinations:', updateError);
      return NextResponse.json(
        { error: 'Failed to update continent destinations', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: `All destinations in ${continentName} updated successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in continent update endpoint:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
