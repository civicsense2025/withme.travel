import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TABLES, FIELDS } from "@/utils/constants/database";

// Helper to create Supabase client
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// GET /api/groups/[id] - Get a specific group by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    // Get the group with members and trips
    const { data: group, error } = await supabase
      .from(TABLES.GROUPS)
      .select(`
        *,
        ${TABLES.GROUP_MEMBERS} (
          user_id,
          role,
          status,
          joined_at
        ),
        ${TABLES.GROUP_TRIPS} (
          trip_id,
          added_at,
          added_by,
          trips:${TABLES.TRIPS} (
            id,
            name,
            start_date,
            end_date,
            destination_id,
            created_by
          )
        )
      `)
      .eq(FIELDS.GROUPS.ID, groupId)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }
      console.error("Error fetching group:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error in group GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/groups/[id] - Update a specific group
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    // Check if user is owner or admin
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select("role")
      .eq(FIELDS.GROUP_MEMBERS.GROUP_ID, groupId)
      .eq(FIELDS.GROUP_MEMBERS.USER_ID, session.user.id)
      .eq(FIELDS.GROUP_MEMBERS.STATUS, "active")
      .single();
    
    if (membershipError || !membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "You don't have permission to update this group" },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { name, description, emoji, visibility } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }
    
    // Update the group
    const { data, error } = await supabase
      .from(TABLES.GROUPS)
      .update({
        name,
        description,
        emoji,
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq(FIELDS.GROUPS.ID, groupId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating group:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ group: data });
  } catch (error) {
    console.error("Error in group PUT route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete a specific group
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    // Check if user is owner
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select("role")
      .eq(FIELDS.GROUP_MEMBERS.GROUP_ID, groupId)
      .eq(FIELDS.GROUP_MEMBERS.USER_ID, session.user.id)
      .eq(FIELDS.GROUP_MEMBERS.STATUS, "active")
      .single();
    
    if (membershipError || !membership || membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the group owner can delete the group" },
        { status: 403 }
      );
    }
    
    // Delete the group (cascade will handle related records)
    const { error } = await supabase
      .from(TABLES.GROUPS)
      .delete()
      .eq(FIELDS.GROUPS.ID, groupId);
    
    if (error) {
      console.error("Error deleting group:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      { message: "Group deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in group DELETE route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 