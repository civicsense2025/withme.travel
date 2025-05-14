import React from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import Link from 'next/link';
import IdeasPreviewClient from './ideas-preview-client';
import type { GroupIdea } from './ideas-preview-client';
import { TABLES } from '@/utils/constants/database';

interface IdeasPreviewClientProps {
  groupId: string;
  groupName: string;
  initialIdeas: GroupIdea[];
}

export default async function GroupIdeasPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params to access its properties
  const { id } = await params;

  // Use the correct server component client
  const supabase = await createServerComponentClient();

  console.log('Fetching group data for id:', id);

  // Fetch group without requiring authentication
  const { data: group, error: groupError } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .eq('id', id)
    .single();

  if (groupError || !group) {
    console.error('Error fetching group:', groupError);
    notFound();
  }

  // Check if group is visible to public
  // We're only checking visibility status, not the public_ideas_board field
  if (group.visibility !== 'public') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">This group is private</h1>
        <p className="text-center mb-6">
          You need to be a member of this group to see its ideas board.
        </p>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  // Fetch public ideas for this group
  const { data: ideas, error: ideasError } = await supabase
    .from('group_plan_ideas')
    .select('*')
    .eq('group_id', id)
    .order('created_at', { ascending: false });

  if (ideasError) {
    console.error('Error fetching ideas:', ideasError);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
        <p className="text-gray-600">{group.description}</p>
      </div>

      <IdeasPreviewClient groupId={id} groupName={group.name} initialIdeas={ideas as GroupIdea[]} />
    </div>
  );
}
