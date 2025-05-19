import { NextResponse } from 'next/server';
import { generateActivityIdeasForDestination } from '@/lib/api/activities';

export async function POST(req: Request) {
  try {
    const { destinationId, tripId } = await req.json();
    const result = await generateActivityIdeasForDestination(destinationId, tripId, 10);
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating activities:', error);
    return NextResponse.json({ error: 'Failed to generate activities' }, { status: 500 });
  }
}
