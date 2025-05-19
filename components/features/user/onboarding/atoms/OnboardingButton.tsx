import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

export interface OnboardingButtonProps extends React.ComponentProps<typeof Button> {
  className?: string;
}

export function OnboardingButton({ className, ...props }: OnboardingButtonProps) {
  return (
    <Button
      className={cn('rounded-lg px-6 py-2 text-base font-semibold', className)}
      {...props}
    />
  );
} 