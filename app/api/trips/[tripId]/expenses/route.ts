import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { checkTripAccess } from '@/lib/trip-access';
import { z } from 'zod';
import { Database } from '@/types/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user membership
    const { data: tripMembership, error: tripError } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (tripError || !tripMembership) {
      console.error('Error fetching trip membership or not a member:', tripError);
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    // Fetch expenses from the 'expenses' table
    const { data: localExpenses, error: localError } = await supabase
      .from('expenses')
      .select(
        `
        *,
        paid_by_user:profiles!expenses_paid_by_fkey(id, name, email, avatar_url)
      `
      )
      .eq('trip_id', tripId)
      .order('date', { ascending: false });

    if (localError) {
      console.error('Error fetching local expenses:', localError);
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }

    let allExpenses: any[] = localExpenses || [];

    // Group expenses by category
    const categoryMap = allExpenses.reduce(
      (acc: Record<string, number>, expense: any) => {
        const category = expense.category || 'Other';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Number(expense.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    const totalSpent = allExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return NextResponse.json({
      expenses: allExpenses,
      categoryTotals: categoryMap,
      totalSpent,
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user membership
    const { count, error: permissionError } = await supabase
      .from('trip_members')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', tripId)
      .eq('user_id', user.id);

    if (permissionError || count === 0) {
      console.error('Permission error checking trip membership for expense POST:', permissionError);
      return NextResponse.json({ error: 'Forbidden: Not a member of this trip' }, { status: 403 });
    }

    // --- Corrected logic using 'body' ---
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.amount || !body.category || !body.date || !body.paid_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // --- End Corrected logic ---

    const expenseData = {
      trip_id: tripId,
      title: body.name,
      amount: Number(body.amount),
      currency: body.currency || 'USD',
      category: body.category,
      date: body.date,
      paid_by: body.paid_by,
    };

    // Validate amount conversion
    if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount provided' }, { status: 400 });
    }

    const { data: newExpense, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }

    return NextResponse.json({ expense: newExpense });
  } catch (error: any) {
    console.error('Error adding expense:', error);
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while adding the expense.' },
      { status: 500 }
    );
  }
}
