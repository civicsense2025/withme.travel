import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React from 'react';

export interface OnboardingInputProps extends React.ComponentProps<typeof Input> {
  className?: string;
}

export function OnboardingInput({ className, ...props }: OnboardingInputProps) {
  return (
    <Input
      className={cn('rounded-lg border-2 border-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all', className)}
      {...props}
    />
  );
} 