'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryButtonProps {
  onReset: () => void;
}

export function ErrorBoundaryButton({ onReset }: ErrorBoundaryButtonProps) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <Button onClick={onReset} variant="default">
        Try again
      </Button>
      <Button onClick={() => (window.location.href = '/')} variant="outline">
        Go to Homepage
      </Button>
    </div>
  );
}
