'use client';

import React from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryButtonProps {
  onReset: () => void;
}

export function ErrorBoundaryButton({ onReset }: ErrorBoundaryButtonProps) {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <Button onClick={onReset} variant="default">
        Try Again
      </Button>
      <Button onClick={() => (window.location.href = '/')} variant="outline">
        Go to Homepage
      </Button>
    </div>
  );
}
