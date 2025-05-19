'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast'
import { PAGE_ROUTES } from '@/utils/constants/routes';
import { Loader2, Plus, Edit, Trash, Archive, AlertCircle, FolderSymlink } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { City } from '@/types/multi-city';
import { createBrowserClient } from '@supabase/ssr';
import { useGroupPlans } from '@/lib/hooks/use-group-plans';
import { GroupPlan } from '@/lib/client/groupPlans';

interface PlansClientProps {
  groupId: string;
  initialPlans: GroupPlan[];
  groupName: string;
  groupEmoji: string | null;
  isAdmin: boolean;
  userId: string;
  isGuest?: boolean;
}

// Utility: Find the closest matching city by name (case-insensitive, fallback to country if needed)
async function findClosestCityMatch(cityOrDestination: string): Promise<City | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);
  // Try exact match first
  let { data, error } = await supabase.from('cities').select('*').ilike('name', cityOrDestination);
  if (!error && data && data.length > 0) return data[0];
  // Try partial match
  ({ data, error } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', `%${cityOrDestination}%`)
    .limit(1));
  if (!error && data && data.length > 0) return data[0];
  // Could add more fuzzy logic here (country, region, etc.)
  return null;
}

export default function PlansClient({
  groupId,
  initialPlans,
  groupName,
  groupEmoji,
  isAdmin,
  userId,
  isGuest = false,
}: PlansClientProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<GroupPlan | null>(null);

  // New plan form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Use our custom hook for plans management
  const { plans, loading, error, createPlan, updatePlan, deletePlan, refetch } =
    useGroupPlans(groupId);

  // Initialize form state when editing
  const handleEditClick = (plan: GroupPlan) => {
    setCurrentPlan(plan);
    setName(plan.name || plan.title || '');
    setDescription(plan.description || '');
    setEditDialogOpen(true);
  };

  // Handle plan click - navigate to plan details
  const handlePlanClick = (plan: GroupPlan) => {
    if (plan.slug) {
      router.push(PAGE_ROUTES.GROUP_PLAN(groupId, plan.slug));
    } else {
      router.push(`/groups/${groupId}/plans/${plan.id}`);
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

    const newPlan = await createPlan({ title: name, description });

    if (newPlan) {
      setCreateDialogOpen(false);
      setName('');
      setDescription('');

      // Redirect to the new plan
      if (newPlan.id) {
        router.push(`/groups/${groupId}/plans/${newPlan.id}`);
      }
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

    const success = await updatePlan(currentPlan.id, {
      title: name,
      description,
      is_archived: currentPlan.is_archived,
    });

    if (success) {
      setEditDialogOpen(false);
      setCurrentPlan(null);
      setName('');
      setDescription('');
    }
  };

  // Archive/unarchive a plan
  const handleToggleArchive = async (plan: GroupPlan) => {
    if (!plan.id) return;

    await updatePlan(plan.id, {
      title: plan.name || plan.title,
      description: plan.description,
      is_archived: !plan.is_archived,
    });
  };

  // Delete a plan
  const handleDeletePlan = async (plan: GroupPlan) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    if (plan.id) {
      await deletePlan(plan.id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {groupEmoji && <span className="mr-2">{groupEmoji}</span>}
            {groupName} Plans
          </h1>
          <p className="text-muted-foreground">Create and manage plans for your group</p>
        </div>
        <Button
          onClick={() => {
            setName('');
            setDescription('');
            setFormError('');
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> New Plan
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Failed to load plans. Please try again.</span>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-1">No plans yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first plan to start collaborating
          </p>
          <Button
            onClick={() => {
              setName('');
              setDescription('');
              setFormError('');
              setCreateDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Plan
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.is_archived ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <CardTitle
                className="text-lg flex items-center cursor-pointer"
                onClick={() => handlePlanClick(plan)}
              >
                {plan.title || plan.name}
                {plan.is_archived && (
                  <span className="ml-2 text-xs text-muted-foreground">(Archived)</span>
                )}
              </CardTitle>
              <CardDescription>
                Created {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">
                {plan.description || (
                  <span className="text-muted-foreground italic">No description</span>
                )}
              </p>
              {plan.ideas_count !== undefined && (
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.ideas_count} idea{plan.ideas_count !== 1 && 's'}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handlePlanClick(plan)}>
                View Plan
              </Button>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(plan);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleArchive(plan);
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(plan);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Create a plan to collaborate with your group members.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePlan}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Plan Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter plan name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {formError && (
                <div className="text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {formError}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Update your plan details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdatePlan}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Plan Name
                </label>
                <Input
                  id="edit-name"
                  placeholder="Enter plan name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {formError && (
                <div className="text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {formError}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
