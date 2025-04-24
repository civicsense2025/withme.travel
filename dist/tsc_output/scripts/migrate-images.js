import { createClient } from '@supabase/supabase-js';
import { imageService } from '@/lib/services/image-service';
import { getRandomUnsplashPhoto } from '@/utils/unsplash';
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or Service Key is missing in environment variables.");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
async function migrateImages() {
    console.log('Starting image migration...');
    // Migrate destination images
    console.log('Migrating destination images...');
    const { data: destinations, error: destError } = await supabase
        .from('destinations')
        .select('id, city, country, image_url')
        .not('image_url', 'is', null);
    if (destError) {
        console.error('Error fetching destinations:', destError);
        return;
    }
    for (const destination of destinations) {
        console.log(`Processing destination: ${destination.city}, ${destination.country}`);
        try {
            // If the destination already has an image, create metadata for it
            if (destination.image_url) {
                await imageService.upsertImageMetadata({
                    entity_id: destination.id,
                    entity_type: 'destination',
                    url: destination.image_url,
                    alt_text: `Travel photo of ${destination.city}, ${destination.country}`,
                    source: 'system',
                });
            }
            else {
                // Get a new image from Unsplash
                const photo = await getRandomUnsplashPhoto(`${destination.city} ${destination.country} landmark travel destination`, true);
                if (photo) {
                    await imageService.upsertImageMetadata({
                        entity_id: destination.id,
                        entity_type: 'destination',
                        url: photo.urls.regular,
                        alt_text: photo.description || photo.alt_description || `Travel photo of ${destination.city}, ${destination.country}`,
                        attribution: `Photo by ${photo.user.name} on Unsplash`,
                        photographer_name: photo.user.name,
                        photographer_url: photo.user.links.html,
                        source: 'unsplash',
                        source_id: photo.id,
                    });
                    // Update the destination record
                    await supabase
                        .from('destinations')
                        .update({ image_url: photo.urls.regular })
                        .eq('id', destination.id);
                }
            }
        }
        catch (error) {
            console.error(`Error processing destination ${destination.city}:`, error);
        }
    }
    // Migrate trip cover images
    console.log('Migrating trip cover images...');
    const { data: trips, error: tripError } = await supabase
        .from('trips')
        .select('id, name, cover_image_url')
        .not('cover_image_url', 'is', null);
    if (tripError) {
        console.error('Error fetching trips:', tripError);
        return;
    }
    for (const trip of trips) {
        console.log(`Processing trip: ${trip.name}`);
        try {
            await imageService.upsertImageMetadata({
                entity_id: trip.id,
                entity_type: 'trip_cover',
                url: trip.cover_image_url,
                alt_text: `Cover image for trip: ${trip.name}`,
                source: 'system',
            });
        }
        catch (error) {
            console.error(`Error processing trip ${trip.name}:`, error);
        }
    }
    // Migrate user avatars
    console.log('Migrating user avatars...');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .not('avatar_url', 'is', null);
    if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return;
    }
    for (const profile of profiles) {
        console.log(`Processing profile: ${profile.name || profile.id}`);
        try {
            await imageService.upsertImageMetadata({
                entity_id: profile.id,
                entity_type: 'user_avatar',
                url: profile.avatar_url,
                alt_text: `Avatar for ${profile.name || 'user'}`,
                source: 'user_upload',
            });
        }
        catch (error) {
            console.error(`Error processing profile ${profile.name || profile.id}:`, error);
        }
    }
    // Migrate template cover images
    console.log('Migrating template cover images...');
    const { data: templates, error: templateError } = await supabase
        .from('library_templates')
        .select('id, title, cover_image_url')
        .not('cover_image_url', 'is', null);
    if (templateError) {
        console.error('Error fetching templates:', templateError);
        return;
    }
    for (const template of templates) {
        console.log(`Processing template: ${template.title}`);
        try {
            await imageService.upsertImageMetadata({
                entity_id: template.id,
                entity_type: 'template_cover',
                url: template.cover_image_url,
                alt_text: `Cover image for template: ${template.title}`,
                source: 'system',
            });
        }
        catch (error) {
            console.error(`Error processing template ${template.title}:`, error);
        }
    }
    console.log('Image migration completed!');
}
// Run the migration
migrateImages().catch(console.error);
