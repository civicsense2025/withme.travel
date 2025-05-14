'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/utils/constants/routes';
import { ENUMS } from '@/utils/constants/database';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, PlusCircle, Loader2, MoreVertical, Info } from 'lucide-react';
import Link from 'next/link';
import IdeaCard from './idea-card';
import {
  GroupIdea as LocalGroupIdea,
  IdeaPosition as LocalIdeaPosition,
  ColumnId as LocalColumnId,
} from './store/idea-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateIdeaDialog from './create-idea-dialog';
import EditIdeaDialog from './edit-idea-dialog';
import PlansNavigation from '../components/plans-navigation';
import { debounce } from 'lodash';

interface PlanIdeasClientProps {
  groupId: string;
  planId: string;
  planSlug: string;
  planName: string;
  groupName: string;
  initialIdeas: LocalGroupIdea[];
  isAdmin: boolean;
  isCreator: boolean;
  userId: string;
  isAuthenticated: boolean;
  isGuest?: boolean;
  guestToken?: string | null;
}

interface AddIdeasDialogProps {
  groupId: string;
  planId: string;
  onIdeasAdded: (ideas: LocalGroupIdea[]) => void;
}

// Position update interface matching the server endpoint
interface IdeaPositionUpdate {
  ideaId: string;
  position: LocalIdeaPosition;
}

