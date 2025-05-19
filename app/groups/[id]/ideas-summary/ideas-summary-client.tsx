'use client';

/**
 * Group Plan Ideas Summary Client Component
 *
 * Provides a filterable, sortable view of all ideas across plans in a group
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Filter, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useVotes } from '@/hooks/use-votes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { GROUP_PLAN_IDEA_TYPE, VOTE_TYPES } from '@/utils/constants/status';
import { PAGE_ROUTES } from '@/utils/constants/routes';

// ============================================================================
// TYPES
// ============================================================================

type IdeaCreator = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
};

type Plan = {
  id: string;
  name: string;
  description?: string | null;
};

interface GroupIdea {
  id: string;
  group_id: string;
  plan_id?: string | null;
  created_by: string | null;
  guest_token?: string | null;
  title: string;
  description: string | null;
  type: keyof typeof GROUP_PLAN_IDEA_TYPE;
  votes_up: number;
  votes_down: number;
  created_at: string;
  updated_at: string;
  meta?: Record<string, any> | null;
  creator?: IdeaCreator | null;
  plan?: Plan | null;
  position?: Record<string, any> | null;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

interface IdeasSummaryClientProps {
  group: GroupData;
  ideas: GroupIdea[];
  isAuthenticated: boolean;
  memberRole: string | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function IdeasSummaryClient({
  group,
  ideas,
  isAuthenticated,
  memberRole,
}: IdeasSummaryClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { voteOnGroupIdea, isVoting } = useVotes();

  // State
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique plan IDs for filtering
  const uniquePlans = useMemo(() => {
    const planMap = new Map<string, Plan>();

    ideas.forEach((idea) => {
      if (idea.plan_id && idea.plan) {
        planMap.set(idea.plan_id, idea.plan);
      }
    });

    return Array.from(planMap.values());
  }, [ideas]);

  // Get unique idea types for filtering
  const ideaTypes = useMemo(() => {
    const types = new Set<string>();

    ideas.forEach((idea) => {
      types.add(idea.type);
    });

    return Array.from(types);
  }, [ideas]);

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    let result = [...ideas];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          (idea.description && idea.description.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filter !== 'all') {
      if (filter.startsWith('plan:')) {
        const planId = filter.substring(5);
        result = result.filter((idea) => idea.plan_id === planId);
      } else if (filter.startsWith('type:')) {
        const type = filter.substring(5);
        result = result.filter((idea) => idea.type === type);
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most-voted':
          return b.votes_up - b.votes_down - (a.votes_up - a.votes_down);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [ideas, filter, sortBy, searchQuery]);

  // Handle voting on ideas
  const handleVote = useCallback(
    async (ideaId: string, voteType: 'up' | 'down') => {
      if (!isAuthenticated) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to vote on ideas',
          variant: 'destructive',
        });
        return;
      }

      try {
        await voteOnGroupIdea(group.id, ideaId, voteType);

        toast({
          title: 'Vote recorded',
          description: 'Your vote has been submitted',
        });
      } catch (error) {
        console.error('Error voting on idea:', error);
        toast({
          title: 'Error voting',
          description: 'Could not record your vote. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [isAuthenticated, voteOnGroupIdea, group.id, toast]
  );

  // Get idea type label
  const getIdeaTypeLabel = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
  };

  // Get idea type color
  const getIdeaTypeColor = (type: string): string => {
    switch (type) {
      case GROUP_PLAN_IDEA_TYPE.DESTINATION:
        return 'bg-blue-500/10 text-blue-500';
      case GROUP_PLAN_IDEA_TYPE.DATE:
        return 'bg-purple-500/10 text-purple-500';
      case GROUP_PLAN_IDEA_TYPE.ACTIVITY:
        return 'bg-green-500/10 text-green-500';
      case GROUP_PLAN_IDEA_TYPE.BUDGET:
        return 'bg-amber-500/10 text-amber-500';
      case GROUP_PLAN_IDEA_TYPE.PLACE:
        return 'bg-rose-500/10 text-rose-500';
      case GROUP_PLAN_IDEA_TYPE.QUESTION:
        return 'bg-cyan-500/10 text-cyan-500';
      case GROUP_PLAN_IDEA_TYPE.NOTE:
        return 'bg-slate-500/10 text-slate-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Calculate net votes
  const getNetVotes = (idea: GroupIdea): number => {
    return (idea.votes_up || 0) - (idea.votes_down || 0);
  };

  // Get creator name
  const getCreatorName = (idea: GroupIdea): string => {
    if (idea.creator?.user_metadata?.full_name) {
      return idea.creator.user_metadata.full_name;
    }

    if (idea.creator?.email) {
      return idea.creator.email.split('@')[0];
    }

    return 'Anonymous';
  };

  // Get creator avatar
  const getCreatorAvatar = (idea: GroupIdea): string => {
    return idea.creator?.user_metadata?.avatar_url || '';
  };

  // Handle idea click
  const handleIdeaClick = (idea: GroupIdea) => {
    if (idea.plan_id) {
      router.push(`/groups/${group.id}/plans/${idea.plan_id}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/groups/${group.id}`)}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {group.name}
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Group Ideas Summary</h1>
        <p className="text-muted-foreground mb-6">
          Overview of all ideas across plans in {group.name}
        </p>

        {/* Filters and controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFilter('all')}>All ideas</DropdownMenuItem>

                  <DropdownMenuItem className="font-semibold pt-2">By Plan</DropdownMenuItem>
                  {uniquePlans.map((plan) => (
                    <DropdownMenuItem key={plan.id} onClick={() => setFilter(`plan:${plan.id}`)}>
                      {plan.name}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuItem className="font-semibold pt-2">By Type</DropdownMenuItem>
                  {ideaTypes.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setFilter(`type:${type}`)}>
                      {getIdeaTypeLabel(type)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="most-voted">Most voted</SelectItem>
                <SelectItem value="title">By title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ideas grid */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <p className="text-lg text-muted-foreground">No ideas found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader className="pb-2 cursor-pointer" onClick={() => handleIdeaClick(idea)}>
                  <div className="flex justify-between items-start">
                    <Badge className={getIdeaTypeColor(idea.type)}>
                      {getIdeaTypeLabel(idea.type)}
                    </Badge>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span
                        className={`font-semibold ${getNetVotes(idea) > 0 ? 'text-green-600' : getNetVotes(idea) < 0 ? 'text-red-600' : ''}`}
                      >
                        {getNetVotes(idea)}
                      </span>
                      votes
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2 line-clamp-2">{idea.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  {idea.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                      {idea.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground mb-2">No description</p>
                  )}

                  {idea.plan && (
                    <div className="mt-2">
                      <Badge className="text-xs">Plan: {idea.plan.name}</Badge>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={getCreatorAvatar(idea)} />
                      <AvatarFallback>
                        {getCreatorName(idea).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {isAuthenticated && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(idea.id, VOTE_TYPES.UP);
                        }}
                        disabled={isVoting}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(idea.id, VOTE_TYPES.DOWN);
                        }}
                        disabled={isVoting}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
