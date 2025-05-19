/**
 * FAQ List component (molecule)
 * Displays a list of FAQ items with consistent styling.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { FaqEntry } from '@/types/faq';
import { FAQItem } from './FAQItem';

export interface FAQListProps {
  /** Array of FAQ entries to display */
  items: FaqEntry[];
  /** Whether to allow HTML in answers */
  allowHtml?: boolean;
  /** Class for customizing the container */
  className?: string;
  /** Class for customizing each FAQ item */
  itemClassName?: string;
}

export function FAQList({ 
  items, 
  allowHtml = true,
  className,
  itemClassName
}: FAQListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No FAQs match your filters.
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item, index) => (
        <FAQItem
          key={item.id || index}
          id={item.id}
          question={item.question}
          answer={item.answer}
          allowHtml={allowHtml}
          className={itemClassName}
        />
      ))}
    </div>
  );
} 