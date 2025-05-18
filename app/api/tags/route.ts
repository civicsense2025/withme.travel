/**
 * Tags API Route
 * 
 * Handle requests for tag operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getCurrentUserId } from '@/utils/auth';

/**
 * GET handler for listing or retrieving tags
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    // Get the current user
    const supabase = await createRouteHandlerClient();
    const userId = await getCurrentUserId(supabase);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get tags based on parameters
    let tags;
    
    if (entityType && entityId) {
      // Get tags for a specific entity
      const { data, error } = await supabase
        .from('entity_tags')
        .select(`
          tag_id,
          tags:tag_id(id, name)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
        
      if (error) {
        console.error('Error fetching entity tags:', error);
        return NextResponse.json(
          { error: 'Failed to fetch tags for entity' },
          { status: 500 }
        );
      }
      
      // Extract tag objects from the join result
      tags = data.map(item => item.tags);
    } else {
      // Get all tags
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name');
        
      if (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
          { error: 'Failed to fetch tags' },
          { status: 500 }
        );
      }
      
      tags = data;
    }

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error in tags GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a tag
 */
export async function POST(request: NextRequest) {
  try {
    // Get the tag data from the request body
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const supabase = await createRouteHandlerClient();
    const userId = await getCurrentUserId(supabase);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if tag already exists
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id, name')
      .eq('name', name)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // Not "No rows found" error
      console.error('Error checking for existing tag:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing tag' },
        { status: 500 }
      );
    }
    
    if (existingTag) {
      // Tag already exists, return it
      return NextResponse.json(
        existingTag,
        { status: 200 }
      );
    }
    
    // Create the tag
    const { data: newTag, error: createError } = await supabase
      .from('tags')
      .insert({
        name,
        created_by: userId
      })
      .select('id, name')
      .single();
      
    if (createError) {
      console.error('Error creating tag:', createError);
      return NextResponse.json(
        { error: 'Failed to create tag' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      newTag,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in tags POST handler:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
