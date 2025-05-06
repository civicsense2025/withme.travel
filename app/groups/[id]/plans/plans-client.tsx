'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { Loader2, Plus, Edit, Trash, Archive, AlertCircle, FolderSymlink } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Type for a processed plan with ideas count
interface Plan {
  id: string;
  group_id: string;
  slug: string;
  name: string;
  description: string | null;
  is_archived?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  ideas_count: number;
  creator?: {
    id: string;
    email: string;
    user_metadata: any;
  };
}

interface PlansClientProps {
  groupId: string;
  initialPlans: Plan[];
  groupName: string;
  groupEmoji: string | null;
  isAdmin: boolean;
  userId: string;
}

export default function PlansClient({ 
  groupId, 
  initialPlans, 
  groupName, 
  groupEmoji, 
  isAdmin,
  userId
}: PlansClientProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  // New plan form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Load plans from API
  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.GROUP_IDEA_PLANS.LIST(groupId));
      
      if (!response.ok) {
        throw new Error('Failed to load plans');
      }
      
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Error loading plans:', err);
      toast({
        title: 'Error',
        description: 'Failed to load plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    
    try {
      setCreating(true);
      const response = await fetch(API_ROUTES.GROUP_IDEA_PLANS.CREATE(groupId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }
      
      const { plan } = await response.json();
      
      // Add the new plan to state
      setPlans(prev => [
        {
          ...plan,
          ideas_count: 0,
          creator: {
            id: userId,
            // These will be populated on reload
            email: '',
            user_metadata: {}
          }
        },
        ...prev
      ]);
      
      // Reset form and close dialog
      setName('');
      setDescription('');
      setCreateDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Plan created successfully',
      });
      
      // Reload plans from server to get the complete data
      loadPlans();
    } catch (err: any) {
      console.error('Error creating plan:', err);
      setFormError(err.message || 'Failed to create plan');
    } finally {
      setCreating(false);
    }
  };

  // Update a plan
  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!currentPlan) return;
    
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    
    try {
      setCreating(true);
      const response = await fetch(
        API_ROUTES.GROUP_IDEA_PLANS.UPDATE(groupId, currentPlan.id), 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name, 
            description,
            is_archived: currentPlan.is_archived 
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }
      
      const { plan } = await response.json();
      
      // Update the plan in state
      setPlans(prev => 
        prev.map(p => p.id === currentPlan.id ? {
          ...p,
          name: plan.name,
          description: plan.description,
          updated_at: plan.updated_at
        } : p)
      );
      
      // Reset form and close dialog
      setCurrentPlan(null);
      setName('');
      setDescription('');
      setEditDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Plan updated successfully',
      });
    } catch (err: any) {
      console.error('Error updating plan:', err);
      setFormError(err.message || 'Failed to update plan');
    } finally {
      setCreating(false);
    }
  };

  // Archive/unarchive a plan
  const handleToggleArchive = async (plan: Plan) => {
    try {
      const response = await fetch(
        API_ROUTES.GROUP_IDEA_PLANS.UPDATE(groupId, plan.id), 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: plan.name, 
            description: plan.description,
            is_archived: !plan.is_archived 
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }
      
      const { plan: updatedPlan } = await response.json();
      
      // Update plan in state
      setPlans(prev => 
        prev.map(p => p.id === plan.id ? {
          ...p,
          is_archived: updatedPlan.is_archived,
          updated_at: updatedPlan.updated_at
        } : p)
      );
      
      toast({
        title: 'Success',
        description: updatedPlan.is_archived 
          ? 'Plan archived successfully' 
          : 'Plan unarchived successfully',
      });
    } catch (err: any) {
      console.error('Error toggling archive status:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update plan',
        variant: 'destructive',
      });
    }
  };

  // Delete a plan
  const handleDeletePlan = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"? This will delete all ideas in this plan and cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(
        API_ROUTES.GROUP_IDEA_PLANS.DELETE(groupId, plan.id), 
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete plan');
      }
      
      // Remove plan from state
      setPlans(prev => prev.filter(p => p.id !== plan.id));
      
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
      });
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  // Set up edit form
  const handleEditClick = (plan: Plan) => {
    setCurrentPlan(plan);
    setName(plan.name);
    setDescription(plan.description || '');
    setEditDialogOpen(true);
  };

  // Navigate to a plan's ideas
  const handlePlanClick = (plan: Plan) => {
    router.push(`/groups/${groupId}/plans/${plan.slug}`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold flex items-center">
            {groupEmoji && <span className="mr-2 text-2xl">{groupEmoji}</span>}
            {groupName} Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            {plans.length} idea board{plans.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Create plan button */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new idea board</DialogTitle>
              <DialogDescription>
                Create a new idea board for your group to collaborate on.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreatePlan}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Trip Plan"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="This is for planning our summer vacation..."
                    className="col-span-3"
                  />
                </div>
                
                {formError && (
                  <div className="bg-destructive/10 p-3 rounded-md flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                    <p className="text-destructive text-sm">{formError}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Plan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit plan dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit idea board</DialogTitle>
              <DialogDescription>
                Update the details of your idea board.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpdatePlan}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Trip Plan"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-description" className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="This is for planning our summer vacation..."
                    className="col-span-3"
                  />
                </div>
                
                {formError && (
                  <div className="bg-destructive/10 p-3 rounded-md flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                    <p className="text-destructive text-sm">{formError}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Plan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Plans grid */}
      {loading && plans.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex h-20 w-20 rounded-full bg-muted items-center justify-center mb-4">
            <FolderSymlink className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold">No idea boards yet</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Create your first idea board to start collaborating on trip plans with your group.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.is_archived ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="mr-2 text-xl">{plan.name}</CardTitle>
                  {plan.is_archived && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      Archived
                    </span>
                  )}
                </div>
                <CardDescription className="flex items-center text-xs">
                  Created {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
                  {plan.creator && (
                    <>
                      {' by '}
                      <span className="font-medium">
                        {plan.creator.user_metadata?.full_name || plan.creator.email}
                      </span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                )}
                <p className="text-sm">
                  <span className="font-medium">{plan.ideas_count}</span> 
                  {' idea'}{plan.ideas_count !== 1 && 's'}
                </p>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePlanClick(plan)}
                >
                  Open Board
                </Button>
                
                <div className="flex gap-1">
                  {/* Only show edit/delete buttons if user is admin or creator */}
                  {(isAdmin || plan.created_by === userId) && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleArchive(plan)}
                        title={plan.is_archived ? "Unarchive" : "Archive"}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClick(plan)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePlan(plan)}
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 