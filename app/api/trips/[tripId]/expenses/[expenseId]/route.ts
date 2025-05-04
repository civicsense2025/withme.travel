import { NextRequest, NextResponse } from 'next/server';
// import { createServerSupabaseClient } from "@/utils/supabase/server"; // Old import
import { createRouteHandlerClient } from '@/utils/supabase/server'; // Use unified client
import { checkTripAccess } from '@/lib/trip-access';
import { z } from 'zod';
import { TABLES } from '@/utils/constants/database';
import type { Database } from '@/types/database.types';

// Define field constants locally since they differ from central constants
const FIELDS = {
  EXPENSES: {
    TRIP_ID: 'trip_id',
  },
};

// Splitwise integration removed; expense operations should use Supabase directly or be implemented here.

// PUT /api/trips/[tripId]/expenses/[expenseId]
// Updates an existing Splitwise expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string; expenseId: string } }
): Promise<NextResponse> {
  try {
    const { tripId, expenseId } = params;
    const supabase = await createRouteHandlerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Expense update endpoint stubbed. Implement Supabase update logic here.
    return NextResponse.json({ error: 'Expense update not implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

// DELETE /api/trips/[tripId]/expenses/[expenseId]
// Deletes a Splitwise expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string; expenseId: string } }
): Promise<NextResponse> {
  try {
    const { tripId, expenseId } = params;
    const supabase = await createRouteHandlerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Expense delete endpoint stubbed. Implement Supabase delete logic here.
    return NextResponse.json({ error: 'Expense delete not implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
