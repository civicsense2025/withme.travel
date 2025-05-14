import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TRIP_ROLES } from '@/utils/constants/status';

export const runtime = 'nodejs';

interface TripData {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  cover_image_url?: string;
  destination_id?: string;
  destinations?: {
    id: string;
    city: string;
    country: string;
    image_url?: string;
  };
  tags?: string[];
  members?: {
    user_id: string;
    role: string;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  }[];
}

interface TagRecord {
  tags: {
    name: string;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params?: { tripId?: string } }
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = params?.tripId || searchParams.get('tripId');

    if (!tripId) {
      return new NextResponse('Trip ID is required', { status: 400 });
    }

    // Fetch trip data from Supabase
    const supabase = await createRouteHandlerClient();
    const { data: trip, error } = await supabase
      .from('trips')
      .select(
        `
        id, 
        name, 
        description, 
        start_date, 
        end_date, 
        cover_image_url, 
        destination_id,
        destinations:${'destinations'}(id, city, country, image_url)
      `
      )
      .eq('id', tripId)
      .single();

    if (error || !trip) {
      console.error('Error fetching trip data:', error);
      return new NextResponse('Trip not found', { status: 404 });
    }

    // Get members for this trip with profiles
    const { data: members, error: membersError } = await supabase
      .from('trip_members')
      .select(
        `
        user_id,
        role,
        profiles:${'profiles'}(full_name, avatar_url)
      `
      )
      .eq('trip_id', tripId);

    if (membersError) {
      console.error('Error fetching trip members:', membersError);
    }

    // Get tags for this trip
    const { data: tagData, error: tagError } = await supabase
      .from('trip_tags')
      .select('tags(name)')
      .eq('trip_id', tripId)
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

    const tripData = {
      ...(trip as unknown as TripData),
      tags,
      members: members || [],
    };

    // Get image URL from trip or its destination
    const imageUrl = tripData.cover_image_url || tripData.destinations?.image_url || null;

