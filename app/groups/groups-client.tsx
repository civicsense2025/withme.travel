'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PlusCircle, Users, UserPlus, Mail, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import type { Group, GroupMember } from '@/types/groups';
import { FriendsList } from '@/components/friends-list';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import type { Friend } from '@/components/friends-list';
import { API_ROUTES } from '@/utils/constants/routes';
import { trackEvent } from '@/lib/tracking';

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
  const [isInviteFriendDialogOpen, setInviteFriendDialogOpen] = useState(false);
  const [emailInvite, setEmailInvite] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const handleGroupCreated = (newGroup: Group) => {
    const groupWithDetails: GroupWithDetails = {
      ...newGroup,
      group_members: [],
      trip_count: [{ count: 0 }],
    };
    setGroups((prevGroups) => [groupWithDetails, ...prevGroups]);
    setModalOpen(false);
  };

  const handleSendInvite = async () => {
    if (!emailInvite || !emailInvite.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
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
        source: 'groups_page'
      });

      toast({
        title: "Invitation sent!",
        description: `We've sent an invitation to ${emailInvite}`,
      });
      setEmailInvite('');
      setInviteFriendDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
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
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                onClick={() => {
                  setInviteFriendDialogOpen(true);
                  trackEvent('invite_friends_button_clicked', { source: 'groups_page' });
                }}
              >
                <PlusCircle className="h-5 w-5" />
                Find & Invite Friends
              </Button>
            </div>
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

      <Dialog open={isInviteFriendDialogOpen} onOpenChange={setInviteFriendDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl bg-white dark:bg-zinc-900">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-2xl font-medium text-center mb-1">Invite a Friend</DialogTitle>
            <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Send an invitation to connect with friends on withme.travel.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="bg-zinc-100 dark:bg-zinc-800 h-16 w-16 rounded-full flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 text-zinc-600 dark:text-zinc-300" />
            </div>
            
            <div className="w-full">
              <Input
                id="email"
                className="rounded-full h-12 px-4 bg-zinc-100 dark:bg-zinc-800 border-0 focus-visible:ring-primary focus-visible:ring-offset-2 text-center"
                placeholder="friend@example.com"
                value={emailInvite}
                onChange={(e) => setEmailInvite(e.target.value)}
                type="email"
              />
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl w-full">
              <h4 className="font-medium text-sm mb-2">Your friend will receive:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-green-500" />
                  <span className="text-sm">A link to create their withme.travel account</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-green-500" />
                  <span className="text-sm">An option to connect with you as a friend</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-green-500" />
                  <span className="text-sm">Your profile information</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setInviteFriendDialogOpen(false)}
              className="w-full sm:w-auto rounded-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvite}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white rounded-full"
              disabled={isInviting}
            >
              {isInviting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 