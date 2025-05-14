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
import { toast } from '@/components/ui/use-toast';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { Loader2, Plus, Edit, Trash, Archive, AlertCircle, FolderSymlink } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { City } from '@/types/multi-city';
import { createBrowserClient } from '@supabase/ssr';

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
  voting?: boolean;
  completed?: boolean;
  trip_id?: string;
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
      const response = await fetch(API_ROUTES.GROUP_PLANS.LIST(groupId));

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
      const response = await fetch(API_ROUTES.GROUP_PLANS.CREATE(groupId), {
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

      // Redirect to the new plan's page using the slug
      router.push(`/groups/${groupId}/plans/${plan.slug}`);
      return;
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
      const response = await fetch(API_ROUTES.GROUP_PLANS.UPDATE(groupId, currentPlan.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          is_archived: currentPlan.is_archived,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      const { plan } = await response.json();

      // Update the plan in state
      setPlans((prev) =>
        prev.map((p) =>
          p.id === currentPlan.id
            ? {
                ...p,
                name: plan.name,
                description: plan.description,
                updated_at: plan.updated_at,
              }
            : p
        )
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
      const response = await fetch(API_ROUTES.GROUP_PLANS.UPDATE(groupId, plan.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: plan.name,
          description: plan.description,
          is_archived: !plan.is_archived,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      const { plan: updatedPlan } = await response.json();

      // Update plan in state
      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id
            ? {
                ...p,
                is_archived: updatedPlan.is_archived,
                updated_at: updatedPlan.updated_at,
              }
            : p
        )
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
    if (
      !confirm(
        `Are you sure you want to delete "${plan.name}"? This will delete all ideas in this plan and cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(API_ROUTES.GROUP_PLANS.DELETE(groupId, plan.id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete plan');
      }

      // Remove plan from state
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));

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
    <div className="mx-auto container py-6 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {groupEmoji && <span>{groupEmoji}</span>}
            <span>{groupName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Travel Plans</p>
        </div>

        <div className="flex items-center gap-2">
          {(!isGuest || isGuest) && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  New Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Plan</DialogTitle>
                  <DialogDescription>
                    Create a new planning board to organize trip ideas with your group.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
                  {formError && (
                    <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {formError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Fall Trip to Hawaii"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description (Optional)
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's this plan about?"
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Plan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
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
          <h2 className="text-2xl font-semibold">Add your first plan</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Get everyone's ideas in one place and turn inspiration into actual plans.{' '}
          </p>
          {!isGuest && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first plan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            // Determine plan status
            let status: 'Not started' | 'Planning' | 'Voting' | 'Completed' = 'Not started';
            if (plan.ideas_count > 1) status = 'Planning';
            if (plan.voting) status = 'Voting';
            if (plan.completed || plan.trip_id) status = 'Completed';
            if (plan.ideas_count === 1) status = 'Planning';

            // Card background and badge color
            const cardBg =
              status === 'Completed'
                ? 'bg-gradient-to-br from-green-50 to-green-100'
                : status === 'Voting'
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100'
                  : status === 'Planning'
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100'
                    : 'bg-gradient-to-br from-gray-50 to-white';
            const badgeColor =
              status === 'Completed'
                ? 'bg-green-200 text-green-800'
                : status === 'Voting'
                  ? 'bg-blue-200 text-blue-800'
                  : status === 'Planning'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-gray-200 text-gray-800';

            return (
              <div
                key={plan.id}
                onClick={() => handlePlanClick(plan)}
                role="button"
                tabIndex={0}
                aria-label={`Open plan ${plan.name}`}
                className={`group relative w-full max-w-xs mx-auto min-h-[350px] h-[350px] flex flex-col justify-between rounded-2xl shadow-md transition-transform duration-150 hover:scale-[1.025] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 ${cardBg} p-6 cursor-pointer`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handlePlanClick(plan);
                }}
              >
                {/* Status badge top right */}
                <span
                  className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeColor} shadow-sm z-10`}
                >
                  {status}
                </span>
                {/* Card content */}
                <div className="flex-1 flex flex-col justify-start">
                  <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 pr-8">
                    {plan.name}
                  </span>
                  {plan.description && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-3 pr-2">
                      {plan.description}
                    </p>
                  )}
                  <span className="text-sm text-gray-700 mt-2">
                    {plan.ideas_count} idea{plan.ideas_count !== 1 && 's'}
                  </span>
                </div>
                {/* Created date moved to bottom left */}
                <span className="absolute bottom-4 left-4 text-[11px] text-gray-400">{`Created ${formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}`}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
