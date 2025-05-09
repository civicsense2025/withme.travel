'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import type { Group, GroupMember } from '@/types/groups';
import { FriendsList } from '@/components/friends-list';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Friend } from '@/components/friends-list';

// Locally define the detailed Group type based on Supabase query
type TripCount = { count: number };

interface GroupWithDetails extends Omit<Group, 'group_members' | 'trip_count'> {
  group_members: Pick<GroupMember, 'user_id' | 'role' | 'status'>[];
  trip_count: TripCount[];
}

const CreateGroupModal = dynamic(() => import('./components/create-group-modal'), { ssr: false });

interface GroupsClientPageProps {
  initialGroups: GroupWithDetails[];
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

export default function GroupsClientPage({ initialGroups = [] }: GroupsClientPageProps) {
  const [groups, setGroups] = useState<GroupWithDetails[]>(initialGroups);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleGroupCreated = (newGroup: Group) => {
    const groupWithDetails: GroupWithDetails = {
      ...newGroup,
      group_members: [],
      trip_count: [{ count: 0 }],
    };
    setGroups((prevGroups) => [groupWithDetails, ...prevGroups]);
    setModalOpen(false);
  };
  
  return (
    <div className="container max-w-5xl py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Groups</h1>
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </div>
      
      <Tabs defaultValue="my-groups" className="mb-8">
        <TabsList>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
          <TabsTrigger value="my-friends">My Friends</TabsTrigger>
        </TabsList>
        <TabsContent value="my-groups" className="mt-6">
          {groups.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Time to bring your crew together</h3>
                <p className="text-muted-foreground mb-4 text-lg">
                Start a travel group and invite the friends you've been promising adventures with. <br /> From weekend getaways to bucket list trips—this is where it happens.
                </p>
                <Button onClick={() => setModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Link href={`/groups/${group.id}`} key={group.id}>
                  <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {group.trip_count[0]?.count ?? 0} Trips
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end pt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1.5 h-4 w-4" />
                        <span>{group.group_members?.length ?? 0} Members</span>
      </div>
                    </CardContent>
                  </Card>
                </Link>
          ))}
        </div>
          )}
        </TabsContent>
        <TabsContent value="invites" className="mt-6">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Group Invites</h3>
              <p className="text-muted-foreground mb-4 text-lg">
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
          </TooltipProvider>
        </TabsContent>
      </Tabs>

      <Suspense fallback={<div>Loading modal...</div>}>
      <CreateGroupModal 
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onCreateGroup={handleGroupCreated}
      />
      </Suspense>
    </div>
  );
} 