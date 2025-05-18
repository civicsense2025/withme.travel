/**
 * EmptyLogisticsState
 * 
 * Empty state component for logistics sections
 * 
 * @module trips/molecules
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogisticsItemIcon } from '@/components/trips/atoms/LogisticsItemIcon';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface EmptyLogisticsStateProps {
  /** Type of logistics item */
  type: 'accommodation' | 'transportation';
  /** Whether the user can add items */
  canEdit?: boolean;
  /** Primary message to display */
  message?: string;
  /** Secondary help text */
  helpText?: string;
  /** Text for the add button */
  actionText?: string;
  /** Callback for add button */
  onAdd?: () => void;
  /** Optional CSS class name */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmptyLogisticsState({
  type,
  canEdit = false,
  message = getDefaultMessage(type),
  helpText = getDefaultHelpText(type, canEdit),
  actionText = getDefaultActionText(type),
  onAdd,
  className,
}: EmptyLogisticsStateProps) {
  return (
    <Card className={cn("border border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <LogisticsItemIcon 
            type={type} 
            size={24} 
            className="text-muted-foreground" 
          />
        </div>
        
        <p className="text-muted-foreground mb-2">{message}</p>
        
        {helpText && canEdit && (
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {helpText}
          </p>
        )}
        
        {canEdit && onAdd && (
          <Button 
            variant="outline" 
            onClick={onAdd}
            className="mt-2"
          >
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default primary message based on type
 */
function getDefaultMessage(type: 'accommodation' | 'transportation'): string {
  switch (type) {
    case 'accommodation':
      return 'No accommodations have been added to this trip yet.';
    case 'transportation':
      return 'No transportation options have been added to this trip yet.';
  }
}

/**
 * Get default help text based on type and edit permissions
 */
function getDefaultHelpText(type: 'accommodation' | 'transportation', canEdit: boolean): string {
  if (!canEdit) return '';
  
  switch (type) {
    case 'accommodation':
      return 'Add hotels, Airbnbs, or other places where you\'ll be staying during your trip. These will also appear in your trip itinerary.';
    case 'transportation':
      return 'Add flights, train tickets, rental cars, or other transportation details for your trip. These will also appear in your trip itinerary.';
  }
}

/**
 * Get default action button text based on type
 */
function getDefaultActionText(type: 'accommodation' | 'transportation'): string {
  switch (type) {
    case 'accommodation':
      return 'Add Accommodation';
    case 'transportation':
      return 'Add Transportation';
  }
} 