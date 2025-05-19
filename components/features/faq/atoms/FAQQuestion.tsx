/**
 * FAQ Question component (atom)
 * Displays the question text with appropriate styling.
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface FAQQuestionProps {
  /** The question text to display */
  question: string;
  /** Whether the question's accordion is expanded */
  isOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function FAQQuestion({ 
  question, 
  isOpen = false,
  className 
}: FAQQuestionProps) {
  return (
    <h3 
      className={cn(
        "text-base font-medium text-foreground transition-colors",
        isOpen && "text-primary",
        className
      )}
    >
      {question}
    </h3>
  );
} 