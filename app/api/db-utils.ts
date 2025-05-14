// Server-side database utility functions
import { createRouteHandlerClient } from '@/utils/supabase/server';

/**
 * Get comments for a specific entity or replies to a comment
 */
export async function getComments(
  entityType: string,
  entityId: string,
  limit: number = 50,
  offset: number = 0,
  parentId: string | null = null
) {
  const supabase = await createRouteHandlerClient();

  let commentsData = [];
  let error = null;

  try {
    if (parentId) {
      // We're fetching replies to a specific comment
      const response = await supabase
        .from('comments')
        .select(
          `
          *,
          user:user_id (id, name, username, avatar_url)
        `
        )
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      commentsData = response.data || [];
      error = response.error;
    } else {
      // This is just a simplified implementation
      // In a real app, you would need to properly implement this
      console.warn('getComments: Direct comment fetching not implemented');
    }
  } catch (e) {
    console.error('Error in getComments:', e);
    error = e;
  }

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return { comments: commentsData };
}
