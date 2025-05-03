import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams?.get('name') || 'User';

  // Generate a simple SVG avatar with the user's initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Generate a deterministic color based on the name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue = Math.abs(hash % 360);
  const saturation = 70;
  const lightness = 60;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}