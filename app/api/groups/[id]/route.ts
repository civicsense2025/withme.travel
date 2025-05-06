import { createRouteHandlerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET /api/groups/[id] - Get a specific group by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user securely
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    // Get the group with members and trips
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members (
          user_id,
          role,
          status,
          joined_at
        ),
        group_trips (
          trip_id,
          added_at,
          added_by,
          trips:trips (
            id,
            name,
            start_date,
            end_date,
            destination_id,
            created_by
          )
        )
      `)
      .eq('id', groupId)
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
    const supabase = await createRouteHandlerClient();
    
    // Get user securely
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    // Check if user is owner or admin
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select("role")
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', "active")
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
      .from('groups')
      .update({
        name,
        description,
        emoji,
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
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
    const supabase = await createRouteHandlerClient();
    
    // Get user securely
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    // Check if user is owner
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select("role")
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', "active")
      .single();
    
    if (membershipError || !membership || membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the group owner can delete the group" },
        { status: 403 }
      );
    }
    
    // Delete the group (cascade will handle related records)
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
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