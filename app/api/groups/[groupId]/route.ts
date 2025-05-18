import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import {
  getGroupWithDetails,
  updateGroup,
  deleteGroup,
  checkGroupMemberRole,
} from '@/lib/api/groups';

// --- Types ---
interface Group {
  id: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  visibility: 'private' | 'public';
  // ...add more fields as needed
}

interface GroupMember {
  user_id: string;
  role: string;
  status: string;
}

interface GroupResponse {
  group: Group & { group_members?: GroupMember[] };
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// GET /api/groups/[groupId] - Get a specific group by ID
export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user securely
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.groupId;
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Use centralized API to fetch group with details
    const result = await getGroupWithDetails(groupId);

    if (!result.success) {
      if (result.error.includes('not found')) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ group: result.data });
  } catch (error) {
    console.error('Error in group GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/groups/[groupId] - Update a specific group
export async function PUT(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user securely
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.groupId;
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Check if user is owner or admin using the centralized API
    const permissionResult = await checkGroupMemberRole(groupId, user.id, ['owner', 'admin']);

    if (!permissionResult.success) {
      return NextResponse.json({ error: 'Failed to check permissions' }, { status: 500 });
    }

    if (!permissionResult.data) {
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
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    // Update the group using the centralized API
    const result = await updateGroup(groupId, {
      name,
      description,
      emoji,
      visibility,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ group: result.data });
  } catch (error) {
    console.error('Error in group PUT route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/groups/[groupId] - Delete a specific group
export async function DELETE(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user securely
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = params.groupId;
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Check if user is owner using the centralized API
    const permissionResult = await checkGroupMemberRole(groupId, user.id, ['owner']);

    if (!permissionResult.success) {
      return NextResponse.json({ error: 'Failed to check permissions' }, { status: 500 });
    }

    if (!permissionResult.data) {
      return NextResponse.json(
        { error: 'Only the group owner can delete the group' },
        { status: 403 }
      );
    }

    // Delete the group using the centralized API
    const result = await deleteGroup(groupId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in group DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
