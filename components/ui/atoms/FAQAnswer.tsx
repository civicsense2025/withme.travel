/**
 * FAQ Answer component (atom)
 * Displays the answer text with support for HTML/Markdown.
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface FAQAnswerProps {
  children: React.ReactNode;
  className?: string;
}

export const FAQAnswer: React.FC<FAQAnswerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('faq-answer', className)}>
      {children}
    </div>
  );
}; 