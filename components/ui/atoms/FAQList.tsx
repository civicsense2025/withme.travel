/**
 * FAQ List Component
 * 
 * Renders a list of FAQs with expandable items using Radix UI Accordion.
 */

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { FAQItem } from './FAQItem';

/**
 * Props for the FAQList component
 */
export interface FAQListProps {
  /** Array of FAQ items */
  items: {
    /** Question text */
    question: string;
    /** Answer text or ReactNode */
    answer: string | React.ReactNode;
    /** Optional unique identifier */
    id?: string;
    /** Whether to allow HTML in answers */
    allowHtml?: boolean;
  }[];
  /** Optional CSS class */
  className?: string;
}

/**
 * FAQList displays an accordion of frequently asked questions
 */
export function FAQList({ items, className = '' }: FAQListProps) {
  return (
    <Accordion.Root
      className={`w-full ${className}`}
      type="single"
      defaultValue="item-0"
      collapsible
    >
      {items.map((item, index) => (
        <FAQItem
          key={item.id || `faq-${index}`}
          question={item.question}
          answer={item.answer}
          value={item.id || `item-${index}`}
          allowHtml={item.allowHtml}
        />
      ))}
    </Accordion.Root>
  );
} 