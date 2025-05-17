import { type NextRequest, NextResponse } from 'next/server';
import { listTripMembers, addTripMember, updateTripMember, removeTripMember } from '@/lib/api/tripMembers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await listTripMembers(tripId);
    if (!result.success) {
      return NextResponse.json({ error: result.error, success: false }, { status: 500 });
    }
    return NextResponse.json({ data: result.data, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await request.json();
    // TODO: Add validation for body (user_id, role, etc.)
    const result = await addTripMember(tripId, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error, success: false }, { status: 400 });
    }
    return NextResponse.json({ data: result.data, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const { user_id, ...updateData } = body;
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required', success: false }, { status: 400 });
    }
    const result = await updateTripMember(tripId, user_id, updateData);
    if (!result.success) {
      return NextResponse.json({ error: result.error, success: false }, { status: 400 });
    }
    return NextResponse.json({ data: result.data, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const { user_id } = body;
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required', success: false }, { status: 400 });
    }
    const result = await removeTripMember(tripId, user_id);
    if (!result.success) {
      return NextResponse.json({ error: result.error, success: false }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}

// TODO: Implement advanced features (invites, import, permissions) using lib/api/tripMembers
