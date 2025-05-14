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
import { GroupCard } from '@/components/groups/group-card';
import { DeleteConfirmationDialog } from '@/components/groups/delete-confirmation-dialog';
import { FriendsList } from '@/components/friends-list';
import type { Friend } from '@/components/friends-list';
import type { Group, GroupMember } from '@/types/groups';
import { API_ROUTES } from '@/utils/constants/routes';
import { trackEvent } from '@/lib/tracking';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';

// Locally define the detailed Group type based on Supabase query
type TripCount = { count: number };

interface GroupWithDetails extends Omit<Group, 'group_members' | 'trip_count'> {
  group_members: Pick<GroupMember, 'user_id' | 'role' | 'status'>[];
  trip_count: TripCount[];
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

  const handleGroupCreated = (newGroup: Group) => {
    const groupWithDetails: GroupWithDetails = {
      ...newGroup,
      group_members: [],
      trip_count: [{ count: 0 }],
    };
    setGroups((prevGroups) => [groupWithDetails, ...prevGroups]);
    setModalOpen(false);
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
    const supabase = getBrowserClient();
    let failedCount = 0;

    for (const groupId of selectedGroupIds) {
      try {
        const { error } = await supabase.from('groups').delete().eq('id', groupId);

        if (error) {
          console.error(`Error deleting group ${groupId}:`, error);
          failedCount++;
        }
      } catch (error) {
        console.error(`Error deleting group ${groupId}:`, error);
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

  // Render header with title, description, and create button
  const renderHeader = () => {
    return (
      <PageHeader
        title="Groups"
        description="Create and manage travel groups with friends, family, or coworkers"
        centered={true}
        actions={
          <Link href="/groups/create">
            <Button
              size="default"
              className="flex items-center rounded-full px-5 bg-white text-black border border-gray-200 hover:bg-gray-100 hover:text-black"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </Link>
        }
      />
    );
  };

  const renderEmpty = () => {
    return (
      <div className="mt-8 text-center">
        <div className="mx-auto w-28 h-28 mb-6 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-14 w-14 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold">No Groups Yet</h2>
        <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
          Create a group to plan trips with friends, family, or colleagues.
        </p>
        <Button size="lg" className="rounded-full px-8" onClick={() => setModalOpen(true)}>
          Create Your First Group
        </Button>
      </div>
    );
  };

  return (
    <div className="container max-w-5xl py-8 md:py-16">
      {renderHeader()}

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
            renderEmpty()
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
                      memberCount: group.group_members?.length ?? 0,
                      tripCount: group.trip_count[0]?.count ?? 0,
                    }}
                    isSelectable={bulkMode}
                    isSelected={selectedGroupIds.has(group.id)}
                    onSelect={handleGroupSelection}
                    onDelete={handleSingleDelete}
                    bulkMode={bulkMode}
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
          onCreateGroup={handleGroupCreated}
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

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteGroups}
        itemCount={selectedGroupIds.size}
        itemType="group"
        isDeleting={isDeleting}
      />
    </div>
  );
}
