import { createRouteHandlerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { TABLES, FIELDS } from "@/utils/constants/database";
import { cookies } from "next/headers";

// GET /api/groups - Get a list of groups the user belongs to
export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user securely
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    
    // Get URL params
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("search") || "";
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    
    let query = supabase
      .from(TABLES.GROUPS)
      .select(`
        *,
        ${TABLES.GROUP_MEMBERS} (
          user_id,
          role,
          status
        ),
        trip_count:${TABLES.GROUP_TRIPS}(count)
      `)
      .eq(`${TABLES.GROUP_MEMBERS}.user_id`, userId)
      .eq(`${TABLES.GROUP_MEMBERS}.status`, "active");
    
    // Add search filter if provided
    if (searchQuery) {
      query = query.ilike(FIELDS.GROUPS.NAME, `%${searchQuery}%`);
    }
    
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: groups, error } = await query;
    
    if (error) {
      console.error("Error fetching groups:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error in groups GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// In-memory rate limit store (MVP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // max 5 per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// POST /api/groups - Create a new group
export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user securely
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    
    // Parse body early to get guest token if present
    const body = await request.json();
    const { name, description, emoji, visibility, website } = body;
    console.log('[API] Incoming group creation:', body);

    // Honeypot check
    if (website && website.length > 0) {
      console.warn('[API] Honeypot triggered:', website);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!name) {
      console.warn('[API] Missing group name');
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    // --- Guest group creation logic ---
    if (!user) {
      // Try to get guest token from cookies
      const cookieStore = await cookies();
      let guestToken = cookieStore.get('guest_group_token')?.value || null;
      let ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || request.headers.get('x-real-ip') || null;
      console.log('[API] Guest group creation:', { guestToken, ip });
      // Rate limiting for guests
      if (ip) {
        const now = Date.now();
        const rl = rateLimitMap.get(ip) || { count: 0, lastReset: now };
        if (now - rl.lastReset > RATE_LIMIT_WINDOW) {
          rl.count = 0;
          rl.lastReset = now;
        }
        rl.count++;
        rateLimitMap.set(ip, rl);
        if (rl.count > RATE_LIMIT) {
          return NextResponse.json({ error: 'Too many group creations from this IP. Please try again later.' }, { status: 429 });
        }
      }
      if (!guestToken) {
        guestToken = crypto.randomUUID();
      }
      // Insert guest group
      const { data: group, error } = await supabase
        .from(TABLES.GROUPS)
        .insert({
          name,
          description: description || null,
          emoji: emoji || null,
          visibility: visibility || 'private',
          guest_token: guestToken,
        })
        .select()
        .single();
      if (error) {
        console.error('[API] Error creating guest group:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log('[API] Guest group created:', group);
      return NextResponse.json({ group }, { status: 201 });
    }
    
    // --- Authenticated user: first try the RPC function, then fallback to direct insert if it fails ---
    try {
      // Try to use the create_group RPC function first
      const { data, error } = await supabase.rpc('create_group', {
        p_name: name,
        p_description: description || null,
        p_emoji: emoji || null,
        p_visibility: visibility || 'private'
      });
      
      if (error) {
        // If there's an infinite recursion error in the policy, fall back to direct insert
        if (error.message.includes('infinite recursion') || error.code === '42P17') {
          console.warn("RPC error with recursion, falling back to direct insert:", error);
          // Fallback to direct insert and then add membership
          const { data: newGroup, error: insertError } = await supabase
            .from(TABLES.GROUPS)
            .insert({
              name,
              description: description || null,
              emoji: emoji || null,
              visibility: visibility || 'private',
              created_by: userId
            })
            .select()
            .single();
            
          if (insertError) {
            throw insertError;
          }
          
          // Now add the user as admin member
          const { error: memberError } = await supabase
            .from(TABLES.GROUP_MEMBERS)
            .insert({
              group_id: newGroup.id,
              user_id: userId,
              role: 'admin',
              status: 'active'
            });
            
          if (memberError) {
            console.error("Error adding group member:", memberError);
          }
          
          // Return the created group with the membership
          return NextResponse.json({ 
            group: {
              ...newGroup,
              group_members: [{
                user_id: userId,
                role: 'admin',
                status: 'active'
              }]
            }
          }, { status: 201 });
        } else {
          // For other errors, pass them through
          throw error;
        }
      }
      
      // If RPC succeeded, fetch the newly created group with members
      const { data: newGroup, error: fetchError } = await supabase
        .from(TABLES.GROUPS)
        .select(`
          *,
          ${TABLES.GROUP_MEMBERS} (
            user_id,
            role,
            status
          )
        `)
        .eq(FIELDS.GROUPS.ID, data)
        .single();
        
      if (fetchError) {
        console.error("Error fetching new group:", fetchError);
        return NextResponse.json(
          { error: fetchError.message, groupId: data },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ group: newGroup }, { status: 201 });
    } catch (error: any) {
      console.error("Error creating group:", error);
      return NextResponse.json({ 
        error: `Failed to create group: ${error.message || "Unknown error"}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Error in groups POST route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 