import { NextResponse } from 'next/server';
import { searchUnsplashImages } from '@/lib/api/images';

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = searchParams?.get('query');
  const page = parseInt(searchParams?.get('page') || '1', 10);
  const perPage = parseInt(searchParams?.get('per_page') || '20', 10);

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  const result = await searchUnsplashImages(query, page, perPage);
  if (result.success) {
    return NextResponse.json(result.data);
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
