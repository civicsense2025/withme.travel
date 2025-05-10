import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, ENUMS } from '@/utils/constants/database';
import { z } from 'zod';

// Schema for validating image data
const imageSaveSchema = z.object({
  url: z.string().url(),
  imageType: z.enum([
    ENUMS.IMAGE_TYPE.DESTINATION,
    ENUMS.IMAGE_TYPE.TRIP_COVER,
    ENUMS.IMAGE_TYPE.USER_AVATAR,
    ENUMS.IMAGE_TYPE.TEMPLATE_COVER
  ]),
  alt: z.string().optional(),
  refId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  sourceName: z.string().optional(),
  photographer: z.string().optional(),
  photographerUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * POST handler to save an image to the database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }
    
    // Get and validate request data
    const requestData = await request.json();
    const validation = imageSaveSchema.safeParse(requestData);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid image data', 
        details: validation.error.format() 
      }, { status: 400 });
    }
    
    const imageData = validation.data;
    
    // Insert the image into the database
    const { data: savedImage, error: saveError } = await supabase
      .from(TABLES.IMAGES)
      .insert({
        url: imageData.url,
        image_url: imageData.url,
        alt_text: imageData.alt || 'Image',
        source: imageData.sourceName || null,
        external_id: null,
        created_by: user?.id,
        photographer: imageData.photographer || null,
        photographer_url: imageData.photographerUrl || null,
        trip_id: imageData.imageType === ENUMS.IMAGE_TYPE.TRIP_COVER ? imageData.refId : null,
        user_id: imageData.imageType === ENUMS.IMAGE_TYPE.USER_AVATAR ? user?.id : null,
        destination_id: imageData.imageType === ENUMS.IMAGE_TYPE.DESTINATION ? imageData.refId : null
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving image:', saveError);
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      image: savedImage,
      message: 'Image saved successfully' 
    });
  } catch (error: any) {
    console.error('Unexpected error saving image:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
} 