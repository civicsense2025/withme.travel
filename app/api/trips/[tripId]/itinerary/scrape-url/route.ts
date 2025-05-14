import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// Helper function to extract meta tag content using basic string matching
function extractMetaContent(html: string, property: string): string | null {
  // Try finding property="og:..."
  let regex = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    'i'
  );
  let match = html.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  // Try finding name="..." (for description)
  regex = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  match = html.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

// Helper function to extract title tag content
function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match && match[1] ? match[1].trim() : null;
}

// Helper function to extract canonical URL
function extractCanonicalUrl(html: string): string | null {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  return match && match[1] ? match[1].trim() : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = await createRouteHandlerClient();

  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  }

  try {
    // 1. Authentication and Authorization
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Scrape URL Error: Auth failed', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Check if the user is a member of the trip with sufficient permissions
    const { data: memberData, error: memberError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !memberData) {
      console.error('Scrape URL Error: Failed to check membership or not a member', memberError);
      return NextResponse.json({ error: 'You must be a member of this trip.' }, { status: 403 });
    }

    const role = memberData.role;
    const canEdit = role === TRIP_ROLES.ADMIN || role === TRIP_ROLES.EDITOR;

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to add itinerary items to this trip.' },
        { status: 403 }
      );
    }

    // 2. Parse Request Body
    let urlToScrape: string;
    try {
      const body = await request.json();
      if (!body.url || typeof body.url !== 'string') {
        throw new Error('Missing or invalid URL in request body');
      }
      urlToScrape = body.url;
      // Basic URL validation
      new URL(urlToScrape);
    } catch (parseError: any) {
      console.error('Scrape URL Error: Invalid request body', parseError);
      return NextResponse.json(
        { error: `Invalid request: ${parseError.message}` },
        { status: 400 }
      );
    }

    // 3. Fetch External URL Content
    let htmlContent: string;
    try {
      console.log(`Scraping URL: ${urlToScrape}`);
      const response = await fetch(urlToScrape, {
        headers: {
          // Attempt to mimic a browser to avoid simple blocks
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow', // Follow redirects
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      // Check content type - only proceed if it looks like HTML
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        console.warn(
          `Scrape URL Warning: Content type is not HTML (${contentType}) for URL: ${urlToScrape}`
        );
        // Don't throw an error, just return minimal data or indicate non-HTML
        return NextResponse.json(
          {
            scrapedUrl: urlToScrape,
            title: urlToScrape, // Fallback title
            description: `Could not scrape content (content type: ${contentType || 'unknown'}).`,
            imageUrl: null,
          },
          { status: 200 }
        );
      }
      htmlContent = await response.text();
      console.log(
        `Successfully fetched content from ${urlToScrape} (length: ${htmlContent.length})`
      );
    } catch (fetchError: any) {
      console.error(`Scrape URL Error: Failed to fetch ${urlToScrape}`, fetchError);
      return NextResponse.json(
        { error: `Failed to fetch the provided URL: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // 4. Extract Metadata (using basic string matching)
    const scrapedData = {
      title: extractMetaContent(htmlContent, 'og:title') || extractTitle(htmlContent),
      description:
        extractMetaContent(htmlContent, 'og:description') ||
        extractMetaContent(htmlContent, 'description'),
      imageUrl: extractMetaContent(htmlContent, 'og:image'),
      scrapedUrl:
        extractCanonicalUrl(htmlContent) ||
        extractMetaContent(htmlContent, 'og:url') ||
        urlToScrape,
    };

    console.log('Scraped data:', scrapedData);

    // 5. Return Scraped Data
    return NextResponse.json(scrapedData, { status: 200 });
  } catch (error: any) {
    console.error('Scrape URL Error: Unexpected error', error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
