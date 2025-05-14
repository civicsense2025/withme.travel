import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkAdminAuth } from '@/app/admin/utils/auth';

/**
 * Update destinations for a specific country
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

    const countryName = decodeURIComponent(params.name);

    // Parse the request body
    const { data } = await request.json();

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Filter out any protected fields that shouldn't be updated
    const protectedFields = ['id', 'country', 'created_at', 'updated_at'];
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !protectedFields.includes(key))
    );

    // Add an updated_at field
    sanitizedData.updated_at = new Date().toISOString();

    // Update all destinations in this country with the selected fields
    const { error: updateError } = await supabase
      .from('destinations')
      .update(sanitizedData)
      .eq('country', countryName);

    if (updateError) {
      console.error('Error updating country destinations:', updateError);
      return NextResponse.json(
        { error: 'Failed to update country destinations', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: `All destinations in ${countryName} updated successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in country update endpoint:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
