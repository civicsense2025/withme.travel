'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/utils/constants/routes';
import { ENUMS } from '@/utils/constants/database';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, PlusCircle, Loader2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import IdeaCard from '../../ideas/idea-card';
import { GroupIdea, IdeaPosition } from '../../ideas/store/idea-store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateIdeaDialog from './create-idea-dialog';
import EditIdeaDialog from './edit-idea-dialog';
import PlansNavigation from '../components/plans-navigation';

interface PlanIdeasClientProps {
  groupId: string;
  planId: string;
  planSlug: string;
  planName: string;
  groupName: string;
  initialIdeas: GroupIdea[];
  isAdmin: boolean;
  isCreator: boolean;
  userId: string;
}

interface AddIdeasDialogProps {
  groupId: string;
  planId: string;
  onIdeasAdded: (ideas: GroupIdea[]) => void;
}

function AddIdeasDialog({ groupId, planId, onIdeasAdded }: AddIdeasDialogProps) {
  const [unassignedIdeas, setUnassignedIdeas] = useState<GroupIdea[]>([]);
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
    setSelectedIdeas(prev => 
      prev.includes(ideaId)
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
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
          <DialogDescription>
            Select ideas from the group to add to this plan
          </DialogDescription>
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
            {unassignedIdeas.map(idea => (
              <div 
                key={idea.id}
                className={`border rounded-md p-3 cursor-pointer hover:bg-secondary/20 transition-colors ${
                  selectedIdeas.includes(idea.id) ? 'border-primary bg-secondary/30' : 'border-border'
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
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
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
  trigger 
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
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Idea from Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove "{ideaTitle}" from this plan?
            This won't delete the idea - it will still be available in the group.
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
  userId
}: PlanIdeasClientProps) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<GroupIdea[]>(initialIdeas);
  const [selectedIdea, setSelectedIdea] = useState<GroupIdea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load ideas from the server
  const loadIdeas = async () => {
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
  const handlePositionChange = (ideaId: string, position: IdeaPosition) => {
    // Update local state
    setIdeas(prevIdeas => {
      return prevIdeas.map(idea => {
        if (idea.id === ideaId) {
          return { ...idea, position };
        }
        return idea;
      });
    });
    
    // Send update to server
    fetch(`/api/groups/${groupId}/plans/${planId}/ideas/position`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        positions: [{ ideaId, position }]
      }),
    }).catch(error => {
      console.error('Error updating idea position:', error);
      toast({
        title: 'Error',
        description: 'Failed to update idea position',
        variant: 'destructive',
      });
    });
  };
  
  const handleAddIdeasToPlan = (newIdeas: GroupIdea[]) => {
    setIdeas(prevIdeas => [...prevIdeas, ...newIdeas]);
  };

  const handleRemoveIdeaFromPlan = (ideaId: string) => {
    setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
  };

  // Handle idea deletion
  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/ideas/${ideaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }
      
      // Remove from local state
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
      
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
  
  // Handle idea updates
  const handleIdeaUpdated = (updatedIdea: GroupIdea) => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea.id === updatedIdea.id ? updatedIdea : idea
      )
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="bg-background border-b p-4 sticky top-0 z-10">
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="flex flex-col space-y-1">
            <PlansNavigation 
              groupId={groupId} 
              groupName={groupName} 
              planName={planName} 
            />
            <h1 className="text-xl font-semibold mt-1">{planName}</h1>
          </div>
          <div className="flex">
            <CreateIdeaDialog 
              groupId={groupId}
              planId={planId}
              onIdeaCreated={(newIdea: GroupIdea) => {
                setIdeas(prev => [...prev, newIdea]);
              }}
            />
            <AddIdeasDialog
              groupId={groupId}
              planId={planId}
              onIdeasAdded={handleAddIdeasToPlan}
            />
          </div>
        </div>
      </div>
      
      {/* Ideas list */}
      {isLoading && ideas.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ideas.map(idea => (
            <div key={idea.id} className="flex flex-col h-full">
              <div className="relative">
                <IdeaCard
                  idea={idea}
                  onDelete={() => handleDeleteIdea(idea.id)}
                  onEdit={() => {
                    setSelectedIdea(idea);
                    setIsEditing(true);
                  }}
                  position={idea.position || { columnId: idea.type as any, index: 0 }}
                  onPositionChange={(position) => handlePositionChange(idea.id, position)}
                  userId={userId}
                  isAuthenticated={true}
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
          <div className="text-muted-foreground mb-4">
            No ideas in this plan yet
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Start by adding new ideas or importing existing ideas from the group
          </p>
        </div>
      )}
      
      {/* Edit Idea Dialog */}
      <EditIdeaDialog
        groupId={groupId}
        open={isEditing}
        onOpenChange={setIsEditing}
        idea={selectedIdea}
        onIdeaUpdated={handleIdeaUpdated}
      />
    </div>
  );
} 