/**
 * Accordion (Molecule)
 *
 * A themeable, accessible accordion component (stub).
 *
 * @module ui/molecules
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface AccordionProps {
  children: React.ReactNode;
}
export function Accordion({ children }: AccordionProps) {
  return <div>{children}</div>;
}

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
}
export function AccordionItem({ children }: AccordionItemProps) {
  return <div>{children}</div>;
}

export interface AccordionTriggerProps {
  children: React.ReactNode;
}
export function AccordionTrigger({ children }: AccordionTriggerProps) {
  return (
    <button type="button" className={cn('w-full text-left font-medium py-2')}>
      {children}
    </button>
  );
}

export interface AccordionContentProps {
  children: React.ReactNode;
}
export function AccordionContent({ children }: AccordionContentProps) {
  return <div className={cn('py-2')}>{children}</div>;
}
