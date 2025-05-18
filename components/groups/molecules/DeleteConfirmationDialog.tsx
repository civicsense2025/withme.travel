/**
 * Delete Confirmation Dialog
 * 
 * A dialog to confirm deletion of items
 * 
 * @module groups/molecules
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DeleteConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Function to confirm deletion */
  onConfirm: () => void;
  /** Whether deletion is in progress */
  isDeleting?: boolean;
  /** Number of items to delete */
  itemCount?: number;
  /** Type of item being deleted (e.g., "group", "trip") */
  itemType?: string;
  /** Custom title for the dialog */
  title?: string;
  /** Custom description for the dialog */
  description?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  itemCount = 1,
  itemType = 'item',
  title,
  description,
}: DeleteConfirmationDialogProps) {
  // Determine title and description based on count and type
  const dialogTitle = title || `Delete ${itemCount === 1 ? itemType : `${itemCount} ${itemType}s`}?`;
  const dialogDescription =
    description ||
    `Are you sure you want to delete ${
      itemCount === 1 ? `this ${itemType}` : `these ${itemCount} ${itemType}s`
    }? This action cannot be undone.`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 