function AddIdeasDialog({ groupId, planId, onIdeasAdded }: AddIdeasDialogProps) {
  const [unassignedIdeas, setUnassignedIdeas] = useState<LocalGroupIdea[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unassigned ideas when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchUnassignedIdeas = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/groups/${groupId}/ideas?planId=null`);
          if (!response.ok) throw new Error('Failed to fetch unassigned ideas');

          const data = await response.json();
          setUnassignedIdeas(data.ideas || []);
        } catch (error) {
          console.error('Error fetching unassigned ideas:', error);
          toast({
            title: 'Error',
            description: 'Failed to load unassigned ideas',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchUnassignedIdeas();
    }
  }, [groupId, isOpen]);

  // Toggle idea selection
  const toggleIdeaSelection = (ideaId: string) => {
    setSelectedIdeas((prev) =>
      prev.includes(ideaId) ? prev.filter((id) => id !== ideaId) : [...prev, ideaId]
    );
  };

  // Add selected ideas to plan
  const addSelectedIdeasToPlan = async () => {
    if (selectedIdeas.length === 0) {
      toast({
        title: 'No ideas selected',
        description: 'Please select at least one idea to add',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/add-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideaIds: selectedIdeas }),
      });

      if (!response.ok) throw new Error('Failed to add ideas to plan');

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Added ${selectedIdeas.length} ideas to the plan`,
        });

        // Call the callback with the added ideas
        if (data.ideas) {
          onIdeasAdded(data.ideas);
        }

        // Close the dialog and reset state
        setIsOpen(false);
        setSelectedIdeas([]);
      }
    } catch (error) {
      console.error('Error adding ideas to plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to add ideas to the plan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="outline" className="ml-2">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Existing Ideas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Existing Ideas to Plan</DialogTitle>
          <DialogDescription>Select ideas from the group to add to this plan</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && unassignedIdeas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No unassigned ideas available in this group
          </div>
        )}

        {!isLoading && unassignedIdeas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            {unassignedIdeas.map((idea) => (
              <div
                key={idea.id}
                className={`border rounded-md p-3 cursor-pointer hover:bg-secondary/20 transition-colors ${
                  selectedIdeas.includes(idea.id)
                    ? 'border-primary bg-secondary/30'
                    : 'border-border'
                }`}
                onClick={() => toggleIdeaSelection(idea.id)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm">{idea.title}</h3>
                  <div className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                    {idea.type}
                  </div>
                </div>
                {idea.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {idea.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  By {idea.created_by || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={addSelectedIdeasToPlan}
            disabled={isLoading || selectedIdeas.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${selectedIdeas.length} ideas to plan`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveFromPlanDialogProps {
  groupId: string;
  planId: string;
  ideaId: string;
  ideaTitle: string;
  onRemoved: (ideaId: string) => void;
  trigger: React.ReactNode;
}

function RemoveFromPlanDialog({
  groupId,
  planId,
  ideaId,
  ideaTitle,
  onRemoved,
  trigger,
}: RemoveFromPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const removeFromPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/remove-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideaIds: [ideaId] }),
      });

      if (!response.ok) throw new Error('Failed to remove idea from plan');

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Idea removed from plan',
        });

        // Call the callback
        onRemoved(ideaId);
      }
    } catch (error) {
      console.error('Error removing idea from plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove idea from plan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Idea from Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove "{ideaTitle}" from this plan? This won't delete the idea
            - it will still be available in the group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={removeFromPlan}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              'Remove'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function PlanIdeasClient({
  groupId,
  planId,
  planSlug,
  planName,
  groupName,
  initialIdeas,
  isAdmin,
  isCreator,
  userId,
  isAuthenticated,
  isGuest,
  guestToken,
}: PlanIdeasClientProps) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<LocalGroupIdea[]>(initialIdeas);
  const [selectedIdea, setSelectedIdea] = useState<LocalGroupIdea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createIdeaOpen, setCreateIdeaOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ideas: ${response.statusText}`);
      }

      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ideas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reload ideas if initialIdeas changes (e.g., from server)
  useEffect(() => {
    if (initialIdeas && initialIdeas.length > 0) {
      setIdeas(initialIdeas);
    }
  }, [initialIdeas]);

  // Handle position changes
  const handlePositionChange = (ideaId: string, position: LocalIdeaPosition) => {
    // Update local state
    setIdeas((prevIdeas) => {
      return prevIdeas.map((idea) => {
        if (idea.id === ideaId) {
          return { ...idea, position };
        }
        return idea;
      });
    });

    // Create a properly typed position update
    const positionUpdate: IdeaPositionUpdate = { ideaId, position };

    // Send update to server
    fetch(`/api/groups/${groupId}/plans/${planId}/ideas/position`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        positions: [positionUpdate],
      }),
    }).catch((error) => {
      console.error('Error updating idea position:', error);
      toast({
        title: 'Error',
        description: 'Failed to update idea position',
        variant: 'destructive',
      });
    });
  };

  const handleAddIdeasToPlan = (newIdeas: LocalGroupIdea[]) => {
    setIdeas((prevIdeas) => [...prevIdeas, ...newIdeas]);
  };

  const handleRemoveIdeaFromPlan = (ideaId: string) => {
    setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
  };

  // Handle idea deletion
  const handleDeleteIdea = async (ideaId: string) => {
    if (!groupId || !planId) return;
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas/${ideaId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete idea');
      }
    } catch (err: any) {
      console.error('Error deleting idea:', err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Handle idea updates
  const handleIdeaUpdated = (updatedIdea: LocalGroupIdea) => {
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
  };

  // Debounced function to update idea positions on the server
  const debouncedUpdatePositions = useCallback(
    debounce(
      async (
        updatedIdeas: LocalGroupIdea[],
        columnId: LocalColumnId,
        newPosition: LocalIdeaPosition
      ) => {
        if (!groupId || !planId) return;
        try {
          await fetch(`/api/groups/${groupId}/plans/${planId}/ideas/position`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ideas: updatedIdeas, columnId, position: newPosition }), // Ensure position is typed
          });
        } catch (error) {
          console.error('Error updating positions:', error);
          toast({ title: 'Error', description: 'Failed to save order', variant: 'destructive' });
        }
      },
      1000
    ), // Adjust debounce time as needed
    [groupId, planId]
  );

  const handleReorderIdeas = (
    ideasInColumn: LocalGroupIdea[],
    columnId: LocalColumnId,
    position: LocalIdeaPosition
  ) => {
    // ... implementation ...
    // Call debouncedUpdatePositions if you update server side here
    // For client-side only reordering reflected by `ideas` state, ensure `setIdeas` is called.
  };

  // Add function to create a new idea
  const createIdea = async (formData: any) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          position: { columnId: formData.type, index: 0 },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create idea');
      }

      const { idea } = await response.json();

      // Add the new idea to the list
      setIdeas((prev) => [...prev, idea]);

      // Close the dialog
      setCreateIdeaOpen(false);

      toast({
        title: 'Success',
        description: 'Idea created successfully',
      });
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create idea',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="bg-background border-b p-4 sticky top-0 z-10">
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="flex flex-col space-y-1">
            <PlansNavigation groupId={groupId} groupName={groupName} planName={planName} />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mt-1">
              {planName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateIdeaOpen(true)}
              variant="default"
              size="sm"
              className="h-8"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Add Idea
            </Button>
            {isAuthenticated && (
              <AddIdeasDialog
                groupId={groupId}
                planId={planId}
                onIdeasAdded={handleAddIdeasToPlan}
              />
            )}
          </div>
        </div>
      </div>

      {isGuest && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 my-4 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You're viewing this as a guest.{' '}
              <a href="/signup" className="underline font-medium">
                Sign up
              </a>{' '}
              to create an account and keep track of your ideas.
            </p>
          </div>
        </div>
      )}

      {/* CreateIdeaDialog component */}
      <CreateIdeaDialog
        open={createIdeaOpen}
        onOpenChange={setCreateIdeaOpen}
        onSubmit={createIdea}
        isSubmitting={submitting}
      />

      {/* Ideas list */}
      {isLoading && ideas.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="flex flex-col h-full">
              <div className="relative">
                <IdeaCard
                  idea={idea}
                  onDelete={() => handleDeleteIdea(idea.id)}
                  onEdit={() => {
                    setSelectedIdea(idea);
                    setIsEditing(true);
                  }}
                  position={idea.position || { columnId: idea.type as LocalColumnId, index: 0 }}
                  onPositionChange={(newPosition: LocalIdeaPosition) =>
                    handlePositionChange(idea.id, newPosition)
                  }
                  userId={userId}
                  isAuthenticated={isAuthenticated}
                  groupId={groupId}
                  selected={selectedIdea?.id === idea.id}
                />
                <div className="absolute top-2 right-2 z-50">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedIdea(idea);
                          setIsEditing(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <RemoveFromPlanDialog
                        groupId={groupId}
                        planId={planId}
                        ideaId={idea.id}
                        ideaTitle={idea.title}
                        onRemoved={handleRemoveIdeaFromPlan}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            Remove from plan
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && ideas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="text-muted-foreground mb-4">No ideas in this plan yet</div>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Start by adding new ideas or importing existing ideas from the group
          </p>
          <Button onClick={() => setCreateIdeaOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Your First Idea
          </Button>
        </div>
      )}

      {/* Edit Idea Dialog */}
      {isEditing && selectedIdea && (
        <EditIdeaDialog
          groupId={groupId}
          planSlug={planSlug}
          open={isEditing}
          onOpenChange={setIsEditing}
          idea={selectedIdea}
          onIdeaUpdated={(updatedIdea) => {
            setIdeas((prev) => prev.map((i) => (i.id === updatedIdea.id ? updatedIdea : i)));
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}
