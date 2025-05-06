import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import GroupNavigation from './navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  // Await the params object to access its properties
  const { id } = await params;

  // Fetch the group to verify it exists and get its details
  const supabase = await createServerComponentClient();
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !group) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Link href="/groups" className="flex items-center text-sm hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to groups
        </Link>
      </div>
      
      <GroupNavigation groupId={id} />
      
      <main>{children}</main>
    </div>
  );
} 