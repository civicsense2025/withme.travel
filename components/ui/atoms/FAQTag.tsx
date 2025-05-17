/**
 * FAQ Tag component (atom)
 * Displays a category tag for FAQ items.
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface FAQTagProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export const FAQTag: React.FC<FAQTagProps> = ({
  children, 
  className,
  variant = 'default'
}) => {
  return (
    <span
      className={cn(
        'faq-tag',
        `faq-tag-${variant}`,
        className
      )}
    >
      {children}
    </span>
  );
}; 