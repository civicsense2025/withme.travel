/**
 * PlansNavigation Molecule
 *
 * Navigation for switching between group plans.
 * @module components/features/groups/molecules/PlansNavigation
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * PlansNavigation component props
 */
export interface PlansNavigationProps {
  /** List of plan titles */
  plans: { id: string; title: string }[];
  /** Currently selected plan ID */
  selectedPlanId?: string;
  /** Callback when a plan is selected */
  onSelect?: (planId: string) => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * PlansNavigation molecule for group plans (placeholder)
 */
export function PlansNavigation({ plans, selectedPlanId, onSelect, className }: PlansNavigationProps) {
  // TODO: Implement navigation UI
  return (
    <nav className={className} style={{ display: 'flex', gap: 8 }}>
      {plans.map(plan => (
        <button
          key={plan.id}
          onClick={() => onSelect?.(plan.id)}
          style={{ fontWeight: plan.id === selectedPlanId ? 'bold' : 'normal' }}
        >
          {plan.title}
        </button>
      ))}
    </nav>
  );
}

export default PlansNavigation;
