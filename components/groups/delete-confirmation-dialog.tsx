'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  itemType: 'group' | 'trip';
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemType,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const isSingle = itemCount === 1;
  const itemTypeText = itemType === 'group' ? 'group' : 'trip';
  const itemTypePlural = itemType === 'group' ? 'groups' : 'trips';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>
              Delete {isSingle ? itemTypeText : `${itemCount} ${itemTypePlural}`}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {isSingle ? (
              <>
                Are you sure you want to delete this {itemTypeText}? This action cannot be undone.
                <br />
                <br />
                <span className="font-medium">
                  {itemType === 'group'
                    ? 'This will permanently delete the group and all associated data.'
                    : 'This will permanently delete the trip and all associated data.'}
                </span>
              </>
            ) : (
              <>
                Are you sure you want to delete these {itemCount} {itemTypePlural}? This action
                cannot be undone.
                <br />
                <br />
                <span className="font-medium">
                  {itemType === 'group'
                    ? 'This will permanently delete all selected groups and their associated data.'
                    : 'This will permanently delete all selected trips and their associated data.'}
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            {isDeleting
              ? `Deleting...`
              : isSingle
                ? `Delete ${itemTypeText}`
                : `Delete ${itemCount} ${itemTypePlural}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
