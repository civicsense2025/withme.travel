import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
// import { cookies } from "next/headers" // cookies() is handled within createClient
export async function GET(request, { params }) {
    // const supabase = createClient(cookies()) // Incorrect usage
    const supabase = createClient(); // Correct usage
    const slug = params.slug;
    // Get the itinerary template
    const { data, error } = await supabase
        .from("itinerary_templates")
        .select(`
      *,
      destinations(*),
      users:created_by(id, full_name, avatar_url)
    `)
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
    // Increment view count
    await supabase.rpc("increment_template_views", { template_id: data.id });
    return NextResponse.json({ data });
}
export async function PUT(request, { params }) {
    // const supabase = createClient(cookies()) // Incorrect usage
    const supabase = createClient(); // Correct usage
    // Check if user is authenticated
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
    if (!(userData === null || userData === void 0 ? void 0 : userData.is_admin)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
        const body = await request.json();
        const slug = params.slug;
        // Update the itinerary template
        const { data, error } = await supabase.from("itinerary_templates").update(body).eq("slug", slug).select();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ data: data[0] });
    }
    catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
export async function DELETE(request, { params }) {
    // const supabase = createClient(cookies()) // Incorrect usage
    const supabase = createClient(); // Correct usage
    // Check if user is authenticated
    const { data: { user }, } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Check if user is admin or the creator
    const { data: template } = await supabase
        .from("itinerary_templates")
        .select("created_by")
        .eq("slug", params.slug)
        .single();
    if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
    if (template.created_by !== user.id && !(userData === null || userData === void 0 ? void 0 : userData.is_admin)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Delete the itinerary template
    const { error } = await supabase.from("itinerary_templates").delete().eq("slug", params.slug);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
