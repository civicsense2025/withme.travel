'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FriendsList } from './friends-list';
import { UserPlus, Users, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface InviteFriendsDialogProps {
  groupId: string;
  groupName: string;
  alreadyAddedUserIds?: string[];
  onInviteSuccess?: (invitedFriendIds: string[]) => void;
  children?: React.ReactNode;
}

export function InviteFriendsDialog({
  groupId,
  groupName,
  alreadyAddedUserIds = [],
  onInviteSuccess,
  children,
}: InviteFriendsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [inviteComplete, setInviteComplete] = useState(false);
  const { toast } = useToast();

  const handleSelectFriends = (friendIds: string[]) => {
    setSelectedFriendIds(friendIds);
  };

  const handleInvite = async () => {
    if (selectedFriendIds.length === 0) {
      toast({
        title: 'No friends selected',
        description: 'Please select at least one friend to invite.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // This API endpoint would need to be created
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_ids: selectedFriendIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to invite members');
      }

      // Show success
      setInviteComplete(true);

      // Notify parent component
      if (onInviteSuccess) {
        onInviteSuccess(selectedFriendIds);
      }

      // Show toast
      toast({
        title: 'Invitations sent',
        description: `${selectedFriendIds.length} friend${selectedFriendIds.length !== 1 ? 's' : ''} have been invited to the group.`,
      });

      // Close dialog after a brief delay
      setTimeout(() => {
        setOpen(false);
        // Reset state after closing
        setTimeout(() => {
          setInviteComplete(false);
          setSelectedFriendIds([]);
        }, 300);
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitations',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Friends
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {inviteComplete ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Friends Invited</h3>
            <p className="text-center text-muted-foreground">
              Your friends have been invited to join {groupName}.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite Friends to {groupName}</DialogTitle>
              <DialogDescription>
                Select friends to invite to this group. They'll receive an invitation notification.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="friends" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="friends">
                  <Users className="h-4 w-4 mr-2" />
                  Friends
                </TabsTrigger>
                <TabsTrigger value="email" disabled>
                  Email Invite (Coming Soon)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="friends" className="mt-4">
                <FriendsList
                  mode="select"
                  title="Select Friends"
                  emptyMessage="You don't have any friends yet. Add friends to invite them."
                  onSelect={handleSelectFriends}
                  alreadyAddedIds={alreadyAddedUserIds}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={selectedFriendIds.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite {selectedFriendIds.length > 0 ? `(${selectedFriendIds.length})` : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
