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
import { useGroupIdeas } from '@/hooks/use-group-ideas';

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
                  selectedIdeas.includes(idea.id) ? 'bg-secondary/20 border-primary' : ''
                }`}
                onClick={() => toggleIdeaSelection(idea.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{idea.title}</div>
                    {idea.description && (
                      <div className="text-xs text-muted-foreground mt-1">{idea.description}</div>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-sm border ${
                      selectedIdeas.includes(idea.id)
                        ? 'bg-primary border-primary text-primary-foreground flex items-center justify-center'
                        : 'border-input'
                    }`}
                  >
                    {selectedIdeas.includes(idea.id) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={addSelectedIdeasToPlan} disabled={selectedIdeas.length === 0}>
            Add Selected ({selectedIdeas.length})
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const removeFromPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas/${ideaId}/remove`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove idea from plan');
      }

      // Call the callback to update the UI
      onRemoved(ideaId);
      
      setIsOpen(false);
      
      toast({
        title: 'Success',
        description: 'Idea removed from plan',
      });
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove idea from plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove "{ideaTitle}" from this plan? This will only remove it from
            the plan, the idea will still be available in your group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              removeFromPlan();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing...
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
  // Use the groupIdeas hook
  const { ideas: groupIdeas, loading: groupIdeasLoading, createIdea: createGroupIdea, refetch } = useGroupIdeas(groupId);
  
  const [isLoading, setIsLoading] = useState(true);
  const [ideas, setIdeas] = useState<LocalGroupIdea[]>(initialIdeas || []);
  const [createIdeaOpen, setCreateIdeaOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<LocalGroupIdea | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch ideas on load
  useEffect(() => {
    if (initialIdeas?.length > 0) {
      setIdeas(initialIdeas);
      setIsLoading(false);
    } else {
      fetchIdeas();
    }
  }, [initialIdeas]);

  // Fetch plan ideas
  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ideas. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle idea position change
  const handlePositionChange = (ideaId: string, position: LocalIdeaPosition) => {
    // Update local state first for immediate feedback
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => (idea.id === ideaId ? { ...idea, position } : idea))
    );

    // Debounced function to send position update to server
    const updateIdeaPosition = debounce(async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            updates: [{ ideaId, position }] 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update idea position');
        }
      } catch (error) {
        console.error('Error updating idea position:', error);
        toast({
          title: 'Error',
          description: 'Failed to save idea position',
          variant: 'destructive',
        });
        // Refresh ideas to get the correct positions
        fetchIdeas();
      }
    }, 500);

    updateIdeaPosition();
  };

  // Handle adding ideas to the plan from existing group ideas
  const handleAddIdeasToPlan = (newIdeas: LocalGroupIdea[]) => {
    setIdeas((prev) => [...prev, ...newIdeas]);
  };

  // Handle removing an idea from the plan
  const handleRemoveIdeaFromPlan = (ideaId: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
  };

  // Handle deleting an idea completely
  const handleDeleteIdea = async (ideaId: string) => {
    if (!window.confirm('Are you sure you want to delete this idea? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/ideas/${ideaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }

      // Remove the idea from the list
      setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));

      toast({
        title: 'Success',
        description: 'Idea deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete idea',
        variant: 'destructive',
      });
    }
  };

  // Handle updating an idea
  const handleIdeaUpdated = (updatedIdea: LocalGroupIdea) => {
    setIdeas((prev) => prev.map((i) => (i.id === updatedIdea.id ? updatedIdea : i)));
  };

  // Handle reordering ideas within a column
  const handleReorderIdeas = (
    ideasInColumn: LocalGroupIdea[],
    columnId: LocalColumnId,
    position: LocalIdeaPosition
  ) => {
    // Handle reordering by mapping new positions
    // For client-side only reordering reflected by `ideas` state, ensure `setIdeas` is called.
  };

  // Add function to create a new idea
  const createIdea = async (formData: any) => {
    setSubmitting(true);
    try {
      // Use the createGroupIdea from useGroupIdeas hook instead of direct API call
      const newIdea = await createGroupIdea({
        ...formData,
        position: { columnId: formData.type, index: 0 },
      });

      if (newIdea) {
        // Add the new idea to the list
        setIdeas((prev) => [...prev, newIdea]);

        // Close the dialog
        setCreateIdeaOpen(false);

        toast({
          title: 'Success',
          description: 'Idea created successfully',
        });
      }
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
