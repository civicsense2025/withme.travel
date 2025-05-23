'use client';

import { API_ROUTES } from '@/utils/constants/routes';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import { useTrips } from '@/lib/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectProps,
} from '@/components/ui/select';
import { CreateTripFromTemplateDialog } from '@/components/trips/organisms/CreateTripFromTemplateDialog';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/components/features/auth/organisms/AuthProvider';
import React from 'react';

interface UseTemplateButtonProps {
  templateId: string;
  templateSlug: string;
  templateTitle: string;
  className?: string;
}

export function UseTemplateButton({
  templateId,
  templateSlug,
  templateTitle,
  className,
}: UseTemplateButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { trips } = useTrips();
  const { user } = useAuth();
  const [isLoadingApply, setIsLoadingApply] = useState(false);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [showMainDialog, setShowMainDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dialogMinWidth, setDialogMinWidth] = useState<number | undefined>(undefined);

  // When dialog opens, set min width to match button
  React.useEffect(() => {
    if (showMainDialog && buttonRef.current) {
      setDialogMinWidth(buttonRef.current.offsetWidth);
    }
  }, [showMainDialog]);

  const handleLoginRedirect = () => {
    // Store the current URL to redirect back after login
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const handleApplyToExisting = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to use this feature.',
        variant: 'destructive',
      });
      handleLoginRedirect();
      return;
    }

    if (!selectedTripId) {
      toast({ title: 'Select a Trip', description: 'Please choose a trip from the list.' });
      return;
    }
    setIsLoadingApply(true);
    try {
      const response = await fetch(API_ROUTES.TRIP_APPLY_TEMPLATE(selectedTripId, templateId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.status === 403) {
        toast({
          title: 'Permission Denied',
          description: result.error || "You don't have permission to apply templates to this trip.",
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to apply template');
      }

      toast({
        title: 'Template Applied',
        description: `Added items to trip. New duration: ${result.newTotalDays} days.`,
      });

      setShowMainDialog(false);
      router.push(`/trips/${selectedTripId}?tab=itinerary`);
    } catch (error: any) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not apply template.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingApply(false);
    }
  };

  const handleOpenCreateDialog = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to use this feature.',
        variant: 'destructive',
      });
      handleLoginRedirect();
      return;
    }

    setShowMainDialog(false);
    setShowCreateDialog(true);
  };

  return (
    <>
      <Dialog open={showMainDialog} onOpenChange={setShowMainDialog}>
        <DialogTrigger asChild>
          <Button
            ref={buttonRef}
            className={className}
            disabled={isLoadingApply || isLoadingCreate}
          >
            Use Template
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-md"
          style={dialogMinWidth ? { minWidth: dialogMinWidth } : undefined}
        >
          {/*
            Ensure dialog is at least as wide as the button for visual consistency.
            This is set dynamically on open.
          */}
          {!user ? (
            <>
              <DialogHeader>
                <DialogTitle>Authentication Required</DialogTitle>
                <DialogDescription>
                  You need to be logged in to use this template.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex flex-col items-center justify-center gap-4">
                <p className="text-center text-xs text-muted-foreground">
                  Please log in or create an account to:
                  <ul className="mt-2 list-disc pl-6">
                    <li>Create new trips from templates</li>
                    <li>Apply templates to your existing trips</li>
                    <li>Save and organize your travel plans</li>
                  </ul>
                </p>
                <Button onClick={handleLoginRedirect} className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In or Sign Up
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Use "{templateTitle}"</DialogTitle>
                <DialogDescription>
                  Apply this template's itinerary items to one of your trips or create a new trip.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="apply-existing" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="apply-existing">Apply to Existing</TabsTrigger>
                  <TabsTrigger value="create-new">Create New Trip</TabsTrigger>
                </TabsList>
                <TabsContent value="apply-existing" className="pt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select a trip to add the template items to. Items will be added after the
                      existing days.
                    </p>
                    <Select onValueChange={setSelectedTripId} value={selectedTripId || undefined}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trips && trips.length > 0 ? (
                          trips.map((trip) => (
                            <SelectItem key={trip.id} value={trip.id}>
                              {trip.name} ({trip.duration_days || '?'} day
                              {trip.duration_days === 1 ? '' : 's'})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-trips">No trips available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleApplyToExisting}
                      disabled={!selectedTripId || isLoadingApply}
                      className="w-full"
                    >
                      {isLoadingApply ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...
                        </>
                      ) : (
                        'Apply to Selected Trip'
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="create-new" className="pt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Create a completely new trip based on this template.
                    </p>
                    <Button onClick={handleOpenCreateDialog} className="w-full">
                      Create New Trip from Template
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreateTripFromTemplateDialog
        templateSlug={templateSlug}
        templateTitle={templateTitle}
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
