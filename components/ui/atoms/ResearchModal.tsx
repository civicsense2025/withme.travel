'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Modal component that displays triggered surveys
 */
export interface ResearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen = false,
  onClose,
  children,
  className,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className={cn('research-modal-overlay', className)}>
      <div className="research-modal">
        <button
          className="research-modal-close"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="research-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};
