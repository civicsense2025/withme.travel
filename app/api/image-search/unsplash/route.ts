import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

// Unsplash API endpoint
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }
    
    // Check for API key
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashAccessKey) {
      return NextResponse.json(
        { error: 'Unsplash API key is not configured' }, 
        { status: 500 }
      );
    }

    // Ensure the user is authenticated
    const supabase = await createRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Search Unsplash API
    const response = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=15`, 
      {
        headers: {
          'Authorization': `Client-ID ${unsplashAccessKey}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error searching Unsplash:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search Unsplash' }, 
      { status: 500 }
    );
  }
} 