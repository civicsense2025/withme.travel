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
import { createClient } from '@/lib/auth/supabase';
import GroupDetailClient from './group-detail-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import Link from 'next/link';
import { TABLES } from '@/utils/constants/database';

// ============================================================================
// TYPES
// ============================================================================

interface GroupDetailProps {
  params: {
    id: string;
  };
}

interface GroupData {
  id: string;
  name: string;
  [key: string]: any; // For additional properties
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch group data from Supabase
 */
async function getGroupData(groupId: string): Promise<GroupData> {
  const supabase = createClient();
  
  // Verify group exists and user has access
  const { data, error } = await supabase
    .from(TABLES.GROUPS)
    .select('id, name')
    .eq('id', groupId)
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('not_found');
    }
    throw new Error(error.message || 'Failed to fetch group');
  }
  
  if (!data) {
    throw new Error('not_found');
  }
  
  return data as GroupData;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Loading component for Suspense
 */
function GroupDetailLoading() {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Error component displayed when group loading fails
 */
function GroupDetailError({ error }: { error: Error }) {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message === 'not_found'
            ? 'This group does not exist or you do not have access to it.'
            : 'Failed to load group details. Please try again later.'}
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

/**
 * Group detail content wrapper that handles data fetching
 */
async function GroupDetailContent({ groupId }: { groupId: string }) {
  try {
    // Attempt to fetch group data
    await getGroupData(groupId);
    
    // Render the client component if group exists and user has access
    return <GroupDetailClient groupId={groupId} />;
  } catch (error) {
    // Handle errors
    if ((error as Error).message === 'not_found') {
      return notFound();
    }
    
    return <GroupDetailError error={error as Error} />;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GroupDetail({ params }: GroupDetailProps) {
  const { id: groupId } = params;
  
  if (!groupId) {
    return notFound();
  }
  
  // Use suspense for improved loading UX
  return (
    <Suspense fallback={<GroupDetailLoading />}>
      <GroupDetailContent groupId={groupId} />
    </Suspense>
  );
}