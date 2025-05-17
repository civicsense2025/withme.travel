/**
 * FAQ Question component (atom)
 * Displays the question text with appropriate styling.
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface FAQQuestionProps {
  children: React.ReactNode;
  className?: string;
}

export const FAQQuestion: React.FC<FAQQuestionProps> = ({
  children,
  className,
}) => {
  return (
    <h3 className={cn('faq-question', className)}>
      {children}
    </h3>
  );
}; 