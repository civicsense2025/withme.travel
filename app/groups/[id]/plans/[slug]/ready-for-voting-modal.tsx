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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ThumbsUp,
  Users,
  ArrowRight,
  MapPin,
  Calendar,
  Activity,
  DollarSign,
  FileText,
} from 'lucide-react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useToast } from '@/lib/hooks/use-toast'
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ColumnId as LocalColumnId } from './store/idea-store';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ReadyForVotingModalProps {
  onClose: () => void;
  groupId: string;
  planSlug: string;
}

export function ReadyForVotingModal({ onClose, groupId, planSlug }: ReadyForVotingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [ideasByType, setIdeasByType] = useState<Record<LocalColumnId, number>>({
    destination: 0,
    date: 0,
    activity: 0,
    budget: 0,
    other: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, any[]>>({});

  // Type for tracking counts of ideas by type - fixed to match the expected type
  type IdeaCountsByType = Record<string, number>;

  // Fetch group ideas and members
  useEffect(() => {
    async function fetchData() {
      if (!groupId || !planSlug) return;

      try {
        const supabase = getBrowserClient();

        // Fetch group members
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(
            `
            id,
            user_id,
            profiles:user_id (
              email,
              full_name,
              avatar_url
            )
          `
          )
          .eq('group_id', groupId)
          .eq('status', 'active');

        if (membersError) throw membersError;
        setActiveMembers(membersData || []);

        // Fetch ideas for THIS plan specifically, not just group ideas
        const { data: ideasData, error: ideasError } = await supabase
          .from('group_plan_ideas')
          .select('*')
          .eq('group_id', groupId)
          .eq('plan_id', planSlug);

        if (ideasError) throw ideasError;

        // Count ideas by type
        const counts: IdeaCountsByType = {
          destination: ideasData?.filter((idea) => idea.type === 'destination')?.length || 0,
          date: ideasData?.filter((idea) => idea.type === 'date')?.length || 0,
          activity: ideasData?.filter((idea) => idea.type === 'activity')?.length || 0,
          budget: ideasData?.filter((idea) => idea.type === 'budget')?.length || 0,
          other:
            ideasData?.filter(
              (idea) => !['destination', 'date', 'activity', 'budget'].includes(idea.type || '')
            )?.length || 0,
        };

        // Set total ideas count separately
        setTotalIdeas(ideasData?.length || 0);
        // Explicitly cast to the expected type for ideasByType
        setIdeasByType(counts as Record<LocalColumnId, number>);

        // Update the group status to "voting" in the database
        const { error } = await supabase.from('group_plans').update({}).eq('id', planSlug);

        if (error) throw error;

        // Navigate to the voting page after a brief delay for animation
        setTimeout(() => {
          router.push(`/groups/${groupId}/plans/${planSlug}/vote`);
        }, 1000);

        // Update category counts for UI
        const countsWithArrays: Record<string, any[]> = {};
        Object.keys(counts).forEach((key) => {
          // Convert each number to an array of that many empty items
          countsWithArrays[key] = Array(counts[key]).fill(null);
        });
        setCategoryCounts(countsWithArrays);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load group data.',
          variant: 'destructive',
        });
      }
    }

    fetchData();
  }, [groupId, planSlug, toast, router]);

  const handleStartVoting = async () => {
    try {
      setIsLoading(true);
      // Create a database record for the vote session
      const { data, error: createError } = await getBrowserClient()
        .from('group_plans')
        .update({})
        .eq('id', planSlug)
        .select('*')
        .single();

      if (createError) throw createError;

      toast({
        title: 'Voting phase started!',
        description: 'All members can now vote on ideas.',
      });

      // Navigate to the voting page after a brief delay for animation
      setTimeout(() => {
        router.push(`/groups/${groupId}/plans/${planSlug}/vote`);
      }, 1000);
    } catch (error) {
      console.error('Error starting voting phase:', error);
      toast({
        title: 'Error',
        description: 'Failed to start voting phase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate if all idea types have at least one idea
  const allTypesHaveIdeas = Object.values(ideasByType).every((count) => count > 0);

  // Calculate progress percentage (0-100)
  const progressPercentage = Object.values(ideasByType).filter((count) => count > 0).length * 20;

  // Get icon for each idea type
  const getTypeIcon = (type: LocalColumnId) => {
    switch (type) {
      case 'destination':
        return <MapPin className="h-4 w-4 text-[hsl(var(--travel-blue))]" />;
      case 'date':
        return <Calendar className="h-4 w-4 text-[hsl(var(--travel-yellow))]" />;
      case 'activity':
        return <Activity className="h-4 w-4 text-[hsl(var(--travel-mint))]" />;
      case 'budget':
        return <DollarSign className="h-4 w-4 text-[hsl(var(--travel-peach))]" />;
      case 'other':
        return <FileText className="h-4 w-4 text-[hsl(var(--travel-purple))]" />;
    }
  };

  // Get background color for progress items
  const getProgressColor = (type: LocalColumnId, isComplete: boolean) => {
    if (!isComplete) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';

    switch (type) {
      case 'destination':
        return 'bg-[hsl(var(--travel-blue)/0.1)] border-[hsl(var(--travel-blue)/0.3)]';
      case 'date':
        return 'bg-[hsl(var(--travel-yellow)/0.1)] border-[hsl(var(--travel-yellow)/0.3)]';
      case 'activity':
        return 'bg-[hsl(var(--travel-mint)/0.1)] border-[hsl(var(--travel-mint)/0.3)]';
      case 'budget':
        return 'bg-[hsl(var(--travel-peach)/0.1)] border-[hsl(var(--travel-peach)/0.3)]';
      case 'other':
        return 'bg-[hsl(var(--travel-purple)/0.1)] border-[hsl(var(--travel-purple)/0.3)]';
    }
  };

  // Get emoji for each idea type
  const getTypeEmoji = (type: LocalColumnId) => {
    switch (type) {
      case 'destination':
        return '📍';
      case 'date':
        return '📅';
      case 'activity':
        return '🏄‍♂️';
      case 'budget':
        return '💰';
      case 'other':
        return '💭';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden rounded-t-lg">
          <motion.div
            className="h-full bg-gradient-to-r from-[hsl(var(--travel-blue))] via-[hsl(var(--travel-mint))] to-[hsl(var(--travel-purple))]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="px-8 pt-8">
          <DialogHeader className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DialogTitle className="text-2xl flex items-center gap-3 font-bold">
                <CheckCircle2 className="h-6 w-6 text-[hsl(var(--travel-mint))]" />
                Ready for Voting!
              </DialogTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <DialogDescription className="text-base">
                Your group has collected {totalIdeas} ideas. Now it's time to vote on them!
              </DialogDescription>
            </motion.div>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-8 py-6">
          {/* Progress indicator */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Idea Collection Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercentage}% Complete</span>
            </div>

            <Progress value={progressPercentage} className="h-2 mb-5" />

            <div className="grid grid-cols-5 gap-3 mt-4">
              {(['destination', 'date', 'activity', 'budget', 'other'] as LocalColumnId[]).map(
                (type, index) => {
                  const isComplete = ideasByType[type] > 0;
                  return (
                    <motion.div
                      key={type}
                      className={cn(
                        'flex flex-col items-center p-3 rounded-xl border transition-all',
                        getProgressColor(type, isComplete)
                      )}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                    >
                      <div className="text-lg mb-1">{getTypeEmoji(type)}</div>
                      <div className="text-xs font-medium text-center capitalize">{type}</div>
                      <Badge
                        variant={isComplete ? 'secondary' : 'outline'}
                        className={cn(
                          'mt-2 text-xs px-2 py-0 min-w-[24px] flex justify-center',
                          isComplete ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                        )}
                      >
                        {ideasByType[type]}
                      </Badge>
                    </motion.div>
                  );
                }
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-base">Group Progress</h3>
                  <Badge
                    variant={allTypesHaveIdeas ? 'default' : 'outline'}
                    className={cn(
                      allTypesHaveIdeas
                        ? 'bg-[hsl(var(--travel-mint)/0.2)] text-[hsl(var(--travel-mint))] border-[hsl(var(--travel-mint)/0.3)]'
                        : ''
                    )}
                  >
                    {allTypesHaveIdeas ? 'All Categories Complete' : 'Categories In Progress'}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Your group has brainstormed {totalIdeas} ideas across all categories. Now it's
                  time to vote on which ones to include in your trip.
                </p>

                {/* Ideas by category */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 my-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--travel-blue))]">📍</span>
                    <span className="text-sm">Destinations: {ideasByType.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--travel-yellow))]">📅</span>
                    <span className="text-sm">Dates: {ideasByType.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--travel-mint))]">🏄‍♂️</span>
                    <span className="text-sm">Activities: {ideasByType.activity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--travel-peach))]">💰</span>
                    <span className="text-sm">Budget: {ideasByType.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(var(--travel-purple))]">💭</span>
                    <span className="text-sm">Other: {ideasByType.other}</span>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex -space-x-2">
                    {activeMembers.slice(0, 5).map((member, index) => (
                      <motion.div
                        key={member.id || index}
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      >
                        <Avatar className="border-2 border-background h-8 w-8">
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {(member.profiles?.full_name || 'Guest').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    ))}
                    {activeMembers.length > 5 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                      >
                        <Avatar className="border-2 border-background h-8 w-8">
                          <AvatarFallback>+{activeMembers.length - 5}</AvatarFallback>
                        </Avatar>
                      </motion.div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activeMembers.length} group members can vote
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="rounded-xl border border-amber-200 dark:border-amber-800/30 p-5 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm"
          >
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800 dark:text-amber-300">
                  What happens next?
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Moving to voting will allow all group members to vote on favorite ideas. The most
                  popular ideas will be used to create your trip.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <DialogFooter className="px-8 py-5 bg-muted/20 border-t flex-row justify-between">
          <Button variant="outline" onClick={onClose} className="px-5">
            Cancel
          </Button>
          <Button
            onClick={handleStartVoting}
            disabled={isLoading || totalIdeas === 0}
            className={cn(
              'space-x-2 bg-gradient-to-r from-[hsl(var(--travel-blue))] to-[hsl(var(--travel-purple))] hover:from-[hsl(var(--travel-blue))] hover:to-[hsl(var(--travel-purple))/0.9] hover:shadow-lg',
              'transition-all duration-300 px-5',
              isLoading || totalIdeas === 0
                ? 'opacity-70'
                : 'relative after:absolute after:inset-0 after:rounded-md after:animate-pulse after:bg-white/20 after:blur-md after:-z-10'
            )}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </span>
            ) : (
              <span className="flex items-center">
                Start Voting
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
