'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TripVoting } from '@/components/trips/organisms';
import { Button } from '@/components/ui/button';
import { PlusCircle, VoteIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast'
import { createClient } from '@/utils/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreatePollModal } from './CreatePollModal';

interface TripVotingModalProps {
  tripId: string;
  polls: any[];
  onCreatePoll: () => void;
  onVote: () => void;
}

export function TripVotingModal({
  tripId,
  polls = [],
  onCreatePoll,
  onVote,
}: TripVotingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Filter polls into active and completed
  const activePolls = polls.filter((poll) => poll.is_active);
  const completedPolls = polls.filter((poll) => !poll.is_active);

  const handleVote = (pollId: string, optionId: string) => {
    onVote();
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsOpen(true)}>
        <VoteIcon className="h-4 w-4" />
        Group Vote {activePolls.length > 0 && `(${activePolls.length})`}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trip Voting</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">
                  Active Votes {activePolls.length > 0 && `(${activePolls.length})`}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed {completedPolls.length > 0 && `(${completedPolls.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="pt-4">
                {activePolls.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No active votes</p>
                    <CreatePollModal tripId={tripId} onPollCreated={onCreatePoll}>
                      <Button className="mt-4">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create New Vote
                      </Button>
                    </CreatePollModal>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {activePolls.map((poll) => (
                      <TripVoting
                        key={poll.id}
                        tripId={tripId}
                        pollId={poll.id}
                        title={poll.title}
                        description={poll.description}
                        options={poll.options.map((option: any) => ({
                          id: option.id,
                          title: option.title || option.text,
                          description: option.description || undefined,
                          imageUrl: option.image_url || undefined,
                          votes: option.votes || 0,
                          hasVoted: option.has_voted || false,
                        }))}
                        isActive={true}
                        expiresAt={poll.expires_at ? new Date(poll.expires_at) : null}
                        onVote={(optionId) => handleVote(poll.id, optionId)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="pt-4">
                {completedPolls.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No completed votes</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {completedPolls.map((poll) => (
                      <TripVoting
                        key={poll.id}
                        tripId={tripId}
                        pollId={poll.id}
                        title={poll.title}
                        description={poll.description}
                        options={poll.options.map((option: any) => ({
                          id: option.id,
                          title: option.title || option.text,
                          description: option.description || undefined,
                          imageUrl: option.image_url || undefined,
                          votes: option.votes || 0,
                          hasVoted: option.has_voted || false,
                        }))}
                        isActive={false}
                        showResults={true}
                        expiresAt={null}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="text-center pt-4 pb-2">
              <CreatePollModal tripId={tripId} onPollCreated={onCreatePoll}>
                <Button variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Vote
                </Button>
              </CreatePollModal>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
