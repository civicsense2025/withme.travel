import { Result } from './_shared';
import { searchUnsplash } from '@/lib/unsplashService';
import { searchPexels } from '@/lib/pexelsService';
import sharp from 'sharp';
import { getTypedDbClient, createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { ENUMS } from '@/utils/constants/status';
import { z } from 'zod';

const imageSaveSchema = z.object({
  url: z.string().url(),
  imageType: z.enum([
    ENUMS.IMAGE_TYPE.DESTINATION,
    ENUMS.IMAGE_TYPE.TRIP_COVER,
    ENUMS.IMAGE_TYPE.USER_AVATAR,
    ENUMS.IMAGE_TYPE.TEMPLATE_COVER,
  ]),
  alt: z.string().optional(),
  refId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  sourceName: z.string().optional(),
  photographer: z.string().optional(),
  photographerUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function searchUnsplashImages(query: string, page = 1, perPage = 20): Promise<Result<any>> {
  try {
    const result = await searchUnsplash(query, { page, perPage });
    if ('error' in result) return { success: false, error: result.error ?? 'Unknown error' };
    return { success: true, data: { photos: result.results, totalPages: result.totalPages ?? 1 } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchPexelsImages(query: string, page = 1, perPage = 20): Promise<Result<any>> {
  try {
    const result = await searchPexels(query, perPage);
    if ('error' in result) return { success: false, error: result.error ?? 'Unknown error' };
    const totalPages = 'totalPages' in result && typeof result.totalPages === 'number' ? result.totalPages : 1;
    return { success: true, data: { photos: result.photos, totalPages } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveImage(imageData: any): Promise<Result<any>> {
  try {
    const supabase = await getTypedDbClient();
    // Get user from auth
    const { data: { user }, error: userError } = await createRouteHandlerClient().then((client) => client.auth.getUser());
    if (userError) {
      return { success: false, error: userError.message };
    }
    // Validate input
    const validation = imageSaveSchema.safeParse(imageData);
    if (!validation.success) {
      return { success: false, error: 'Invalid image data' };
    }
    const validData = validation.data;
    const refId = typeof validData.refId === 'string' ? validData.refId : null;
    const insertPayload = {
      url: validData.url,
      image_url: validData.url,
      alt_text: validData.alt || 'Image',
      source: validData.sourceName || null,
      external_id: null,
      created_by: user?.id || null,
      photographer: validData.photographer || null,
      photographer_url: validData.photographerUrl || null,
      trip_id: validData.imageType === ENUMS.IMAGE_TYPE.TRIP_COVER ? refId : null,
      user_id: validData.imageType === ENUMS.IMAGE_TYPE.USER_AVATAR ? user?.id || null : null,
      destination_id: validData.imageType === ENUMS.IMAGE_TYPE.DESTINATION ? refId : null,
    };
    const { data: savedImage, error: saveError } = await supabase
      .from('images')
      .insert(insertPayload)
      .select()
      .single();
    if (saveError) {
      return { success: false, error: saveError.message };
    }
    return { success: true, data: savedImage };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateThumbnail(options: { title: string; subtitle?: string; bgColor?: string; textColor?: string; tags?: string; usePadding?: boolean }): Promise<Result<Buffer>> {
  try {
    const width = 1200;
    const height = 630;
    const {
      title,
      subtitle = 'Plan your trip together',
      bgColor = '#3b82f6',
      textColor = '#ffffff',
      tags = '',
      usePadding = true,
    } = options;
    const padding = usePadding ? 0.15 : 0;
    const contentWidth = width * (1 - padding * 2);
    const contentHeight = height * (1 - padding * 2);
    const paddingX = width * padding;
    const paddingY = height * padding;

    function adjustColor(hex: string, amount: number): string {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const newR = Math.max(0, Math.min(255, r + amount));
      const newG = Math.max(0, Math.min(255, g + amount));
      const newB = Math.max(0, Math.min(255, b + amount));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

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
        <text x="${paddingX + 50}" y="${paddingY + 60}" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="${textColor}" text-anchor="start" filter="url(#shadow)">withme.travel</text>
        <text x="${paddingX + 50}" y="${height - paddingY - 140}" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="${textColor}" text-anchor="start" filter="url(#shadow)">${escapeXml(title)}</text>
        <text x="${paddingX + 50}" y="${height - paddingY - 70}" font-family="Arial, sans-serif" font-size="40" fill="${textColor}" text-anchor="start" opacity="0.8" filter="url(#shadow)">${escapeXml(subtitle)}</text>
        ${tags ? `<text x="${paddingX + 50}" y="${height - paddingY - 20}" font-family="Arial, sans-serif" font-size="18" font-style="italic" fill="${textColor}" text-anchor="start" opacity="0.7" filter="url(#shadow)">${escapeXml(tags)}</text>` : ''}
      </svg>
    `;

    const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();
    return { success: true, data: pngBuffer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
} 