import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createRouteHandlerClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

interface DestinationData {
  id: string;
  city: string;
  country: string;
  image_url?: string;
  description?: string;
  highlights?: string;
  byline?: string;
  tags?: string[];
}

// Map of country name to flag emoji
const countryToEmoji: Record<string, string> = {
  USA: '🇺🇸',
  'United States': '🇺🇸',
  UK: '🇬🇧',
  'United Kingdom': '🇬🇧',
  France: '🇫🇷',
  Italy: '🇮🇹',
  Japan: '🇯🇵',
  Spain: '🇪🇸',
  Germany: '🇩🇪',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  'New Zealand': '🇳🇿',
  Brazil: '🇧🇷',
  China: '🇨🇳',
  India: '🇮🇳',
  Mexico: '🇲🇽',
  Netherlands: '🇳🇱',
  Greece: '🇬🇷',
  Switzerland: '🇨🇭',
  Sweden: '🇸🇪',
  Norway: '🇳🇴',
  Denmark: '🇩🇰',
  Finland: '🇫🇮',
  Ireland: '🇮🇪',
  Portugal: '🇵🇹',
  Austria: '🇦🇹',
  Belgium: '🇧🇪',
  Thailand: '🇹🇭',
  Indonesia: '🇮🇩',
  Vietnam: '🇻🇳',
  'South Korea': '🇰🇷',
  Russia: '🇷🇺',
  Turkey: '🇹🇷',
  Egypt: '🇪🇬',
  Morocco: '🇲🇦',
  'South Africa': '🇿🇦',
  Argentina: '🇦🇷',
  Chile: '🇨🇱',
  Peru: '🇵🇪',
  Colombia: '🇨🇴',
  Singapore: '🇸🇬',
  Malaysia: '🇲🇾',
  Philippines: '🇵🇭',
  'United Arab Emirates': '🇦🇪',
  UAE: '🇦🇪',
  Poland: '🇵🇱',
  Hungary: '🇭🇺',
  Iceland: '🇮🇸',
  'Czech Republic': '🇨🇿',
  Croatia: '🇭🇷',
  Hawaii: '🌴', // Not a country but often used as destination
};

// Simplified representation of Supabase's tag join table response
interface TagRecord {
  tags: {
    name: string;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params?: { destinationId?: string } }
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = params?.destinationId || searchParams.get('destinationId');
    const city = searchParams.get('city');
    const country = searchParams.get('country');

    // We need either a destination ID or city/country combination
    if (!destinationId && (!city || !country)) {
      return new NextResponse('Destination ID or city/country is required', { status: 400 });
    }

    let destinationData: DestinationData | null = null;

    // If we have a destination ID, fetch the data from Supabase
    if (destinationId) {
      const supabase = await createRouteHandlerClient();
      const { data, error } = await supabase
        .from('destinations')
        .select('id, city, country, image_url, description, highlights, byline')
        .eq('id', destinationId)
        .single();

      if (error || !data) {
        console.error('Error fetching destination data:', error);
        return new NextResponse('Destination not found', { status: 404 });
      }

      // Get tags for this destination
      const { data: tagData, error: tagError } = await supabase
        .from('destination_tags')
        .select('tags(name)')
        .eq('destination_id', destinationId)
        .limit(5);

      // Extract tag names with type safety
      const tags: string[] = [];
      if (!tagError && tagData) {
        // First handle as unknown type, then cast and extract safely
        const rawData = tagData as unknown;
        const records = rawData as TagRecord[];
        records.forEach((record) => {
          if (record.tags && record.tags.name) {
            tags.push(record.tags.name);
          }
        });
      }

      destinationData = {
        ...(data as DestinationData),
        tags,
      };
    } else {
      // Use the provided city/country
      destinationData = {
        id: 'custom',
        city: city!,
        country: country!,
        image_url: searchParams.get('image_url') || undefined,
        description: searchParams.get('description') || undefined,
        highlights: searchParams.get('highlights') || undefined,
        byline: searchParams.get('byline') || undefined,
        tags: searchParams.get('tags')?.split(',') || [],
      };
    }

    // Canvas dimensions
    const width = 1200;
    const height = 630;
    const padding = 0.12; // 12% padding for text content
    const paddingX = width * padding;
    const paddingY = height * padding;
    const contentWidth = width - paddingX * 2;
    const contentHeight = height - paddingY * 2;

