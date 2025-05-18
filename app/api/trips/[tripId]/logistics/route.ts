import { NextRequest, NextResponse } from 'next/server';
import {
  addFormToTrip,
  addAccommodationToTrip,
  addTransportationToTrip,
  listLogisticsItems,
  deleteLogisticsItem
} from '@/lib/api/logistics';
import { checkUserAccessToTrip } from '@/lib/api/trip-auth';

/**
 * GET /api/trips/[tripId]/logistics
 * 
 * Get all logistics items for a trip
 */
export async function GET(
  _request: NextRequest,
  context: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = await context.params;
  
  try {
    // Check user access to trip
    const accessResult = await checkUserAccessToTrip(tripId);
    if (!accessResult.hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access to trip' },
        { status: 403 }
      );
    }
    
    // Get logistics items
    const result = await listLogisticsItems(tripId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ items: result.data });
  } catch (error) {
    console.error('Error in logistics GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logistics items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trips/[tripId]/logistics
 * 
 * Add a new logistics item to a trip
 */
export async function POST(
  request: NextRequest,
  context: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = await context.params;
  
  try {
    // Check user access to trip
    const accessResult = await checkUserAccessToTrip(tripId);
    if (!accessResult.hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access to trip' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { type, ...data } = body;
    
    if (!type) {
      return NextResponse.json(
        { error: 'Item type is required' },
        { status: 400 }
      );
    }
    
    let result;
    
    // Call appropriate function based on item type
    switch (type) {
      case 'form':
        result = await addFormToTrip(tripId, data);
        break;
      case 'accommodation':
        result = await addAccommodationToTrip(tripId, data);
        break;
      case 'transportation':
        result = await addTransportationToTrip(tripId, data);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported logistics item type: ${type}` },
          { status: 400 }
        );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ item: result.data });
  } catch (error) {
    console.error('Error in logistics POST:', error);
    return NextResponse.json(
      { error: 'Failed to add logistics item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trips/[tripId]/logistics/[itemId]
 * 
 * Delete a logistics item
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: { tripId: string; itemId: string } }
): Promise<NextResponse> {
  const { tripId, itemId } = await context.params;
  
  try {
    // Check user access to trip
    const accessResult = await checkUserAccessToTrip(tripId);
    if (!accessResult.hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access to trip' },
        { status: 403 }
      );
    }
    
    // Delete the item
    const result = await deleteLogisticsItem(itemId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in logistics DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to delete logistics item' },
      { status: 500 }
    );
  }
} 