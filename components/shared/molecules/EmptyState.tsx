/**
 * EmptyState Component
 * 
 * A versatile empty state component that can be used across different features
 * when no data is available to display.
 * 
 * @module components/shared/molecules
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface EmptyStateProps {
  /** Title text to display */
  title: string;
  /** Description text providing more context */
  description?: string;
  /** Icon component to display */
  icon?: LucideIcon;
  /** Text for the primary action button */
  actionText?: string;
  /** Handler for the primary action button */
  onAction?: () => void;
  /** Whether the action button is disabled */
  actionDisabled?: boolean;
  /** Text for the secondary action button */
  secondaryActionText?: string;
  /** Handler for the secondary action button */
  onSecondaryAction?: () => void;
  /** Visual variant of the empty state */
  variant?: 'default' | 'card' | 'inline' | 'subtle';
  /** Whether to use a dashed border (for card variant) */
  dashedBorder?: boolean;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Optional additional CSS class names */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the primary action button should be filled */
  primaryActionFilled?: boolean;
  /** Additional props for icon wrapper */
  iconProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Additional content to render */
  children?: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Generic empty state component that can be customized for different contexts
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
  actionDisabled = false,
  secondaryActionText,
  onSecondaryAction,
  variant = 'default',
  dashedBorder = false,
  isLoading = false,
  className,
  size = 'md',
  primaryActionFilled = true,
  iconProps,
  children,
}: EmptyStateProps) {
  // Calculate size-based styles
  const sizeStyles = {
    sm: {
      padding: 'p-4',
      iconSize: 'h-10 w-10',
      iconWrapper: 'p-2',
      titleClass: 'text-base',
      descriptionClass: 'text-xs',
    },
    md: {
      padding: 'p-6',
      iconSize: 'h-12 w-12',
      iconWrapper: 'p-3',
      titleClass: 'text-lg',
      descriptionClass: 'text-sm',
    },
    lg: {
      padding: 'p-8',
      iconSize: 'h-16 w-16',
      iconWrapper: 'p-4',
      titleClass: 'text-xl',
      descriptionClass: 'text-base',
    },
  }[size];
  
  // The inner content of the empty state
  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      {Icon && (
        <div 
          className={cn(
            "mb-4 rounded-full bg-muted",
            sizeStyles.iconWrapper,
            iconProps?.className
          )}
          {...iconProps}
        >
          <Icon className={cn("text-muted-foreground", sizeStyles.iconSize)} />
        </div>
      )}
      
      <h3 className={cn("font-medium mb-2", sizeStyles.titleClass)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn("text-muted-foreground mb-6 max-w-md", sizeStyles.descriptionClass)}>
          {description}
        </p>
      )}
      
      {children}
      
      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {actionText && onAction && (
            <Button
              onClick={onAction}
              disabled={actionDisabled || isLoading}
              variant={primaryActionFilled ? "default" : "outline"}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {isLoading ? 'Loading...' : actionText}
            </Button>
          )}
          
          {secondaryActionText && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              disabled={isLoading}
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
  
  // Return the appropriate variant
  switch (variant) {
    case 'card':
      return (
        <Card 
          className={cn(
            dashedBorder && "border border-dashed",
            className
          )}
        >
          <CardContent className={cn("flex flex-col items-center justify-center", sizeStyles.padding)}>
            {content}
          </CardContent>
        </Card>
      );
    
    case 'inline':
      return (
        <div className={cn("py-3", className)}>
          {content}
        </div>
      );
    
    case 'subtle':
      return (
        <div className={cn("bg-muted/40 rounded-md", sizeStyles.padding, className)}>
          {content}
        </div>
      );
      
    default:
      return (
        <div className={cn("py-6", className)}>
          {content}
        </div>
      );
  }
} 