import { NextRequest, NextResponse } from 'next/server';
import { generateThumbnail } from '@/lib/api/images';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'WithMe Travel';
  const subtitle = searchParams.get('subtitle') || 'Plan your trip together';
  const bgColor = searchParams.get('bgColor') || '#3b82f6';
  const textColor = searchParams.get('textColor') || '#ffffff';
  const tags = searchParams.get('tags') || '';
  const usePadding = searchParams.get('usePadding') !== 'false';

  const result = await generateThumbnail({
    title,
    subtitle,
    bgColor,
    textColor,
    tags,
    usePadding,
  });

  if (result.success && result.data) {
    return new NextResponse(result.data, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } else {
    return new NextResponse('Error generating thumbnail', { status: 500 });
  }
}
