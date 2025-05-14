'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { IdeaCard } from './idea-card';
import { CreateIdeaDialog } from './create-idea-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GROUP_PLAN_IDEA_TYPE } from '@/utils/constants/status';
import { getBrowserClient } from '@/utils/supabase/browser-client';

interface IdeasGridProps {
  groupId: string;
  planId: string;
  initialIdeas?: any[];
  isAuthenticated?: boolean;
}

export function IdeasGrid({
  groupId,
  planId,
  initialIdeas = [],
  isAuthenticated = true,
}: IdeasGridProps) {
  const [ideas, setIdeas] = useState<any[]>(initialIdeas);
  const [filteredIdeas, setFilteredIdeas] = useState<any[]>(initialIdeas);
  const [loading, setLoading] = useState(initialIdeas.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const ideasPerPage = 9;

  const supabase = getBrowserClient();

  // Fetch ideas from the API
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ideas: ${response.statusText}`);
      }

      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching ideas');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates via Supabase
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`group_ideas_${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_plan_ideas',
          filter: `plan_id=eq.${planId}`,
        },
        () => {
          fetchIdeas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, planId]);

  // Fetch ideas on component mount if not provided
  useEffect(() => {
    if (initialIdeas.length === 0) {
      fetchIdeas();
    }
  }, []);

  // Filter and sort ideas whenever ideas, search, typeFilter, or sortBy changes
  useEffect(() => {
    let results = [...ideas];

    // Apply type filter
    if (typeFilter !== 'all') {
      results = results.filter((idea) => idea.type === typeFilter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      results = results.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchLower) ||
          (idea.description && idea.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'most_upvotes':
        results.sort((a, b) => (b.votes_up || 0) - (a.votes_up || 0));
        break;
      case 'most_downvotes':
        results.sort((a, b) => (b.votes_down || 0) - (a.votes_down || 0));
        break;
      case 'alphabetical':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredIdeas(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [ideas, search, typeFilter, sortBy]);

  // Handle idea created callback
  const handleIdeaCreated = (newIdea: any) => {
    setIdeas((prevIdeas) => [newIdea, ...prevIdeas]);
  };

  // Handle voting
  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    // Votes are already handled in the IdeaCard component
    // This could be used for additional actions when a vote is cast
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * ideasPerPage;
  const endIndex = startIndex + ideasPerPage;
  const paginatedIdeas = filteredIdeas.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredIdeas.length / ideasPerPage);

  // Navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ideas</h2>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Error Loading Ideas</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchIdeas}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (ideas.length === 0) {
    return (
      <div className="space-y-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ideas</h2>
          <CreateIdeaDialog
            groupId={groupId}
            planId={planId}
            onIdeaCreated={handleIdeaCreated}
            buttonLabel="Add First Idea"
          />
        </div>

        <div className="text-center py-16 border rounded-lg bg-muted/20">
          <h3 className="text-xl font-semibold mb-2">No Ideas Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Share your thoughts, suggestions or questions with the group by adding the first idea.
          </p>
          <CreateIdeaDialog
            groupId={groupId}
            planId={planId}
            onIdeaCreated={handleIdeaCreated}
            buttonVariant="secondary"
            buttonLabel="Add Your First Idea"
          />
        </div>
      </div>
    );
  }

  // No results after filtering
  if (filteredIdeas.length === 0) {
    return (
      <div className="space-y-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ideas</h2>
          <CreateIdeaDialog groupId={groupId} planId={planId} onIdeaCreated={handleIdeaCreated} />
        </div>

        <div className="flex flex-wrap gap-4 mb-6 justify-between">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ideas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <span>{typeFilter === 'all' ? 'All Types' : formatIdeaType(typeFilter)}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.ACTIVITY}>Activity</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.DESTINATION}>Destination</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.PLACE}>Place</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.DATE}>Date</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.BUDGET}>Budget</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.QUESTION}>Question</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.NOTE}>Note</SelectItem>
                <SelectItem value={GROUP_PLAN_IDEA_TYPE.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <span>{formatSortBy(sortBy)}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most_upvotes">Most Upvoted</SelectItem>
                <SelectItem value="most_downvotes">Most Downvoted</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-semibold mb-2">No Matching Ideas</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters to find ideas.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setTypeFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  // Normal state with results
  return (
    <div className="space-y-4 w-full max-w-full min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ideas ({filteredIdeas.length})</h2>
        <CreateIdeaDialog groupId={groupId} planId={planId} onIdeaCreated={handleIdeaCreated} />
      </div>

      <div className="flex flex-wrap gap-4 mb-6 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <span>{typeFilter === 'all' ? 'All Types' : formatIdeaType(typeFilter)}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.ACTIVITY}>Activity</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.DESTINATION}>Destination</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.PLACE}>Place</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.DATE}>Date</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.BUDGET}>Budget</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.QUESTION}>Question</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.NOTE}>Note</SelectItem>
              <SelectItem value={GROUP_PLAN_IDEA_TYPE.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <span>{formatSortBy(sortBy)}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most_upvotes">Most Upvoted</SelectItem>
              <SelectItem value="most_downvotes">Most Downvoted</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className="
          grid
          w-full
          h-[calc(100vh-150px)]
          overflow-y-auto
          pb-6
          gap-x-8 gap-y-8
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-5
        "
        style={{ gridAutoColumns: 'minmax(280px, 1fr)' }}
      >
        {paginatedIdeas.map((idea) => (
          <div key={idea.id} className="flex flex-col h-full px-4 min-w-[280px]">
            <IdeaCard
              key={idea.id}
              idea={idea}
              groupId={groupId}
              planId={planId}
              isAuthenticated={isAuthenticated}
              onVote={handleVote}
            />
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {filteredIdeas.length > ideasPerPage && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredIdeas.length)} of{' '}
            {filteredIdeas.length} ideas
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format the idea type for display
const formatIdeaType = (type: string) => {
  if (type === 'all') return 'All Types';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to format the sort by value for display
const formatSortBy = (sortBy: string) => {
  switch (sortBy) {
    case 'newest':
      return 'Newest';
    case 'oldest':
      return 'Oldest';
    case 'most_upvotes':
      return 'Most Upvoted';
    case 'most_downvotes':
      return 'Most Downvoted';
    case 'alphabetical':
      return 'A-Z';
    default:
      return 'Sort by';
  }
};
