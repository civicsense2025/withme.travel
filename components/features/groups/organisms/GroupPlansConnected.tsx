/**
 * GroupPlansConnected Component (Organism)
 * 
 * A connected version of the group plans UI that fetches and manages
 * group plan data from the API.
 *
 * @module groups/organisms
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGroupPlans } from '@/lib/features/groups/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupPlansConnectedProps {
  /** ID of the group */
  groupId: string;
  /** Whether the current user is allowed to create/edit plans */
  canEdit?: boolean;
  /** Current user ID */
  userId?: string;
  /** Optional custom class names */
  className?: string;
  /** Callback when plan is selected */
  onPlanSelected?: (planId: string) => void;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface PlanCardProps {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  location?: string | null;
  memberCount?: number;
  onClick?: () => void;
}

function PlanCard({ id, title, description, date, location, memberCount, onClick }: PlanCardProps) {
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mt-auto">
        {date && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </Badge>
        )}
        
        {location && (
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </Badge>
        )}
        
        {memberCount && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{memberCount}</span>
          </Badge>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupPlansConnected({
  groupId,
  canEdit = false,
  userId = '',
  className = '',
  onPlanSelected,
}: GroupPlansConnectedProps) {
  const { plans, loading, error, fetchPlans, createPlan, updatePlan, deletePlan } = useGroupPlans();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Fetch plans on mount
  useEffect(() => {
    if (groupId) {
      fetchPlans(groupId).catch(err => {
        console.error('Error fetching plans:', err);
      });
    }
  }, [groupId, fetchPlans]);

  // Filtered plans based on search
  const filteredPlans = plans.filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers
  const handleCreatePlan = useCallback(async () => {
    if (!newPlanTitle.trim()) {
      toast({
        description: "Please enter a title for your plan",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createPlan(groupId, {
        title: newPlanTitle,
        description: newPlanDescription || undefined,
      });
      
      if (result.success) {
        toast({
          description: `Plan "${newPlanTitle}" created successfully`,
        });
        setCreateDialogOpen(false);
        setNewPlanTitle('');
        setNewPlanDescription('');
        // Refresh plans list
        fetchPlans(groupId);
        
        // If there's a callback for plan selection, call it
        if (onPlanSelected && result.planId) {
          onPlanSelected(result.planId);
        }
      } else {
        toast({
          title: "Failed to create plan",
          description: result.error || "An error occurred",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  }, [groupId, newPlanTitle, newPlanDescription, createPlan, toast, fetchPlans, onPlanSelected]);

  // Error state
  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Plans</h3>
        {canEdit && (
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Create Plan
          </Button>
        )}
      </div>

      {/* Search input */}
      <div className="mb-4 relative">
        <Input
          placeholder="Search plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Plans list */}
      {loading && plans.length === 0 ? (
        <div className="p-4 text-muted-foreground">Loading plans...</div>
      ) : filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.map(plan => (
            <PlanCard
              key={plan.id}
              id={plan.id}
              title={plan.title}
              description={plan.description}
              date={plan.start_date || plan.created_at}
              onClick={() => onPlanSelected?.(plan.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {searchQuery ? 'No plans match your search' : 'No plans yet'}
        </div>
      )}

      {/* Create plan dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Enter plan title"
                value={newPlanTitle}
                onChange={e => setNewPlanTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter plan description (optional)"
                value={newPlanDescription}
                onChange={e => setNewPlanDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 