import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
// import { cookies } from "next/headers" // cookies() is handled within createClient
export async function POST(request, { params }) {
    // const supabase = createClient(cookies()) // Incorrect usage
    const supabase = createClient(); // Correct usage
    // Check if user is authenticated
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const slug = params.slug;
        // Get the template
        const { data: template, error: templateError } = await supabase
            .from("itinerary_templates")
            .select("*")
            .eq("slug", slug)
            .single();
        if (templateError) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }
        // Create a new trip
        const { data: trip, error: tripError } = await supabase
            .from("trips")
            .insert({
            title: body.title || template.title,
            description: body.description || template.description,
            destination_id: template.destination_id,
            start_date: body.start_date,
            end_date: body.end_date,
            created_by: user.id,
            is_public: false,
            status: "planning",
        })
            .select()
            .single();
        if (tripError) {
            return NextResponse.json({ error: tripError.message }, { status: 500 });
        }
        // Add the user as a member with owner role
        const { error: memberError } = await supabase.from("trip_members").insert({
            trip_id: trip.id,
            user_id: user.id,
            role: "owner",
        });
        if (memberError) {
            return NextResponse.json({ error: memberError.message }, { status: 500 });
        }
        // Create itinerary items from the template
        const days = template.days;
        const startDate = new Date(body.start_date);
        for (const day of days) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (day.day_number - 1));
            for (const item of day.items) {
                await supabase.from("itinerary_items").insert({
                    trip_id: trip.id,
                    title: item.title,
                    description: item.description,
                    location: item.location,
                    start_time: item.start_time ? `${currentDate.toISOString().split("T")[0]}T${item.start_time}` : null,
                    end_time: item.end_time ? `${currentDate.toISOString().split("T")[0]}T${item.end_time}` : null,
                    day_number: day.day_number,
                    created_by: user.id,
                });
            }
        }
        // Increment the template usage count
        await supabase.rpc("increment_template_uses", { template_id: template.id });
        return NextResponse.json({
            success: true,
            trip_id: trip.id,
        });
    }
    catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
