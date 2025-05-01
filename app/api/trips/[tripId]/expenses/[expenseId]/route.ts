import { type NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/utils/supabase/server';
import { DB_TABLES, DB_FIELDS } from '@/utils/constants/database';

// Splitwise integration removed; expense operations should use Supabase directly or be implemented here.

// PUT /api/trips/[tripId]/expenses/[expenseId]
// Updates an existing Splitwise expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  const { tripId, expenseId } = await params;
  // Expense update endpoint stubbed. Implement Supabase update logic here.
  return NextResponse.json({ error: 'Expense update not implemented' }, { status: 501 });
}

// DELETE /api/trips/[tripId]/expenses/[expenseId]
// Deletes a Splitwise expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  const { tripId, expenseId } = await params;
  // Expense delete endpoint stubbed. Implement Supabase delete logic here.
  return NextResponse.json({ error: 'Expense delete not implemented' }, { status: 501 });
}
