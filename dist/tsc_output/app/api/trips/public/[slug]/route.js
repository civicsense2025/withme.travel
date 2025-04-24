import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
export async function GET(request, props) {
    const { slug } = props.params;
    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }
    const cookieStore = cookies();
    const supabase = createClient();
    try {
        // Get the public trip by slug
        const { data: trip, error } = await supabase
            .from("trips")
            .select(`
        *,
        destinations (
          id,
          name,
          country,
          image_url
        )
      `)
            .eq("public_slug", slug)
            .eq("is_public", true)
            .single();
        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Trip not found" }, { status: 404 });
            }
            throw error;
        }
        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }
        // Get trip itinerary items
        const { data: itineraryItems, error: itineraryError } = await supabase
            .from("itinerary_items")
            .select("*")
            .eq("trip_id", trip.id)
            .order("day", { ascending: true })
            .order("start_time", { ascending: true });
        if (itineraryError) {
            throw itineraryError;
        }
        return NextResponse.json({
            trip,
            itinerary: itineraryItems || [],
        });
    }
    catch (error) {
        console.error("Error fetching public trip:", error);
        return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
    }
}
