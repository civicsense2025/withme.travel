import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DB_TABLES } from '@/utils/constants';
// Custom error types for better error handling
class PlaceError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'PlaceError';
    }
}
// Helper function to map Google types to our place_category enum (Refined)
function mapGoogleTypeToCategory(googleTypes) {
    if (!googleTypes)
        return 'other';
    if (googleTypes.includes('cafe'))
        return 'cafe';
    if (googleTypes.includes('restaurant'))
        return 'restaurant';
    if (googleTypes.includes('hotel') || googleTypes.includes('lodging'))
        return 'hotel';
    if (googleTypes.includes('museum'))
        return 'attraction';
    if (googleTypes.includes('park'))
        return 'attraction';
    if (googleTypes.includes('tourist_attraction'))
        return 'attraction';
    if (googleTypes.includes('landmark'))
        return 'landmark';
    if (googleTypes.includes('shopping_mall') || googleTypes.includes('store') || googleTypes.includes('book_store') || googleTypes.includes('department_store'))
        return 'shopping';
    if (googleTypes.includes('transit_station') || googleTypes.includes('airport') || googleTypes.includes('bus_station') || googleTypes.includes('subway_station') || googleTypes.includes('train_station'))
        return 'transport';
    if (googleTypes.includes('food'))
        return 'restaurant';
    if (googleTypes.includes('point_of_interest'))
        return 'other';
    if (googleTypes.includes('establishment'))
        return 'other';
    return 'other';
}
export async function POST(request) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    console.log("Lookup/Create API route hit"); // Log when the route is hit
    const supabase = createClient();
    // 1. Check user authentication (standard way)
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    // Log the result of getUser
    if (getUserError) {
        console.error("Error getting user:", getUserError);
    }
    console.log("User object from getUser:", user ? { id: user.id, email: user.email } : null);
    if (getUserError || !user) {
        console.log("Authentication failed or user not found.");
        return NextResponse.json({ error: 'Unauthorized', detail: getUserError === null || getUserError === void 0 ? void 0 : getUserError.message }, { status: 401 });
    }
    console.log(`Authenticated as user: ${user.id}`);
    // 2. Parse request body
    let reqBody;
    try {
        reqBody = await request.json();
        if (!reqBody.googlePlaceId) {
            throw new PlaceError('Missing googlePlaceId', 400);
        }
        // Validate Google Place ID format
        // Google Place IDs are typically alphanumeric with some special chars and at least 20+ chars long
        const placeIdRegex = /^[a-zA-Z0-9_-]{20,}$/;
        if (!placeIdRegex.test(reqBody.googlePlaceId)) {
            throw new PlaceError('Invalid Google Place ID format', 400);
        }
    }
    catch (error) {
        console.error("Error parsing request body:", error);
        const statusCode = error instanceof PlaceError ? error.statusCode : 400;
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request body' }, { status: statusCode });
    }
    const { googlePlaceId } = reqBody;
    const source = 'google';
    // Set rate limit counters
    const rateLimit = 100; // Requests per hour
    const rateLimitRemaining = 99; // Example value, should be tracked properly in production
    let existingPlace = null; // Declare existingPlace here
    try {
        // 3. Check if place already exists in our DB
        console.log(`Checking DB for source=${source}, source_id=${googlePlaceId}`);
        const { data: foundPlace, error: selectError } = await supabase // Rename data to foundPlace to avoid conflict
            .from(DB_TABLES.PLACES)
            .select('*')
            .eq('source', source)
            .eq('source_id', googlePlaceId)
            .maybeSingle();
        if (selectError) {
            console.error('Supabase select error:', selectError);
            throw new PlaceError('Database error checking for existing place.', 500);
        }
        existingPlace = foundPlace; // Assign the found place
        if (existingPlace) {
            console.log(`Place found in DB: ${googlePlaceId}, ID: ${existingPlace.id}`);
            const response = NextResponse.json(existingPlace, { status: 200 });
            // Add rate limiting headers
            response.headers.set('X-RateLimit-Limit', rateLimit.toString());
            response.headers.set('X-RateLimit-Remaining', rateLimitRemaining.toString());
            response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString());
            return response;
        }
        // 4. Place not found, fetch from Google Places API
        console.log(`Place not found in DB, fetching from Google: ${googlePlaceId}`);
        const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
        if (!apiKey) {
            console.error('GOOGLE_MAPS_SERVER_API_KEY is not set.');
            throw new PlaceError('Server configuration error.', 500);
        }
        const fields = 'place_id,name,formatted_address,geometry,type,rating,user_ratings_total,price_level,photo,website,opening_hours,formatted_phone_number';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=${fields}&key=${apiKey}`;
        const googleResponse = await fetch(url);
        const googleData = await googleResponse.json();
        if (googleData.status !== 'OK' || !googleData.result) {
            console.error('Google Places API error:', googleData.status, googleData.error_message);
            throw new PlaceError(`Google Places API error: ${googleData.status}`, 502);
        }
        const placeDetails = googleData.result;
        const photoReferences = (_b = (_a = placeDetails.photos) === null || _a === void 0 ? void 0 : _a.map(p => p.photo_reference)) !== null && _b !== void 0 ? _b : null;
        // 5. Prepare data for insertion
        const newPlaceData = {
            name: (_c = placeDetails.name) !== null && _c !== void 0 ? _c : 'Unknown Place',
            description: null,
            category: mapGoogleTypeToCategory(placeDetails.types),
            address: (_d = placeDetails.formatted_address) !== null && _d !== void 0 ? _d : null,
            latitude: (_f = (_e = placeDetails.geometry) === null || _e === void 0 ? void 0 : _e.location.lat) !== null && _f !== void 0 ? _f : null,
            longitude: (_h = (_g = placeDetails.geometry) === null || _g === void 0 ? void 0 : _g.location.lng) !== null && _h !== void 0 ? _h : null,
            destination_id: null,
            price_level: (_j = placeDetails.price_level) !== null && _j !== void 0 ? _j : null,
            rating: (_k = placeDetails.rating) !== null && _k !== void 0 ? _k : null,
            rating_count: (_l = placeDetails.user_ratings_total) !== null && _l !== void 0 ? _l : null,
            images: photoReferences,
            tags: (_m = placeDetails.types) !== null && _m !== void 0 ? _m : null,
            opening_hours: (_o = placeDetails.opening_hours) !== null && _o !== void 0 ? _o : null,
            website: (_p = placeDetails.website) !== null && _p !== void 0 ? _p : null,
            phone_number: (_q = placeDetails.formatted_phone_number) !== null && _q !== void 0 ? _q : null,
            source: source,
            source_id: googlePlaceId,
        };
        // 6. Insert into Supabase
        console.log(`Inserting place ${googlePlaceId} into DB`);
        const { data: insertedPlace, error: insertError } = await supabase
            .from(DB_TABLES.PLACES)
            .insert(newPlaceData)
            .select()
            .single();
        if (insertError) {
            console.error('Supabase insert error:', insertError);
            if (insertError.code === '23505') { // Handle potential race condition
                console.warn(`Race condition detected for Google Place ID: ${googlePlaceId}. Refetching.`);
                // Refetching logic starts here
                const { data: racePlace, error: raceError } = await supabase // Use supabase directly here
                    .from(DB_TABLES.PLACES)
                    .select('*')
                    .eq('source', source)
                    .eq('source_id', googlePlaceId)
                    .single(); // Ensure you fetch a single result
                if (raceError || !racePlace) {
                    console.error('Database error resolving insert race condition:', raceError);
                    throw new PlaceError('Database error resolving insert race condition.', 500);
                }
                // Return the successfully fetched place from the race condition
                const response = NextResponse.json(racePlace, { status: 200 });
                // Add rate limiting headers
                response.headers.set('X-RateLimit-Limit', rateLimit.toString());
                response.headers.set('X-RateLimit-Remaining', rateLimitRemaining.toString());
                response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString());
                return response;
            }
            // If it's not a race condition error, throw a generic DB error
            throw new PlaceError('Database error saving new place.', 500);
        }
        // Check if insertedPlace is actually populated before accessing its id
        if (!insertedPlace) {
            console.error(`Insert operation for ${googlePlaceId} did not return a place.`);
            throw new PlaceError('Failed to retrieve the newly created place from database.', 500);
        }
        console.log(`Place inserted into DB: ${googlePlaceId}, ID: ${insertedPlace.id}`);
        const response = NextResponse.json(insertedPlace, { status: 201 });
        // Add rate limiting headers
        response.headers.set('X-RateLimit-Limit', rateLimit.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitRemaining.toString());
        response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString());
        return response;
    }
    catch (error) {
        console.error("Lookup/Create Place Error:", error);
        // Improved error status determination
        let status = 500;
        let message = 'Internal Server Error';
        if (error instanceof PlaceError) {
            status = error.statusCode;
            message = error.message;
        }
        else if (error instanceof Error) {
            // Keep existing logic for determining status from generic errors
            if (error.message.includes('configuration'))
                status = 500;
            else if (error.message.includes('Database error'))
                status = 503;
            else if (error.message.includes('Invalid'))
                status = 400;
            else if (error.message.includes('Google Places API'))
                status = 502;
            message = error.message;
        }
        const response = NextResponse.json({ error: message }, { status });
        // Add rate limiting headers even for error responses
        // Use dummy/default values if real ones aren't available in error state
        const currentRateLimitRemaining = rateLimitRemaining - 1; // Decrement example
        response.headers.set('X-RateLimit-Limit', rateLimit.toString());
        response.headers.set('X-RateLimit-Remaining', Math.max(0, currentRateLimitRemaining).toString()); // Ensure non-negative
        response.headers.set('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString());
        return response;
    }
}
