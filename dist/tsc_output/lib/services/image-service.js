import { createClient } from '@supabase/supabase-js';
import { getRandomUnsplashPhoto } from '@/utils/unsplash';
class ImageService {
    constructor() {
        this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    }
    // Get image metadata for an entity
    async getImageMetadata(entityId, entityType) {
        try {
            const { data, error } = await this.supabase
                .from('image_metadata')
                .select('*')
                .eq('entity_id', entityId)
                .eq('entity_type', entityType)
                .maybeSingle()
                .throwOnError();
            return data;
        }
        catch (error) {
            console.error('Error fetching image metadata:', error);
            return null;
        }
    }
    // Create or update image metadata
    async upsertImageMetadata(metadata) {
        const { data, error } = await this.supabase
            .from('image_metadata')
            .upsert(Object.assign({}, metadata), {
            onConflict: 'entity_id,entity_type'
        })
            .select()
            .single();
        if (error) {
            console.error('Error upserting image metadata:', error);
            return null;
        }
        return data;
    }
    // Get optimized image URL with proper dimensions and format
    getOptimizedImageUrl(url, options = {}) {
        // If it's an Unsplash URL, use their image optimization API
        if (url.includes('unsplash.com')) {
            const unsplashUrl = new URL(url);
            if (options.width)
                unsplashUrl.searchParams.set('w', options.width.toString());
            if (options.height)
                unsplashUrl.searchParams.set('h', options.height.toString());
            if (options.quality)
                unsplashUrl.searchParams.set('q', options.quality.toString());
            if (options.format)
                unsplashUrl.searchParams.set('fm', options.format);
            return unsplashUrl.toString();
        }
        // For other URLs, you could implement your own image optimization service
        // or use a CDN like Cloudinary, imgix, etc.
        return url;
    }
    // Get a random destination image from Unsplash
    async getRandomDestinationImage(destination) {
        try {
            const photo = await getRandomUnsplashPhoto(`${destination} landmark travel destination`, true // Use server auth
            ); // Cast to extended interface
            if (!photo)
                return null;
            const metadata = {
                entity_type: 'destination',
                entity_id: destination, // This should be the destination ID
                url: photo.urls.regular,
                alt_text: photo.description || photo.alt_description || `Travel photo of ${destination}`,
                attribution: `Photo by ${photo.user.name} on Unsplash`,
                photographer_name: photo.user.name,
                photographer_url: photo.user.links.html,
                source: 'unsplash',
                source_id: photo.id,
                width: photo.width,
                height: photo.height,
            };
            return await this.upsertImageMetadata(metadata);
        }
        catch (error) {
            console.error('Error getting random destination image:', error);
            return null;
        }
    }
    // Generate a placeholder avatar for a user
    generatePlaceholderAvatar(name) {
        return `/api/avatar?name=${encodeURIComponent(name)}`;
    }
    // Get appropriate image URL with fallback
    getImageUrlWithFallback(metadata, type, fallbackText, options = {}) {
        if (metadata === null || metadata === void 0 ? void 0 : metadata.url) {
            return this.getOptimizedImageUrl(metadata.url, options);
        }
        switch (type) {
            case 'user_avatar':
                return this.generatePlaceholderAvatar(fallbackText);
            case 'destination':
                return `/images/placeholder-destination.jpg`;
            case 'trip_cover':
                return `/images/placeholder-trip.svg`;
            case 'template_cover':
                return `/images/placeholder-template.svg`;
            default:
                return `/images/placeholder.svg`;
        }
    }
}
// Export singleton instance
export const imageService = new ImageService();
