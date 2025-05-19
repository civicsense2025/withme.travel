'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  PlusCircle,
  Users,
  Mail,
  Loader2,
  Check,
  Trash,
  CheckSquare,
  Square,
  X,
  CalendarClock,
  Bookmark,
  BookCheck,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { FriendsList } from '@/components/friends-list';
import type { Friend } from '@/components/friends-list';
import { API_ROUTES } from '@/utils/constants/routes';
import { trackEvent } from '@/lib/tracking';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { useGroups } from '@/lib/features/groups/hooks';
import { Group as ClientGroup } from '@/lib/client/groups';
import { EmptyState } from '@/components/shared/molecules';

// Locally define the detailed Group type based on Supabase query
type TripCount = { count: number };

interface GroupWithDetails extends Omit<ClientGroup, 'group_members' | 'trip_count'> {
  group_members: Array<{ user_id: string; role: string; status: string }>;
  trip_count: TripCount[];
  slug?: string;
  emoji?: string | null;
}

const CreateGroupModal = dynamic(() => import('./components/create-group-modal'), { ssr: false });

interface GroupsClientPageProps {
  initialGroups: GroupWithDetails[];
  isGuest?: boolean;
}

function GroupCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-muted/50">
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

export default function GroupsClientPage({
  initialGroups = [],
  isGuest = false,
}: GroupsClientPageProps) {
  // Use the groups hook
  const guestToken = isGuest
    ? typeof window !== 'undefined'
      ? window.localStorage.getItem('guestToken') || undefined
      : undefined
    : undefined;

  const {
    groups: hookGroups,
    isLoading,
    error: hookError,
    refresh: refreshGroups,
    createGroup: createGroupHook,
    deleteGroup: deleteGroupHook,
  } = useGroups(guestToken);

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<GroupWithDetails[]>(initialGroups);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInviteFriendDialogOpen, setInviteFriendDialogOpen] = useState(false);
  const [emailInvite, setEmailInvite] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with hook data when it changes
  useEffect(() => {
    if (hookGroups.length > 0) {
      const formattedGroups: GroupWithDetails[] = hookGroups.map((group) => ({
        ...group,
        group_members: [], // We don't have member data from the hook
        trip_count: [{ count: 0 }], // Default trip count
        slug: '', // Add required properties
        emoji: null, // Add required properties
      }));
      setGroups(formattedGroups);
    }
  }, [hookGroups]);

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter((group) => {
      return group.name.toLowerCase().includes(query);
    });
  }, [groups, searchQuery]);

  // Clear selections when exiting bulk mode
  useEffect(() => {
    if (!bulkMode) {
      setSelectedGroupIds(new Set());
    }
  }, [bulkMode]);

  const handleGroupCreated = async (newGroup: any) => {
    // Extract the data needed for the API
    const newGroupData = {
      name: newGroup.name,
      description: newGroup.description,
      visibility: newGroup.visibility as 'public' | 'private' | 'unlisted',
    };

    const result = await createGroupHook(newGroupData);

    if (result.success) {
      trackEvent('group_created', {
        group_id: result.groupId,
        visibility: newGroupData.visibility || 'private',
      });

      // Refresh groups to get the latest data
      refreshGroups();
      setModalOpen(false);
    }
  };

  const handleGroupSelection = (groupId: string, isSelected: boolean) => {
    setSelectedGroupIds((prev) => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(groupId);
      } else {
        newSelection.delete(groupId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(groups.map((group) => group.id));
    setSelectedGroupIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedGroupIds(new Set());
  };

  const handleDeleteGroups = async () => {
    if (selectedGroupIds.size === 0) return;

    setIsDeleting(true);
    let failedCount = 0;

    for (const groupId of selectedGroupIds) {
      try {
        const result = await deleteGroupHook(groupId);
        if (!result.success) {
          throw new Error(`Failed to delete group: ${result.error}`);
        }
      } catch (err) {
        console.error(`Error deleting group ${groupId}:`, err);
        failedCount++;
      }
    }

    // Update the groups list
    if (failedCount === 0) {
      setGroups((prevGroups) => prevGroups.filter((group) => !selectedGroupIds.has(group.id)));

      toast({
        title: 'Deleted successfully',
        description: `${
          selectedGroupIds.size === 1
            ? 'Group has been deleted'
            : `${selectedGroupIds.size} groups have been deleted`
        }`,
      });

      trackEvent('groups_deleted', {
        count: selectedGroupIds.size,
      });
    } else {
      toast({
        title: 'Deletion partially failed',
        description: `Failed to delete ${failedCount} ${failedCount === 1 ? 'group' : 'groups'}`,
        variant: 'destructive',
      });
    }

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setSelectedGroupIds(new Set());
    setBulkMode(false);
  };

  const handleSingleDelete = async (groupId: string) => {
    setSelectedGroupIds(new Set([groupId]));
    setIsDeleteDialogOpen(true);
  };

  const handleSendInvite = async () => {
    if (!emailInvite || !emailInvite.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch('/api/invitations/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInvite }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send invitation');
      }

      trackEvent('friend_invite_email_sent', {
        email: emailInvite,
        source: 'groups_page',
      });

      toast({
        title: 'Invitation sent!',
        description: `We've sent an invitation to ${emailInvite}`,
      });
      setEmailInvite('');
      setInviteFriendDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const renderEmpty = () => {
    return (
      <EmptyState
        title="No Groups Yet"
        description="Create a group to plan trips with friends, family, or colleagues."
        action={
          <Button size="lg" className="rounded-full px-8" onClick={() => setModalOpen(true)}>
            Create Your First Group
          </Button>
        }
        icon={<Users className="h-8 w-8" />}
        iconBackground="bg-muted"
        className="mt-8"
      />
    );
  };

  return (
    <div className="container max-w-4xl py-8 md:py-16 mx-auto">
      <Tabs defaultValue="my-groups" className="mb-12">
        <TabsList className="border-b border-zinc-200 dark:border-zinc-800 mb-8 px-0">
          <TabsTrigger value="my-groups" className="text-base">
            {isGuest ? 'Shared Groups' : 'My Groups'}
          </TabsTrigger>
          {!isGuest && (
            <>
              <TabsTrigger value="invites" className="text-base">
                Invites
              </TabsTrigger>
              <TabsTrigger value="my-friends" className="text-base">
                My Friends
              </TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="my-groups" className="mt-6">
          {groups.length === 0 ? (
            isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <GroupCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              renderEmpty()
            )
          ) : (
            <>
              {/* Search input */}
              {groups.length > 0 && (
                <div className="mt-8 mb-8">
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md mx-auto"
                  />
                </div>
              )}

              {/* Groups grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={{
                      id: group.id,
                      name: group.name,
                      description: group.description,
                      emoji: group.emoji,
                      memberCount: group.group_members?.length ?? 0,
                      tripCount: group.trip_count[0]?.count ?? 0,
                      createdAt: group.created_at,
                    }}
                    isSelectable={bulkMode}
                    isSelected={selectedGroupIds.has(group.id)}
                    onSelect={handleGroupSelection}
                    onDelete={handleSingleDelete}
                    bulkMode={bulkMode}
                    className="h-full"
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="invites" className="mt-6">
          <Card className="text-center py-16 border-2 border-black dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-black">
            <CardContent>
              <h3 className="text-2xl font-semibold mb-3">Group Invites</h3>
              <p className="text-muted-foreground mb-4 text-lg max-w-2xl mx-auto">
                Invitations to join groups will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="my-friends" className="mt-6">
          <TooltipProvider>
            <FriendsList
              title={undefined}
              emptyMessage="You haven't connected with any friends yet. Join a group or invite friends to get started!"
              onSelect={undefined}
              preSelectedFriendIds={[]}
              alreadyAddedIds={[]}
              variant="grid"
              containerClassName="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 justify-center"
            />
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                onClick={() => {
                  setInviteFriendDialogOpen(true);
                  trackEvent('invite_friends_button_clicked', { source: 'groups_page' });
                }}
              >
                <PlusCircle className="h-5 w-5 text-travel-purple" />
                Find & Invite Friends
              </Button>
            </div>
          </TooltipProvider>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Suspense fallback={<div>Loading modal...</div>}>
        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onGroupCreated={handleGroupCreated}
        />
      </Suspense>

      <Dialog open={isInviteFriendDialogOpen} onOpenChange={setInviteFriendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Friend</DialogTitle>
            <DialogDescription>Send an invitation to join you on withme.travel</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={emailInvite}
                onChange={(e) => setEmailInvite(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={handleSendInvite}
              disabled={isInviting}
            >
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span className="sr-only">Send invitation</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogDescription className="text-xs text-muted-foreground">
              We'll send them an invitation to join withme.travel
            </DialogDescription>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TODO: Migrate DeleteConfirmationDialog to shared/atomic location if still needed */}
      {/* <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteGroups}
        itemCount={selectedGroupIds.size}
        itemType="group"
        isDeleting={isDeleting}
      /> */}

      {hookError && <div className="text-red-500 mb-2">{hookError}</div>}
      <div className="mt-8">
        <Button onClick={refreshGroups} disabled={isLoading} className="flex items-center">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Refresh Groups
        </Button>
      </div>
    </div>
  );
}
