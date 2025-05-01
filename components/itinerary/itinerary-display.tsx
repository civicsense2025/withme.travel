import { API_ROUTES } from '@/utils/constants/routes';
import { ITEM_STATUSES } from '@/utils/constants/status';
('use client');

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Ban,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Profile } from '@/types/profile';
import { DisplayItineraryItem } from '@/types/itinerary';
import { getInitials } from '@/lib/utils'; // Assuming getInitials utility exists
import { ItemStatus } from '@/types/common';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Define a type alias for profile information in votes
type ProfileBasic = Profile;

interface ItineraryDisplayProps {
  initialItems: DisplayItineraryItem[];
  tripId: string;
  canEdit: boolean; // To control edit button visibility
}

export function ItineraryDisplay({ initialItems, tripId, canEdit }: ItineraryDisplayProps) {
  const [items, setItems] = useState<DisplayItineraryItem[]>(initialItems);
  const { toast } = useToast();
  const [updatingStatusItemId, setUpdatingStatusItemId] = useState<string | null>(null);
  const [expandedVoteItemId, setExpandedVoteItemId] = useState<string | null>(null); // State for expanded item

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    // Optimistic UI update (optional but improves UX)
    const originalItems = [...items];
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === itemId) {
          let newUpVotes = item.votes.up;
          let newDownVotes = item.votes.down;
          const currentUserVote = item.votes.userVote;

          if (currentUserVote === voteType) {
            // User is toggling off their vote
            voteType === 'up' ? newUpVotes-- : newDownVotes--;
            return {
              ...item,
              votes: { ...item.votes, up: newUpVotes, down: newDownVotes, userVote: null },
            };
          } else {
            // New vote or changing vote
            if (currentUserVote === 'up') newUpVotes--;
            if (currentUserVote === 'down') newDownVotes--;
            voteType === 'up' ? newUpVotes++ : newDownVotes++;
            return {
              ...item,
              votes: { ...item.votes, up: newUpVotes, down: newDownVotes, userVote: voteType },
            };
          }
        }
        return item;
      })
    );

    try {
      // Construct the vote API path manually
      const voteApiPath = `/api/trips/${tripId}/itinerary/vote`;
      const response = await fetch(voteApiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          vote_type: voteType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to record vote: ${response.statusText}`);
      }

      // Vote successful, maybe show a subtle confirmation
      // toast({ title: "Vote recorded" });
      // No need to refetch, optimistic update handles it. Refetch if needed.
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setItems(originalItems);
      toast({
        title: 'Error Voting',
        description: error instanceof Error ? error.message : 'Could not record vote.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingStatusItemId(itemId); // Indicate loading state for this item
    const originalItems = [...items];

    // Optimistic UI Update
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );

    try {
      // Real API call
      const response = await fetch(`/api/trips/${tripId}/itinerary/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error
        // Use specific error from API if available, otherwise generic message
        throw new Error(errorData.error || `Failed to update status (${response.status})`);
      }

      toast({ title: 'Status Updated', description: `Item status set to ${newStatus}.` });
      // Optimistic update was successful, no need to refetch state here
    } catch (error) {
      console.error('Error updating status:', error);
      setItems(originalItems); // Revert optimistic update on error
      toast({
        title: 'Error Updating Status',
        description: error instanceof Error ? error.message : 'Could not update item status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatusItemId(null); // Clear loading state regardless of outcome
    }
  };

  const renderVoters = (voters: Profile[]) => {
    // Only render if expanded
    if (!voters || voters.length === 0) return null;
    return (
      <div className="flex -space-x-2 overflow-hidden ml-1">
        {voters.slice(0, 5).map((voter) => (
          <Avatar
            key={voter.id}
            className="inline-block h-5 w-5 rounded-full ring-1 ring-white"
            title={voter.name || voter.username || 'User'}
          >
            <AvatarImage
              src={voter.avatar_url || undefined}
              alt={voter.name || voter.username || 'User'}
            />
            <AvatarFallback className="text-[8px]">
              {getInitials(voter.name || voter.username || 'U')}
            </AvatarFallback>
          </Avatar>
        ))}
        {voters.length > 5 && (
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-gray-600 text-[9px] font-medium ring-1 ring-white">
            +{voters.length - 5}
          </div>
        )}
      </div>
    );
  };

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No itinerary items added yet.</p>;
  }

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'approved':
        // Use secondary variant with green text/icon for success indication
        return (
          <Badge
            variant="secondary"
            className="ml-2 border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        // Destructive variant works well for rejected
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case 'pending':
      case 'suggested': // Use string literal instead of constant
      case null:
      default:
        // Outline variant is suitable for pending
        return (
          <Badge variant="outline" className="ml-2">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  // TODO: Group items by day/date
  return (
    <div className="space-y-6">
      {items.map((item) => {
        const isExpanded = expandedVoteItemId === item.id;
        return (
          <Card key={item.id} className={cn(item.status === 'rejected' && 'opacity-60')}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    {item.title}
                    {getStatusBadge(item.status)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                    {(item.start_time || item.address) && (
                      <div className="text-xs text-muted-foreground mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        {item.start_time && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {item.start_time}
                            {item.end_time ? ` - ${item.end_time}` : ''}
                          </span>
                        )}
                        {item.address && (
                          <span className="flex items-center mt-1 sm:mt-0">
                            <MapPin className="h-3 w-3 mr-1" /> {item.address}
                          </span>
                        )}
                      </div>
                    )}
                  </CardDescription>
                </div>
                {/* TODO: Add Edit Button if canEdit */}
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-3">
              {' '}
              {/* Adjusted padding */}
              <div className="flex items-center justify-between border-t pt-3">
                {' '}
                {/* Added padding top */}
                {/* Vote Summary / Toggle Button */}
                <button
                  type="button"
                  onClick={() => setExpandedVoteItemId(isExpanded ? null : item.id)}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-1">
                    <ThumbsUp
                      className={`h-4 w-4 ${item.votes.userVote === 'up' ? 'text-primary' : ''}`}
                    />
                    <span>{item.votes.up}</span>
                    {/* Render minimal voters only when expanded */}
                    {isExpanded && renderVoters(item.votes.upVoters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown
                      className={`h-4 w-4 ${item.votes.userVote === 'down' ? 'text-destructive' : ''}`}
                    />
                    <span>{item.votes.down}</span>
                    {/* Render minimal voters only when expanded */}
                    {isExpanded && renderVoters(item.votes.downVoters)}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {/* Expanded Actions (only render if expanded) */}
                {isExpanded && canEdit && item.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    {/* Approve/Reject Buttons */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto p-1.5 text-green-600 border-green-600/40 hover:bg-green-500/10"
                      onClick={() => handleStatusUpdate(item.id, 'approved')}
                      disabled={updatingStatusItemId === item.id}
                    >
                      {updatingStatusItemId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="ml-1 hidden sm:inline">Approve</span>{' '}
                      {/* Hide text on small screens */}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto p-1.5 text-red-600 border-red-600/40 hover:bg-red-500/10"
                      onClick={() => handleStatusUpdate(item.id, 'rejected')}
                      disabled={updatingStatusItemId === item.id}
                    >
                      {updatingStatusItemId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                      <span className="ml-1 hidden sm:inline">Reject</span>{' '}
                      {/* Hide text on small screens */}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
