/**
 * Group Details Page
 * 
 * This is the main entry point for the group details page.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import GroupDetail from './group-detail';

interface GroupPageProps {
  params: {
    id: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  try {
    // Create a Supabase client for getting group info for metadata
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
            // This is just for type completeness
          },
          remove(name: string, options: any) {
            // This is just for type completeness
          },
        },
      }
    );

    // Fetch basic group data for the metadata
    const { data: group, error } = await supabase
      .from('groups')
      .select('name, description')
      .eq('id', params.id)
      .single();

    if (error || !group) {
      return {
        title: 'Group | Withme',
        description: 'Plan your trips with friends and family.',
      };
    }

    return {
      title: `${group.name} | Withme`,
      description: group.description || 'Plan your trips with friends and family.',
      openGraph: {
        title: `${group.name} | Withme`,
        description: group.description || 'Plan your trips with friends and family.',
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Group | Withme',
      description: 'Plan your trips with friends and family.',
    };
  }
}

export default function GroupPage(props: GroupPageProps) {
  return <GroupDetail {...props} />;
}
