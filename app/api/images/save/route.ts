import { NextRequest, NextResponse } from 'next/server';
import { saveImage } from '@/lib/api/images';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const result = await saveImage(requestData);
    if (result.success) {
      return NextResponse.json({ image: result.data, message: 'Image saved successfully' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Unexpected error saving image:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
