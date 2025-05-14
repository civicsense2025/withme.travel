'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Map, Clipboard, DollarSign, Tag, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TRIP_ROLES } from '@/utils/constants/status';

// Define types
type Idea = {
  id: string;
  title: string;
  description?: string;
  type: 'destination' | 'date' | 'activity' | 'budget' | 'other';
  votes_up: number;
  votes_down: number;
  created_by?: string;
  created_at: string;
};

type Member = {
  id: string;
  user_id: string;
  profiles: {
    email: string;
    full_name: string;
    avatar_url?: string;
  };
};

interface CreateTripModalProps {
  onClose: () => void;
  groupId: string;
  groupName: string;
  selectedIdeas: Idea[];
  members: Member[];
}

export function CreateTripModal({
  onClose,
  groupId,
  groupName,
  selectedIdeas,
  members,
}: CreateTripModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tripName, setTripName] = useState(groupName ? `${groupName} Trip` : 'New Trip');
  const [tripDescription, setTripDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    fetchUser();
  }, []);

  // Group ideas by type for display
  const ideasByType = selectedIdeas.reduce(
    (acc, idea) => {
      if (!acc[idea.type]) {
        acc[idea.type] = [];
      }
      acc[idea.type].push(idea);
      return acc;
    },
    {} as Record<string, Idea[]>
  );

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      toast({
        title: 'Trip name required',
        description: 'Please enter a name for your trip',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const supabase = getBrowserClient();

      // Create the trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert({
          name: tripName,
          description: groupName || `Trip created from ${groupName}`,
          created_by: currentUserId || undefined, // Use undefined rather than null
        } as any) // Use type assertion to bypass TypeScript error
        .select()
        .single();

      if (tripError) throw tripError;

      // Add trip members (all group members)
      const tripMembers = members.map((member) => ({
        trip_id: tripData.id,
        user_id: member.user_id ?? '',
        role: TRIP_ROLES.EDITOR,
      }));

      const { error: memberError } = await supabase.from('trip_members').insert(tripMembers);

      if (memberError) throw memberError;

      // Add destinations from ideas
      const destinationIdeas = selectedIdeas.filter((idea) => idea.type === 'destination');
      if (destinationIdeas.length > 0) {
        // Note: This would need more complex logic to create actual destinations
        // For now, we'll just add them as trip items
        const tripItems = destinationIdeas.map((idea) => ({
          trip_id: tripData.id,
          title: idea.title ?? '',
          description: idea.description ?? '',
          type: 'destination',
          status: 'suggested',
          date_start: null,
          date_end: null,
          category: 'Day Excursions' as const, // Constrain to valid category
        }));

        const { error: itemError } = await supabase
          .from('itinerary_items')
          .insert(tripItems as any); // Cast as any as a temporary fix

        if (itemError) throw itemError;
      }

      // Add activities from ideas
      const activityIdeas = selectedIdeas.filter((idea) => idea.type === 'activity');
      if (activityIdeas.length > 0) {
        const activityItems = activityIdeas.map((idea) => ({
          trip_id: tripData.id,
          title: idea.title ?? '',
          description: idea.description ?? '',
          type: 'activity',
          status: 'suggested',
          date_start: null,
          date_end: null,
          category: 'Day Excursions' as const, // Constrain to valid category
        }));

        const { error: activityError } = await supabase
          .from('itinerary_items')
          .insert(activityItems as any); // Cast as any as a temporary fix

        if (activityError) throw activityError;
      }

      // Add other ideas as notes
      const otherIdeas = selectedIdeas.filter(
        (idea) => !['destination', 'activity'].includes(idea.type)
      );

      if (otherIdeas.length > 0) {
        const tripNotes = otherIdeas.map((idea) => ({
          trip_id: tripData.id,
          content: `# ${idea.title ?? ''}\n${idea.description ?? ''}`,
          title: 'Group Notes',
          created_by: currentUserId || undefined, // Use undefined rather than null
        }));

        const { error: noteError } = await supabase.from('trip_notes').insert(tripNotes as any); // Use type assertion

        if (noteError) throw noteError;
      }

      // Success - redirect to the new trip
      toast({
        title: 'Trip created!',
        description: 'Your new trip has been created successfully.',
      });

      // Redirect to the new trip
      router.push(`/trips/${tripData.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Failed to create trip',
        description: `There was an error creating your trip: ${errorMessage}`,
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  // Helper to get a date from date ideas
  const getDateFromIdeas = (): string | null => {
    const dateIdeas = selectedIdeas.filter((idea) => idea.type === 'date');
    if (dateIdeas.length > 0) {
      // This is a simplification - would need actual date parsing
      // For now return current date + 30 days as an example
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toISOString();
    }
    return null;
  };

  // Get icon for idea type
  const getIdeaTypeIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <Map className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'activity':
        return <Clipboard className="h-4 w-4" />;
      case 'budget':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  // Get label for idea type
  const getIdeaTypeName = (type: string) => {
    switch (type) {
      case 'destination':
        return 'Destination';
      case 'date':
        return 'Date';
      case 'activity':
        return 'Activity';
      case 'budget':
        return 'Budget';
      default:
        return 'Other';
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => !isCreating && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Your Trip</DialogTitle>
          <DialogDescription>Turn your group's ideas into an exciting new trip.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Trip details form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input
                id="tripName"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Enter a name for your trip"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tripDescription">Trip Description (optional)</Label>
              <Textarea
                id="tripDescription"
                value={tripDescription}
                onChange={(e) => setTripDescription(e.target.value)}
                placeholder="Add a short description for your trip"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Group members */}
          <div className="space-y-2">
            <Label>Trip Members</Label>
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex -space-x-4">
                    {members.slice(0, 5).map((member) => (
                      <Avatar key={member.id} className="border-2 border-background">
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback>{member.profiles.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 5 && (
                      <Avatar className="border-2 border-background">
                        <AvatarFallback>+{members.length - 5}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <span className="ml-3">
                    {members.length} members from {groupName} will be invited
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected ideas summary */}
          <div className="space-y-4">
            <Label>Selected Ideas</Label>

            {Object.entries(ideasByType).map(([type, ideas]) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  {getIdeaTypeIcon(type)}
                  <span className="font-medium">{getIdeaTypeName(type)}</span>
                </div>

                <Card>
                  <CardContent className="p-3 space-y-2">
                    {ideas.map((idea) => (
                      <div key={idea.id} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="flex-1">{idea.title}</span>
                        <Badge variant="outline">{idea.votes_up} votes</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateTrip} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Trip'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
