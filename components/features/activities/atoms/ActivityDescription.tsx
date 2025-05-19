/**
 * ActivityDescription Component (Atom)
 * 
 * Displays a formatted description of an activity, with optional truncation
 * and support for variables like user name and entity name.
 *
 * @module activities/atoms
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ActivityDescriptionProps {
  /** The primary text description of the activity */
  description: string;
  /** Optional user who performed the activity */
  userName?: string;
  /** Optional entity the activity was performed on */
  entityName?: string;
  /** Optional additional details about the activity */
  details?: string;
  /** CSS classes to apply to the description */
  className?: string;
  /** Whether to truncate long descriptions */
  truncate?: boolean;
  /** Maximum length before truncation */
  maxLength?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Truncates text to the specified maximum length, adding ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formats a description by replacing variable placeholders with actual values
 */
function formatDescription(template: string, variables: { [key: string]: string }): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ActivityDescription({
  description,
  userName,
  entityName,
  details,
  className,
  truncate = false,
  maxLength = 100,
}: ActivityDescriptionProps) {
  // Format the description with variables
  const formattedDescription = formatDescription(description, {
    user: userName || 'Someone',
    entity: entityName || 'something',
    ...(details ? { details } : {}),
  });
  
  // Truncate if needed
  const displayText = truncate ? truncateText(formattedDescription, maxLength) : formattedDescription;
  
  return (
    <span className={cn('text-sm', className)}>
      {displayText}
    </span>
  );
}