    // Create base image with gradient or destination image (full-bleed)
    let imageBuffer;
    if (destinationData.image_url) {
      try {
        // Build absolute URL for fetch
        let imagePath = destinationData.image_url;
        if (imagePath.startsWith('/public/')) {
          imagePath = imagePath.replace(/^\/public/, '');
        }
        const isDev = process.env.NODE_ENV !== 'production';
        const baseUrl = isDev
          ? `http://localhost:3000`
          : process.env.NEXT_PUBLIC_SITE_URL || 'https://withme.travel';
        const imageUrl = imagePath.startsWith('http')
          ? imagePath
          : `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBuffer = await sharp(buffer).resize(width, height, { fit: 'cover' }).toBuffer();
      } catch (imageError) {
        imageBuffer = await createGradientBackground(width, height);
      }
    } else {
      imageBuffer = await createGradientBackground(width, height);
    }

    // Extract highlights from the destination if available
    let highlightItems = '';
    if (destinationData.highlights) {
      const highlightLines = destinationData.highlights
        .split(/\n+/)
        .filter((line) => line.trim().length > 0)
        .slice(0, 4);

      if (highlightLines.length > 0) {
        highlightItems = highlightLines
          .map((line, index) => {
            const cleanLine = line.trim().replace(/^[-•*]\s*/, ''); // Remove bullet points
            // Position highlights in the center with proper wrapping
            // Each highlight is positioned below the previous one
            return `<tspan x="${width / 2}" dy="${index > 0 ? 40 : 0}" class="highlight-item">• ${escapeXml(cleanLine)}</tspan>`;
          })
          .join('');
      }
    }

    // Format tags if available
    const tagsText =
      destinationData.tags && destinationData.tags.length > 0
        ? destinationData.tags
            .slice(0, 5)
            .map((tag) => `#${tag.toLowerCase()}`)
            .join('  ')
        : '';

    // Ensure city and country are non-null for the SVG
    const cityText = destinationData.city || 'Unknown City';
    const countryText = destinationData.country || 'Unknown Country';

    // Get country emoji if available
    const countryEmoji = countryToEmoji[countryText] || '';

    const bylineText = destinationData.byline || '';

    // SVG overlay with white text and semi-transparent black bg for text group
    const svgText = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .logo { font: 800 32px 'Arial', sans-serif; fill: #fff; text-anchor: start; }
          .title { font: bold 60px 'Arial', sans-serif; fill: #fff; text-anchor: start; }
          .location { font: bold 40px 'Arial', sans-serif; fill: #fff; text-anchor: start; opacity: 0.95; }
          .byline { font: 300 20px 'Arial', sans-serif; fill: #fff; text-anchor: start; opacity: 0.9; }
          .tags { font: italic 18px 'Arial', sans-serif; fill: #fff; text-anchor: start; opacity: 0.85; }
          .highlights-title { font: bold 24px 'Arial', sans-serif; fill: #fff; text-anchor: middle; }
          .highlight-item { font: 20px 'Arial', sans-serif; fill: #fff; text-anchor: middle; }
        </style>
        <!-- Semi-transparent overlay for text group -->
        <rect x="${paddingX}" y="${paddingY}" width="${contentWidth}" height="${contentHeight}" fill="rgba(0,0,0,0.45)" rx="32"/>
        <!-- Text content -->
        <g>
          <text x="${paddingX + 20}" y="${paddingY + 40}" class="logo">withme.travel</text>
          <text x="${paddingX + 20}" y="${height - paddingY - 140}" class="title">${escapeXml(cityText)} ${countryEmoji}</text>
          <text x="${paddingX + 20}" y="${height - paddingY - 90}" class="location">${escapeXml(countryText)}</text>
          <text x="${paddingX + 20}" y="${height - paddingY - 50}" class="byline">${escapeXml(bylineText)}</text>
          <text x="${paddingX + 20}" y="${height - paddingY - 20}" class="tags">${escapeXml(tagsText)}</text>
          <text x="${width / 2}" y="${paddingY + 180}" class="highlights-title">Highlights</text>
          <text y="${paddingY + 210}" text-anchor="middle">${highlightItems}</text>
        </g>
      </svg>
    `;

    // Composite the text overlay onto the image
    const finalImage = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return new NextResponse(finalImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating destination thumbnail:', error);
    return new NextResponse('Error generating thumbnail', { status: 500 });
  }
}

// Helper: update createGradientBackground to fill the whole canvas
async function createGradientBackground(width: number, height: number): Promise<Buffer> {
  const bgColor = '#805ad5';
  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgColor}" />
          <stop offset="100%" stop-color="${adjustColor(bgColor, -30)}" />
        </linearGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#gradient)" />
      <rect width="${width}" height="${height}" filter="url(#noise)" opacity="0.1" />
    </svg>
  `;
  return await sharp(Buffer.from(svgContent)).png().toBuffer();
}

// Helper function to make color darker or lighter
function adjustColor(hex: string, amount: number): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Adjust
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  return text
    ? text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    : '';
}

// Helper function to truncate text
function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
}
