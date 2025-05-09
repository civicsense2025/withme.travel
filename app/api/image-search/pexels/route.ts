import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

// Pexels API endpoint
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }
    
    // Check for API key
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey) {
      return NextResponse.json(
        { error: 'Pexels API key is not configured' }, 
        { status: 500 }
      );
    }
    
    // Ensure the user is authenticated
    const supabase = await createRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Search Pexels API
    const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=15`, {
      headers: {
        'Authorization': pexelsApiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error searching Pexels:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search Pexels' }, 
      { status: 500 }
    );
  }
} 