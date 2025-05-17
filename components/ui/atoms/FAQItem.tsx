/**
 * FAQ Item Component
 * 
 * A collapsible FAQ item using Radix UI Accordion.
 */

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

/**
 * Props for the FAQItem component
 */
export interface FAQItemProps {
  /** Question text shown in the header */
  question: string;
  /** Answer text or HTML content */
  answer: string | React.ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Unique value for the accordion item */
  value: string;
  /** Whether to allow HTML in the answer */
  allowHtml?: boolean;
}

/**
 * FAQItem component for displaying a question and answer in an accordion
 */
export function FAQItem({ 
  question, 
  answer,
  className = '',
  value,
  allowHtml = false
}: FAQItemProps) {
  return (
    <Accordion.Item 
      value={value} 
      className={`border-b border-border ${className}`}
    >
      <Accordion.Trigger className="flex w-full justify-between py-4 text-left font-medium">
        <span>{question}</span>
        <ChevronDownIcon className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:rotate-180" />
      </Accordion.Trigger>
      <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pb-4 pt-1">
          {allowHtml && typeof answer === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: answer }} />
          ) : (
            <div>{answer}</div>
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
