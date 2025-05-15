/**
 * FAQ Tag component (atom)
 * Displays a category tag for FAQ items.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface FAQTagProps {
  /** The tag text */
  tag: string;
  /** Whether the tag is selected/active */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function FAQTag({
  tag,
  isSelected = false,
  onClick,
  className
}: FAQTagProps) {
  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className={cn(
        "mr-2 mb-2 cursor-pointer transition-colors hover:bg-primary/80",
        className
      )}
      onClick={onClick}
    >
      {tag}
    </Badge>
  );
} 