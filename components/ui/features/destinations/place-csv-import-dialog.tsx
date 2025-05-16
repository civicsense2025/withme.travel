'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { PlaceCsvImporter, type PlaceImportResult } from '@/components/place-csv-importer';

interface PlaceCsvImportDialogProps {
  destinationId: string;
  onImportComplete?: (result: PlaceImportResult) => void;
  trigger?: React.ReactNode;
}

export function PlaceCsvImportDialog({
  destinationId,
  onImportComplete,
  trigger,
}: PlaceCsvImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImportSuccess = (result: PlaceImportResult) => {
    // Close dialog on success
    setIsOpen(false);

    // Call the parent handler if provided
    if (onImportComplete) {
      onImportComplete(result);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <FileUp className="h-4 w-4" />
            Import CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <PlaceCsvImporter
          destinationId={destinationId}
          onSuccess={handleImportSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
