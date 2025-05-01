'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { PresenceIndicator } from './presence-indicator';
import { UserPresence } from '@/types/presence';

interface EnhancedEditingWrapperProps {
  children: React.ReactNode;
  itemId: string;
  itemName: string;
  onEdit?: () => void;
  onEditEnd?: () => void;
  showBorder?: boolean;
  className?: string;
  readOnly?: boolean;
  fallbackContent?: React.ReactNode;
  startEditing?: (itemId: string) => void;
  stopEditing?: () => void;
  activeUsers?: UserPresence[];
}

/**
 * An enhanced wrapper for collaborative editing with better conflict handling and visual feedback
 */
export function EnhancedEditingWrapper({
  children,
  itemId,
  itemName,
  onEdit,
  onEditEnd,
  showBorder = false,
  className,
  readOnly = false,
  fallbackContent,
  startEditing,
  stopEditing,
  activeUsers = [],
}: EnhancedEditingWrapperProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [othersEditing, setOthersEditing] = useState<UserPresence[]>([]);

  // Check if others are editing this item
  useEffect(() => {
    const itemEditors = activeUsers.filter(
      (user) => user.status === 'editing' && user.editing_item_id === itemId
    );

    setOthersEditing(itemEditors);
  }, [activeUsers, itemId]);

  const handleStartEditing = useCallback(() => {
    if (readOnly) return;

    setIsEditing(true);

    if (startEditing) {
      startEditing(itemId);
    }

    if (onEdit) {
      onEdit();
    }
  }, [readOnly, startEditing, itemId, onEdit]);

  const handleStopEditing = useCallback(() => {
    setIsEditing(false);

    if (stopEditing) {
      stopEditing();
    }

    if (onEditEnd) {
      onEditEnd();
    }
  }, [stopEditing, onEditEnd]);

  // Automatically stop editing on component unmount
  useEffect(() => {
    return () => {
      if (isEditing && stopEditing) {
        stopEditing();
      }
    };
  }, [isEditing, stopEditing]);

  const isOthersEditing = othersEditing.length > 0;
  const canEdit = !readOnly && !isOthersEditing;

  const renderContent = () => {
    // If others are editing and we have fallback content, show that instead
    if (isOthersEditing && fallbackContent) {
      return fallbackContent;
    }

    // Otherwise show editable content
    return children;
  };

  return (
    <div
      className={cn(
        'relative transition-all',
        isOthersEditing && 'opacity-70',
        showBorder && 'border p-4 rounded-md',
        isOthersEditing && showBorder && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
        className
      )}
    >
      {/* Presence indicator for others editing */}
      {isOthersEditing && (
        <div className="flex items-center bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-1 mb-2">
          <div className="text-xs text-blue-800 dark:text-blue-300 mr-1.5">
            <span className="font-medium">Editing:</span> {itemName}
          </div>
          <PresenceIndicator users={othersEditing} size="sm" />
        </div>
      )}

      {/* The actual content */}
      <div
        className={cn('transition-all', isOthersEditing && !canEdit && 'pointer-events-none')}
        onFocus={handleStartEditing}
        onBlur={handleStopEditing}
      >
        {renderContent()}
      </div>
    </div>
  );
}
