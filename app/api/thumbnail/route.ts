import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'WithMe Travel';
    const subtitle = searchParams.get('subtitle') || 'Plan your trip together';
    const bgColor = searchParams.get('bgColor') || '#3b82f6'; // Default to travel-blue
    const textColor = searchParams.get('textColor') || '#ffffff';
    const tags = searchParams.get('tags') || '';
    const usePadding = searchParams.get('usePadding') !== 'false'; // Default to true

    // Canvas dimensions
    const width = 1200;
    const height = 630;

    // Add padding (15%)
    const padding = usePadding ? 0.15 : 0; // 15% padding if enabled
    const contentWidth = width * (1 - padding * 2);
    const contentHeight = height * (1 - padding * 2);
    const paddingX = width * padding;
    const paddingY = height * padding;

    // Base SVG template
    let svgContent = `
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
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-opacity="0.3"/>
          </filter>
        </defs>
        ${
          usePadding
            ? `
        <rect width="${width}" height="${height}" fill="white" />
        <rect x="${paddingX}" y="${paddingY}" width="${contentWidth}" height="${contentHeight}" fill="url(#gradient)" />
        <rect x="${paddingX}" y="${paddingY}" width="${contentWidth}" height="${contentHeight}" filter="url(#noise)" opacity="0.1" />
        `
            : `
        <rect width="${width}" height="${height}" fill="url(#gradient)" />
        <rect width="${width}" height="${height}" filter="url(#noise)" opacity="0.1" />
        `
        }
        
        <!-- Logo in top left -->
        <text x="${paddingX + 50}" y="${paddingY + 60}" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${textColor}" text-anchor="start" filter="url(#shadow)">withme.travel</text>
        
        <!-- Main content at bottom left -->
        <text x="${paddingX + 50}" y="${height - paddingY - 140}" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="${textColor}" text-anchor="start" filter="url(#shadow)">${escapeXml(title)}</text>
        <text x="${paddingX + 50}" y="${height - paddingY - 70}" font-family="Arial, sans-serif" font-size="40" fill="${textColor}" text-anchor="start" opacity="0.8" filter="url(#shadow)">${escapeXml(subtitle)}</text>
        
        ${tags ? `<text x="${paddingX + 50}" y="${height - paddingY - 20}" font-family="Arial, sans-serif" font-size="18" font-style="italic" fill="${textColor}" text-anchor="start" opacity="0.7" filter="url(#shadow)">${escapeXml(tags)}</text>` : ''}
      </svg>
    `;

    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return new NextResponse('Error generating thumbnail', { status: 500 });
  }
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
