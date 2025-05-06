import React from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import Link from 'next/link';
import IdeasPreviewClient from './ideas-preview-client';

export default async function GroupIdeasPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params to access its properties
  const { id } = await params;
  
  // Use the correct server component client
  const supabase = await createServerComponentClient();
  
  console.log('Fetching group data for id:', id);
  
  // Fetch group without requiring authentication
  const { data: group, error } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching group:', error);
    notFound();
  }

  if (!group) {
    console.log('Group not found');
    notFound();
  }

  // Only allow preview if the group is public or has a public ideas board
  if (group.visibility !== 'public' && !group.public_ideas_board) {
    console.log('Group is not public and does not have a public ideas board');
    notFound();
  }

  console.log('Fetching ideas for group:', id);
  
  // Fetch ideas
  const { data: ideas, error: ideasError } = await supabase
    .from(TABLES.GROUP_IDEAS)
    .select('*')
    .eq('group_id', id)
    .order('created_at', { ascending: false });

  if (ideasError) {
    console.error('Error fetching ideas:', ideasError);
  }

  console.log(`Found ${ideas?.length || 0} ideas`);
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{group.name} Ideas</h1>
          <p className="text-muted-foreground">Preview mode - read-only</p>
        </div>
        <Link 
          href={`/groups/${id}`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          View Group
        </Link>
      </div>
      
      <IdeasPreviewClient 
        groupId={id}
        groupName={group.name}
        groupEmoji={group.emoji}
        initialIdeas={ideas || []}
      />
    </div>
  );
} 