    // Prepare dates text
    let dateText = '';
    if (tripData.start_date) {
      const startDate = new Date(tripData.start_date);
      dateText = `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

      if (tripData.end_date) {
        const endDate = new Date(tripData.end_date);
        dateText = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    }

    // Destination text with null safety
    const destinationText =
      tripData.destinations && tripData.destinations.city && tripData.destinations.country
        ? `${tripData.destinations.city}, ${tripData.destinations.country}`
        : 'No destination specified';

    // Format tags if available with null safety
    const tagsText =
      tripData.tags && tripData.tags.length > 0
        ? tripData.tags
            .slice(0, 5)
            .map((tag) => `#${tag.toLowerCase()}`)
            .join('  ')
        : '';

    // Ensure trip name is never null/undefined
    const tripName = tripData.name || 'Trip Plan';

    // Canvas dimensions
    const width = 1200;
    const height = 630;
    const padding = 0.12; // 12% padding for text content
    const paddingX = width * padding;
    const paddingY = height * padding;
    const contentWidth = width - paddingX * 2;
    const contentHeight = height - paddingY * 2;

    // Create base image with gradient or trip image (full-bleed)
    let imageBuffer;
    if (imageUrl) {
      try {
        const formattedImageUrl = imageUrl.startsWith('http')
          ? imageUrl
          : imageUrl.startsWith('/')
            ? `/public${imageUrl}`
            : `/public/${imageUrl}`;
        const imageResponse = await fetch(formattedImageUrl);
        if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${formattedImageUrl}`);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBuffer = await sharp(buffer).resize(width, height, { fit: 'cover' }).toBuffer();
      } catch (imageError) {
        imageBuffer = await createGradientBackground(width, height);
      }
    } else {
      imageBuffer = await createGradientBackground(width, height);
    }

    // Prepare member avatars text
    let membersText = '';
    const admin = tripData.members?.find((m) => m.role === TRIP_ROLES.ADMIN);

    // Extract admin name safely using first_name
    let adminName = 'Someone';
    let adminInitials = 'A';
    if (admin && admin.profiles) {
      const profileData = admin.profiles as any;
      if (profileData && profileData.first_name) {
        adminName = profileData.first_name;
        if (profileData.last_name) {
          adminInitials =
            `${profileData.first_name[0] || ''}${profileData.last_name[0] || ''}`.toUpperCase();
        } else {
          adminInitials = (profileData.first_name[0] || 'A').toUpperCase();
        }
      } else if (profileData && profileData.email) {
        adminName = profileData.email;
        adminInitials = (profileData.email[0] || 'A').toUpperCase();
      }
    }
    const totalMembers = tripData.members?.length || 0;
    if (totalMembers > 1) {
      membersText = `Join ${adminName} and ${totalMembers - 1} others on this trip 🤝`;
    } else if (totalMembers === 1) {
      membersText = `Join ${adminName} on this trip 🤝`;
    } else {
      membersText = 'Start planning your trip with friends 🤝';
    }

    // Avatar placeholder logic (for future SVG rendering)
    let adminAvatarUrl = '';
    if (admin && admin.profiles && (admin.profiles as any).avatar_url) {
      adminAvatarUrl = (admin.profiles as any).avatar_url;
    } else {
      // Use ui-avatars.com as a fallback
      adminAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminInitials)}&background=3b82f6&color=fff&size=128`;
    }

    // Tagline for under the logo, using brand voice
    const tagline = 'Group trips without the group headaches. Plan together WithMe.';

    // SVG overlay with white text (no faded overlay)
    const svgText = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .logo { font: 800 32px 'Arial', sans-serif; fill: #fff; text-anchor: start; }
          .tagline { font: 400 22px 'Arial', sans-serif; fill: #fff; text-anchor: start; opacity: 0.92; }
          .title { font: bold 60px 'Arial', sans-serif; fill: #fff; text-anchor: start; }
          .location { font: bold 36px 'Arial', sans-serif; fill: #fff; text-anchor: start; opacity: 0.95; }
          .dates { font: 24px 'Arial', sans-serif; fill: #fff; text-anchor: start; opacity: 0.9; }
          .tags { font: italic 18px 'Arial', sans-serif; fill: #fff; text-anchor: start; opacity: 0.85; }
          .members { font: 20px 'Arial', sans-serif; fill: #fff; text-anchor: start; }
          .cta-button { fill: #3b82f6; rx: 8; ry: 8; }
          .cta-text { font: bold 20px 'Arial', sans-serif; fill: white; text-anchor: middle; dominant-baseline: middle; }
        </style>
        <!-- Text content -->
        <g>
          <text x="${paddingX + 20}" y="${paddingY + 40}" class="logo">withme.travel</text>
          <text x="${paddingX + 20}" y="${paddingY + 80}" class="tagline">${escapeXml(tagline)}</text>
          <text x="${paddingX + 20}" y="${height - paddingY - 140}" class="title">${escapeXml(tripName)}</text>
          ${destinationText ? `<text x="${paddingX + 20}" y="${height - paddingY - 90}" class="location">${escapeXml(destinationText)}</text>` : ''}
          ${dateText ? `<text x="${paddingX + 20}" y="${height - paddingY - 50}" class="dates">${escapeXml(dateText)}</text>` : ''}
          <text x="${paddingX + 20}" y="${height - paddingY - 20}" class="tags">${escapeXml(tagsText)}</text>
          <text x="${paddingX + 20}" y="${height - paddingY - 180}" class="members">${escapeXml(membersText)}</text>
          <!-- CTA Button at center right -->
          <rect x="${width - paddingX - 150}" y="${height / 2 - 25}" width="150" height="50" class="cta-button" />
          <text x="${width - paddingX - 75}" y="${height / 2}" class="cta-text">View Trip</text>
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
    console.error('Error generating trip thumbnail:', error);
    return new NextResponse('Error generating thumbnail', { status: 500 });
  }
}

// Helper: update createGradientBackground to fill the whole canvas
async function createGradientBackground(width: number, height: number): Promise<Buffer> {
  const bgColor = '#3b82f6';
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
