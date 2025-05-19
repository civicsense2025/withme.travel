import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthErrorProps {
  /** Error message to display */
  message: string;
  /** Optional className for styling */
  className?: string;
}

export function AuthError({ message, className }: AuthErrorProps) {
  if (!message) return null;
  
  return (
    <div 
      className={cn(
        'bg-destructive/15 text-destructive px-4 py-3 rounded-md flex items-center gap-3',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}