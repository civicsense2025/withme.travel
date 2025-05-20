/**
 * FAQ Item component (molecule)
 * Combines FAQ question and answer with accordion functionality.
 */
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FAQQuestion, FAQAnswer } from '../atoms';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/Collapsible';

export interface FAQItemProps {
  /** The question to display */
  question: string;
  /** The answer content (can include HTML) */
  answer: string;
  /** Optional ID for the FAQ item */
  id?: string;
  /** Whether to render HTML in the answer */
  allowHtml?: boolean;
  /** Whether the item starts expanded */
  defaultOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when item is toggled */
  onToggle?: (isOpen: boolean) => void;
}

export function FAQItem({
  question,
  answer,
  id,
  allowHtml = true,
  defaultOpen = false,
  className,
  onToggle
}: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className={cn(
        "border-b border-border py-4 last:border-0",
        className
      )}
    >
      <div className="flex flex-row items-start">
        <CollapsibleTrigger 
          className="flex flex-1 items-center justify-between text-left"
        >
          <FAQQuestion 
            question={question} 
            isOpen={isOpen} 
          />
          <ChevronDown 
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="pt-2">
        <FAQAnswer 
          answer={answer} 
          allowHtml={allowHtml} 
        />
      </CollapsibleContent>
    </Collapsible>
  );
} 