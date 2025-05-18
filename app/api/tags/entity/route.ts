/**
 * Tag-Entity Relationship API Route
 * 
 * Handle requests for managing tags on entities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getCurrentUserId } from '@/utils/auth';

/**
 * POST handler for adding a tag to an entity
 */
export async function POST(request: NextRequest) {
  try {
    // Get the tag and entity data from the request body
    const body = await request.json();
    const { entityType, entityId, tagName } = body;
    
    if (!entityType || !entityId || !tagName) {
      return NextResponse.json(
        { error: 'Entity type, entity ID, and tag name are required' },
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

    // Add the tag to the entity
    const { data: existingTag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single();

    let tagId;
    
    if (tagError && tagError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
      console.error('Error checking for existing tag:', tagError);
      return NextResponse.json(
        { error: 'Failed to check for existing tag' },
        { status: 500 }
      );
    }
    
    if (!existingTag) {
      // Create the tag if it doesn't exist
      const { data: newTag, error: createError } = await supabase
        .from('tags')
        .insert({ name: tagName, created_by: userId })
        .select('id')
        .single();
        
      if (createError) {
        console.error('Error creating tag:', createError);
        return NextResponse.json(
          { error: 'Failed to create tag' },
          { status: 500 }
        );
      }
      
      tagId = newTag.id;
    } else {
      tagId = existingTag.id;
    }
    
    // Associate the tag with the entity
    const { error: associateError } = await supabase
      .from('entity_tags')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        tag_id: tagId,
        created_by: userId
      });
      
    if (associateError) {
      if (associateError.code === '23505') { // Unique violation
        return NextResponse.json(
          { message: 'Tag is already associated with this entity' },
          { status: 200 }
        );
      }
      
      console.error('Error associating tag with entity:', associateError);
      return NextResponse.json(
        { error: 'Failed to associate tag with entity' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in tag-entity POST handler:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to entity' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a tag from an entity
 */
export async function DELETE(request: NextRequest) {
  try {
    // For DELETE requests, we need to get the data from the request body
    // since URL parameters might not be sufficient for the required data
    const body = await request.json();
    const { entityType, entityId, tagName } = body;
    
    if (!entityType || !entityId || !tagName) {
      return NextResponse.json(
        { error: 'Entity type, entity ID, and tag name are required' },
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

    // Get the tag ID
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single();
      
    if (tagError) {
      if (tagError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Tag not found' },
          { status: 404 }
        );
      }
      
      console.error('Error getting tag:', tagError);
      return NextResponse.json(
        { error: 'Failed to get tag' },
        { status: 500 }
      );
    }
    
    // Remove the tag association
    const { error: removeError } = await supabase
      .from('entity_tags')
      .delete()
      .match({
        entity_type: entityType,
        entity_id: entityId,
        tag_id: tag.id
      });
      
    if (removeError) {
      console.error('Error removing tag from entity:', removeError);
      return NextResponse.json(
        { error: 'Failed to remove tag from entity' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in tag-entity DELETE handler:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from entity' },
      { status: 500 }
    );
  }
} 