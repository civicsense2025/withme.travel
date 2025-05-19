'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/lib/hooks/use-toast'
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, DownloadCloud, FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export interface PlaceImportResult {
  success: boolean;
  message?: string;
  error?: string;
  insertedPlaces?: Array<{ id: string; name: string }>;
  invalidRecords?: Array<{ row: number; errors: string[] }>;
}

interface PlaceCsvImporterProps {
  destinationId: string;
  onSuccess?: (result: PlaceImportResult) => void;
  onCancel?: () => void;
}

export function PlaceCsvImporter({ destinationId, onSuccess, onCancel }: PlaceCsvImporterProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<PlaceImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file format',
        description: 'Please select a CSV file.',
        variant: 'destructive',
      });

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('destination_id', destinationId);

      // Send the request
      const response = await fetch('/api/places/import-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        toast({
          title: 'Import successful',
          description:
            result.message || `Successfully imported ${result.insertedPlaces?.length || 0} places.`,
        });

        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        toast({
          title: 'Import failed',
          description: result.error || 'Failed to import places from CSV.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing places:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Import error',
        description: `Error during import: ${errorMessage}`,
        variant: 'destructive',
      });

      setImportResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'name',
      'description',
      'category',
      'address',
      'latitude',
      'longitude',
      'price_level',
      'rating',
      'website',
      'phone_number',
    ].join(',');

    const exampleRows = [
      'Grand Central Terminal,Historic terminal and transportation hub,landmark,"89 E 42nd St, New York, NY 10017",40.7527,-73.9772,2,4.5,https://www.grandcentralterminal.com,+12123402583',
      'Central Park,Urban park in Manhattan,attraction,"Central Park, New York, NY",40.7812,-73.9665,,,https://www.centralparknyc.org,+12123106600',
      'Empire State Building,Famous landmark and observation deck,landmark,"350 5th Ave, New York, NY 10118",40.7484,-73.9857,4,4.7,https://www.esbnyc.com,+12127363100',
    ].join('\n');

    const csvContent = [headers, exampleRows].join('\n');

    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'places_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2">
          <FileUp className="h-5 w-5" />
          <span>Import Places from CSV</span>
        </CardTitle>
        <CardDescription>
          Upload a CSV file with place information to bulk import places
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-sm">
            <DownloadCloud className="mr-2 h-4 w-4" />
            Download Template
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Download a CSV template with example data. Your CSV file should have these
                  columns: name (required), description, category, address, latitude, longitude,
                  price_level, rating, website, phone_number.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <Input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
            disabled={isLoading}
          />
          <label
            htmlFor="csv-file-input"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">
              {selectedFile ? selectedFile.name : 'Click to select a CSV file'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'CSV format only'}
            </span>
          </label>
        </div>

        {importResult && (
          <Alert variant={importResult.success ? 'default' : 'destructive'}>
            <div className="flex items-start">
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2" />
              )}
              <div>
                <AlertTitle>
                  {importResult.success ? 'Import Successful' : 'Import Failed'}
                </AlertTitle>
                <AlertDescription>
                  {importResult.success ? importResult.message : importResult.error}

                  {importResult.insertedPlaces && importResult.insertedPlaces.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium">Imported Places:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {importResult.insertedPlaces.slice(0, 5).map((place) => (
                          <Badge key={place.id} variant="outline">
                            {place.name}
                          </Badge>
                        ))}
                        {importResult.insertedPlaces.length > 5 && (
                          <Badge variant="outline">
                            +{importResult.insertedPlaces.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {importResult.invalidRecords && importResult.invalidRecords.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium">Failed Rows:</div>
                      <div className="text-xs mt-1">
                        {importResult.invalidRecords.slice(0, 3).map((record, idx) => (
                          <div key={idx} className="text-xs mb-1">
                            <span className="font-medium">Row {record.row}:</span>{' '}
                            {record.errors.join(', ')}
                          </div>
                        ))}
                        {importResult.invalidRecords.length > 3 && (
                          <div className="text-xs">
                            +{importResult.invalidRecords.length - 3} more invalid rows
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!selectedFile || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>Import Places</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
