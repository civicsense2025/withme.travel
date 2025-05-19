/**
 * FAQ Answer component (atom)
 * Displays the answer text with support for HTML/Markdown.
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface FAQAnswerProps {
  /** The answer content (can be HTML) */
  answer: string;
  /** Whether to render HTML (defaults to true) */
  allowHtml?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function FAQAnswer({ 
  answer, 
  allowHtml = true,
  className 
}: FAQAnswerProps) {
  return (
    <div 
      className={cn(
        "prose prose-sm dark:prose-invert prose-p:text-muted-foreground prose-a:text-primary mt-2",
        className
      )}
    >
      {allowHtml ? (
        <div dangerouslySetInnerHTML={{ __html: answer }} />
      ) : (
        <p className="text-muted-foreground">{answer}</p>
      )}
    </div>
  );
} 