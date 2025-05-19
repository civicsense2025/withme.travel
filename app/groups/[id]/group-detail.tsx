/**
 * Group Details Server Component
 * 
 * Responsible for fetching group data and rendering the client component
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import GroupDetailClient from './group-detail-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TABLES } from '@/utils/constants/database';

// ============================================================================
// COMPONENT
// ============================================================================

interface GroupDetailProps {
  params: {
    id: string;
  };
}

export default async function GroupDetail({ params }: GroupDetailProps) {
  const { id: groupId } = params;
  
  if (!groupId) {
    return notFound();
  }

  try {
    // Create a server client to check if the user has access to the group
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );

    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Verify group exists and user has access
    const { data: group, error } = await supabase
      .from(TABLES.GROUPS)
      .select('id, name')
      .eq('id', groupId)
      .limit(1)
      .single();

    if (error || !group) {
      if (error?.code === 'PGRST116') {
        return notFound();
      }
      
      throw new Error(error?.message || 'Failed to fetch group');
    }

    // Render the client component with the group ID
    return <GroupDetailClient groupId={groupId} />;
  } catch (error) {
    console.error('Error in GroupDetail server component:', error);
    
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load group details. Please try again later.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button asChild>
            <Link href="/groups">Back to Groups</Link>
          </Button>
        </div>
      </div>
    );
  }
}
