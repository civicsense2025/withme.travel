'use client'

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Clock, MapPin, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_ROUTES } from '@/utils/constants';
import { Profile } from '@/types/profiles'; // Assuming Profile type exists
import { ItineraryItem as ItineraryItemType } from '@/types/itinerary'; // Assuming ItineraryItem type exists
import { getInitials } from '@/lib/utils'; // Assuming getInitials utility exists

// Define the structure of processed vote data passed from the server component
interface ProcessedVotes {
  up: number;
  down: number;
  upVoters: Profile[];
  downVoters: Profile[];
  userVote: 'up' | 'down' | null;
}

// Define the structure of the itinerary item prop expected by this component
interface DisplayItineraryItem extends Omit<ItineraryItemType, 'votes'> {
  votes: ProcessedVotes;
  // Add any other properties needed for display if not in ItineraryItemType
}

interface ItineraryDisplayProps {
  initialItems: DisplayItineraryItem[];
  tripId: string;
  canEdit: boolean; // To control edit button visibility
}

export function ItineraryDisplay({ initialItems, tripId, canEdit }: ItineraryDisplayProps) {
  const [items, setItems] = useState<DisplayItineraryItem[]>(initialItems);
  const { toast } = useToast();

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    // Optimistic UI update (optional but improves UX)
    const originalItems = [...items];
    setItems(currentItems => 
      currentItems.map(item => {
        if (item.id === itemId) {
          let newUpVotes = item.votes.up;
          let newDownVotes = item.votes.down;
          const currentUserVote = item.votes.userVote;

          if (currentUserVote === voteType) { // User is toggling off their vote
            voteType === 'up' ? newUpVotes-- : newDownVotes--;
            return { ...item, votes: { ...item.votes, up: newUpVotes, down: newDownVotes, userVote: null } };
          } else { // New vote or changing vote
            if (currentUserVote === 'up') newUpVotes--;
            if (currentUserVote === 'down') newDownVotes--;
            voteType === 'up' ? newUpVotes++ : newDownVotes++;
            return { ...item, votes: { ...item.votes, up: newUpVotes, down: newDownVotes, userVote: voteType } };
          }
        }
        return item;
      })
    );

    try {
      // Construct the vote API path manually
      const voteApiPath = `/api/trips/${tripId}/itinerary/${itemId}/vote`; 
      const response = await fetch(voteApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to record vote: ${response.statusText}`);
      }

      // Vote successful, maybe show a subtle confirmation
      // toast({ title: "Vote recorded" }); 
      // No need to refetch, optimistic update handles it. Refetch if needed.
      
    } catch (error) {
      console.error("Error voting:", error);
      // Revert optimistic update on error
      setItems(originalItems);
      toast({ 
        title: "Error Voting", 
        description: error instanceof Error ? error.message : "Could not record vote.", 
        variant: "destructive" 
      });
    }
  };

  const renderVoters = (voters: Profile[]) => {
    if (!voters || voters.length === 0) return null;
    return (
      <div className="flex -space-x-2 overflow-hidden">
        {voters.slice(0, 5).map((voter) => (
          <Avatar key={voter.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white" title={voter.name || voter.username || 'User'}>
            <AvatarImage src={voter.avatar_url || undefined} alt={voter.name || voter.username || 'User'} />
            <AvatarFallback>{getInitials(voter.name || voter.username || 'U')}</AvatarFallback>
          </Avatar>
        ))}
        {voters.length > 5 && (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-xs font-medium ring-2 ring-white">
            +{voters.length - 5}
          </div>
        )}
      </div>
    );
  };

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No itinerary items added yet.</p>;
  }

  // TODO: Group items by day/date
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="mt-1">
                  {item.description}
                  {(item.start_time || item.address) && (
                    <div className="text-xs text-muted-foreground mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      {item.start_time && (
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1"/> {item.start_time}{item.end_time ? ` - ${item.end_time}` : ''}</span>
                      )}
                      {item.address && (
                         <span className="flex items-center mt-1 sm:mt-0"><MapPin className="h-3 w-3 mr-1"/> {item.address}</span>
                      )}
                    </div>
                  )}
                </CardDescription>
              </div>
              {/* TODO: Add Edit Button if canEdit */} 
            </div>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between mt-2 pt-2 border-t">
                {/* Voting Section */}
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1">
                      <Button
                          size="sm"
                          variant={item.votes.userVote === 'up' ? 'default' : 'ghost'}
                          onClick={() => handleVote(item.id, 'up')}
                          className="p-1 h-auto"
                      >
                          <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[12px] text-center">{item.votes.up}</span>
                      {renderVoters(item.votes.upVoters)}
                  </div>
                  <div className="flex items-center gap-1">
                       <Button
                          size="sm"
                          variant={item.votes.userVote === 'down' ? 'destructive' : 'ghost'}
                          onClick={() => handleVote(item.id, 'down')}
                          className="p-1 h-auto"
                      >
                          <ThumbsDown className="h-4 w-4" />
                       </Button>
                      <span className="text-sm font-medium min-w-[12px] text-center">{item.votes.down}</span>
                      {renderVoters(item.votes.downVoters)}
                   </div>
                </div>
                {/* Add other actions like comments? */}
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 