/**
 * Group Details Client Component
 * 
 * Renders the group details page using client-side data fetching
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings, Share, UsersIcon, Image, Calendar, TrendingUp, PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/hooks/use-toast';
import { useGroupDetails } from '@/lib/features/groups/hooks/use-groups';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import InviteLinkBox from '../components/InviteLinkBox';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ClassErrorBoundary } from '@/components/features/ui/ErrorBoundary';
import { useGroupMembers } from 'lib/features/groups/hooks/use-group-members';
import { useGroupPlans } from 'lib/features/groups/hooks/use-group-plans';
import { useGroupIdeas } from 'lib/features/groups/hooks/use-group-ideas';
import { GroupMemberList } from 'components/features/groups/organisms/GroupMemberList';
import { GroupPlanList } from 'components/features/groups/organisms/GroupPlanList';
import { GroupIdeasConnected } from 'components/features/groups/organisms/GroupIdeasConnected';

// ============================================================================
// TYPES
// ============================================================================

interface GroupDetailClientProps {
  groupId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'plans' | 'ideas'>('overview');
  
  // Use the new hook to fetch group details
  const { 
    group,
    isLoading,
    error,
    fetchGroup
  } = useGroupDetails({ initialGroupId: groupId });

  // Members
  const membersState = useGroupMembers();
  // Plans
  const plansState = useGroupPlans(groupId);
  // Ideas
  const ideasState = useGroupIdeas(groupId);

  // Error state UI
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load group details. {error.message}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => router.push('/groups')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
          </Button>
          <Button onClick={() => fetchGroup(groupId)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Loading state UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size={32} />
        <p className="text-muted-foreground mt-4">Loading group details...</p>
      </div>
    );
  }

  // No data state UI
  if (!group) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The group you're looking for wasn't found or you don't have access to it.
          </AlertDescription>
        </Alert>
        
        <Button variant="outline" onClick={() => router.push('/groups')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
        </Button>
      </div>
    );
  }

  // Format creation date if available
  const formattedCreatedAt = group.created_at
    ? format(parseISO(group.created_at), 'MMM dd, yyyy')
    : 'Unknown date';

  return (
    <div className="container max-w-7xl mx-auto py-8">
      {/* Navigation back to groups */}
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => router.push('/groups')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/groups/${group.id}/plans`} legacyBehavior>
              <Calendar className="mr-2 h-4 w-4" /> Plans
            </Link>
          </Button>
          
          <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "This feature will be available soon!" })}>
            <Share className="mr-2 h-4 w-4" /> Share
          </Button>
          
          <Button variant="outline" asChild>
            <Link href={`/groups/${group.id}/ideas-preview`} legacyBehavior>
              <TrendingUp className="mr-2 h-4 w-4" /> Ideas
            </Link>
          </Button>
        </div>
      </div>
      {/* Group Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground mt-2">{group.description}</p>
            )}
            <div className="flex items-center mt-2">
              <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">{group.memberCount || 0} members</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-muted-foreground">Created on {formattedCreatedAt}</span>
            </div>
          </div>
          
          <Button variant="outline" asChild>
            <Link href="#edit-settings" legacyBehavior>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
        </div>
      </div>
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)} className="mb-10">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About this Group</CardTitle>
                  <CardDescription>Details and information about the group</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.description ? (
                      <p>{group.description}</p>
                    ) : (
                      <p className="text-muted-foreground">No description provided.</p>
                    )}
                    
                    {/* Example tags/categories, replace with actual data when available */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge>Travel</Badge>
                      <Badge variant="outline">Friends</Badge>
                      <Badge variant="secondary">Planning</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="#edit-description" legacyBehavior>
                      <PencilIcon className="mr-2 h-4 w-4" /> Edit Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <ClassErrorBoundary fallback={<Card className="mt-6"><CardContent>Failed to load activity</CardContent></Card>}>
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and changes in this group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-center py-8">
                      <p>No recent activity to display.</p>
                    </div>
                  </CardContent>
                </Card>
              </ClassErrorBoundary>
            </div>
            
            <div className="space-y-6">
              <ClassErrorBoundary fallback={<Card><CardContent>Failed to load members</CardContent></Card>}>
                <Card>
                  <CardHeader>
                    <CardTitle>Members</CardTitle>
                    <CardDescription>People in this group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {group.members && group.members.length > 0 ? (
                        group.members.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback>{member.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role || 'Member'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-2">No members found.</p>
                      )}
                      
                      {group.members && group.members.length > 5 && (
                        <>
                          <Separator />
                          <p className="text-sm text-center text-muted-foreground">
                            +{group.members.length - 5} more members
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#all-members" legacyBehavior>
                        <UsersIcon className="mr-2 h-4 w-4" /> View All Members
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </ClassErrorBoundary>
              
              <ClassErrorBoundary fallback={<Card><CardContent>Failed to load invite link</CardContent></Card>}>
                <Card>
                  <CardHeader>
                    <CardTitle>Invite Members</CardTitle>
                    <CardDescription>Share this link to invite others</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InviteLinkBox groupId={group.id} />
                  </CardContent>
                </Card>
              </ClassErrorBoundary>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="members">
          {membersState.loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <Spinner size={32} />
              <p className="text-muted-foreground mt-4">Loading members...</p>
            </div>
          ) : membersState.error ? (
            <Alert variant="destructive" title="Error" description={membersState.error} />
          ) : (
            <GroupMemberList 
              members={membersState.members.filter(m => typeof m.name === 'string') as any}
              onRemove={() => { /* TODO: implement remove */ }}
              onPromote={() => { /* TODO: implement promote */ }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="plans">
          {plansState.loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <Spinner size={32} />
              <p className="text-muted-foreground mt-4">Loading plans...</p>
            </div>
          ) : plansState.error ? (
            <Alert variant="destructive" title="Error" description={plansState.error?.message || 'Failed to load plans.'} />
          ) : (
            <GroupPlanList 
              plans={plansState.plans.map(plan => ({
                id: plan.id,
                title: plan.title || plan.name || 'Untitled',
                status: plan.status ?? 'active',
                icon: 'calendar', // TODO: map real icon if available
                votes: 0 // TODO: map real votes if available
              }))}
              onVote={() => { /* TODO: implement vote */ }}
              onClick={() => { /* TODO: implement click */ }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="ideas">
          {ideasState.loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <Spinner size={32} />
              <p className="text-muted-foreground mt-4">Loading ideas...</p>
            </div>
          ) : ideasState.error ? (
            <Alert variant="destructive" title="Error" description={ideasState.error?.message || 'Failed to load ideas.'} />
          ) : (
            <GroupIdeasConnected groupId={groupId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
