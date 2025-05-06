import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import IdeasClient from './ideas-client';
import { createServerComponentClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

/**
 * Group Ideas Page - Shows the collaborative idea whiteboard
 */
export default async function IdeasPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params to access its properties
  const { id } = await params;
  
  const supabase = await createServerComponentClient();
  
  // Get user securely
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Fetch the group data to verify it exists and user has access
  const { data: group, error } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !group) {
    notFound();
  }

  // Check if user is authenticated
  // (Guests are allowed, so don't redirect)
  const isAuthenticated = !!user;

  // Check if user is a member of the group (only if authenticated)
  let membership = null;
  if (isAuthenticated) {
    const { data: m, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    membership = m;
    // If not a member and the group is not public, redirect to group page
    if (!membership && group.visibility !== 'public') {
      redirect(`/groups/${id}`);
    }
  }

  // Fetch initial ideas to pass to client component
  const { data: ideas } = await supabase
    .from(TABLES.GROUP_IDEAS)
    .select('*')
    .eq('group_id', id)
    .order('created_at', { ascending: false });

  // Remove container and padding for fullscreen
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading ideas board...</div>}>
      <IdeasClient 
        groupId={id}
        initialIdeas={ideas || []}
        groupName={group.name}
        isAuthenticated={isAuthenticated}
      />
    </Suspense>
  );
} 