'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, FileUp, Download, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface ImportResult {
  success: boolean;
  message?: string;
  error?: string;
  insertedItems?: Array<{ id: string; name: string }>;
  invalidRecords?: Array<{ row: number; errors: string[] }>;
}

interface ContentType {
  id: string;
  name: string;
  apiRoute: string;
  template: string;
  sampleData: string;
  requiredFields: string[];
}

const CONTENT_TYPES: ContentType[] = [
  {
    id: 'place',
    name: 'Places',
    apiRoute: '/api/places/import-csv',
    template:
      'name,description,category,address,latitude,longitude,price_level,rating,website,phone_number',
    sampleData:
      'Grand Central Terminal,Historic terminal and transportation hub,landmark,"89 E 42nd St, New York, NY 10017",40.7527,-73.9772,2,4.5,https://www.grandcentralterminal.com,+12123402583',
    requiredFields: ['name', 'category'],
  },
  {
    id: 'destination',
    name: 'Destinations',
    apiRoute: '/api/admin/destinations/import-csv',
    template: 'name,slug,country,description,continent',
    sampleData:
      'Barcelona,barcelona,Spain,"Barcelona is a vibrant city known for its architecture",Europe',
    requiredFields: ['name', 'slug', 'country'],
  },
  {
    id: 'activity',
    name: 'Activities',
    apiRoute: '/api/admin/activities/import-csv',
    template: 'name,description,category,destination_id,duration_minutes,price',
    sampleData:
      'Sagrada Familia Tour,Guided tour of this iconic building,attractions,barcelona-123,120,25.99',
    requiredFields: ['name', 'category', 'destination_id'],
  },
];

interface BulkImportExportProps {
  contentTypeId?: string;
  parentId?: string;
  onSuccess?: (result: ImportResult) => void;
  onCancel?: () => void;
}

export function BulkImportExport({
  contentTypeId = 'place',
  parentId,
  onSuccess,
  onCancel,
}: BulkImportExportProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedContentType, setSelectedContentType] = useState<string>(contentTypeId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the selected content type object
  const contentType = CONTENT_TYPES.find((type) => type.id === selectedContentType);

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    if (!selectedFile || !contentType) {
      toast({
        title: 'Missing information',
        description: 'Please select a content type and CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Add parent ID if applicable (like destination_id for places)
      if (parentId) {
        formData.append('parent_id', parentId);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress < 90 ? newProgress : 90;
        });
      }, 500);

      // Send the request
      const response = await fetch(contentType.apiRoute, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        toast({
          title: 'Import successful',
          description:
            result.message ||
            `Successfully imported ${result.insertedItems?.length || 0} ${contentType.name.toLowerCase()}.`,
        });

        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        toast({
          title: 'Import failed',
          description: result.error || `Failed to import ${contentType.name.toLowerCase()}.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);

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

  const handleExport = async () => {
    if (!contentType) return;

    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams();
      if (parentId) {
        queryParams.append('parent_id', parentId);
      }
      queryParams.append('format', exportFormat);

      const exportUrl = `${contentType.apiRoute.replace('import-csv', 'export')}?${queryParams}`;
      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      // Get the filename from the content-disposition header or use a default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${contentType.id}-export.${exportFormat}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create a blob and download it
      const blob =
        exportFormat === 'csv'
          ? await response.blob()
          : new Blob([JSON.stringify(await response.json(), null, 2)], {
              type: 'application/json',
            });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `${contentType.name} exported successfully as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Export error',
        description: `Error during export: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (!contentType) return;

    const headers = contentType.template;
    const exampleRows = contentType.sampleData;
    const csvContent = [headers, exampleRows].join('\n');

    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType.id}_import_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import & Export</CardTitle>
        <CardDescription>
          Import or export{' '}
          {CONTENT_TYPES.find((type) => type.id === selectedContentType)?.name.toLowerCase()} data
          in bulk
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                id="content-type"
                value={selectedContentType}
                onValueChange={setSelectedContentType}
                disabled={isLoading}
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>

            <TabsContent value="import" className="space-y-4 mt-0">
              {!importResult && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="csv-file">CSV File</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        disabled={isLoading}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Template
                      </Button>
                    </div>

                    <div className="border-2 border-dashed rounded-md p-6 text-center">
                      <Input
                        id="csv-file"
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="csv-file"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">
                          {selectedFile ? selectedFile.name : 'Click to select a CSV file'}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {selectedFile
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : 'CSV format only, max 5MB'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {contentType && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertTitle>Required Fields</AlertTitle>
                      <AlertDescription>
                        The following fields are required:{' '}
                        <span className="font-semibold">
                          {contentType.requiredFields.join(', ')}
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

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

                        {importResult.insertedItems && importResult.insertedItems.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">Imported Items:</div>
                            <div className="mt-1 text-sm">
                              {importResult.insertedItems.length} items imported successfully
                            </div>
                          </div>
                        )}

                        {importResult.invalidRecords && importResult.invalidRecords.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">Failed Records:</div>
                            <div className="text-xs mt-1 space-y-1">
                              {importResult.invalidRecords.slice(0, 3).map((record, idx) => (
                                <div key={idx} className="text-xs">
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
            </TabsContent>

            <TabsContent value="export" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="export-format">Export Format</Label>
                <Select
                  id="export-format"
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as 'csv' | 'json')}
                  disabled={isLoading}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </Select>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Export Information</AlertTitle>
                <AlertDescription>
                  This will export all {contentType?.name.toLowerCase() || 'items'}
                  {parentId ? ' for the current parent item' : ''} in {exportFormat.toUpperCase()}{' '}
                  format.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </div>
        </CardContent>
      </Tabs>

      <CardFooter className="justify-between border-t pt-6">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}

        <div className="flex space-x-2">
          {activeTab === 'import' && importResult && (
            <Button variant="outline" onClick={resetImport} disabled={isLoading}>
              Reset
            </Button>
          )}

          {activeTab === 'import' ? (
            <Button onClick={handleImport} disabled={!selectedFile || isLoading || !!importResult}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleExport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
