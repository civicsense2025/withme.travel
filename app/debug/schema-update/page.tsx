'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, Check, AlertCircle, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function SchemaUpdatePage() {
  const [loading, setLoading] = useState(false);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  const fetchSchemaDetails = async () => {
    setLoading(true);
    setError(null);
    setDownloadSuccess(false);
    
    try {
      const response = await fetch('/api/debug/schema-check?detail=true');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSchemaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schema details');
      console.error('Error fetching schema details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const downloadConstants = () => {
    if (!schemaData?.detail?.generatedConstants) {
      setError('No generated constants available');
      return;
    }
    
    try {
      // Create blob from generated constants
      const blob = new Blob([schemaData.detail.generatedConstants], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'database.generated.ts';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      setError('Failed to download generated constants file');
      console.error('Error downloading constants:', err);
    }
  };
  
  useEffect(() => {
    fetchSchemaDetails();
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database Schema Manager</h1>
          <p className="text-gray-500">Update database constants from current schema</p>
        </div>
        <Button 
          onClick={fetchSchemaDetails} 
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          Refresh Schema
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {downloadSuccess && (
        <Alert variant="default" className="mb-6 border-green-500 bg-green-50 text-green-800">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Constants file downloaded successfully</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading database schema...</span>
        </div>
      ) : schemaData ? (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Schema Status</CardTitle>
              <CardDescription>
                Detected {schemaData.detectedTables?.length || 0} tables and found {schemaData.missingTables?.length || 0} missing tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Missing Tables</h3>
                  {schemaData.missingTables?.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-red-500 space-y-1">
                      {schemaData.missingTables.map((table: string) => (
                        <li key={table}>{table}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600">All required tables exist</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium mb-2">Core Tables Found</h3>
                  <p className="text-sm">{schemaData.detectedTables?.length || 0} tables detected in database</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="ml-auto flex items-center gap-2"
                disabled={!schemaData?.detail?.generatedConstants}
                onClick={downloadConstants}
              >
                <Download className="h-4 w-4" />
                Download Generated Constants
              </Button>
            </CardFooter>
          </Card>
          
          {schemaData?.detail && (
            <Tabs defaultValue="constants" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="constants">Generated Constants</TabsTrigger>
                <TabsTrigger value="tables">Tables ({Object.keys(schemaData.detail.tables || {}).length})</TabsTrigger>
                <TabsTrigger value="enums">Enums ({Object.keys(schemaData.detail.enums || {}).length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="constants" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Constants File</CardTitle>
                    <CardDescription>Copy or download this to replace your constants file</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      value={schemaData.detail.generatedConstants || 'No constants generated'} 
                      readOnly 
                      className="font-mono text-xs h-96"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tables" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Tables</CardTitle>
                    <CardDescription>Tables detected in the current database schema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(schemaData.detail.tables || {}).map(([tableName, tableInfo]: [string, any]) => (
                        <div key={tableName} className="border rounded-md p-4">
                          <h3 className="font-medium text-sm mb-2">{tableName}</h3>
                          <div className="text-xs">
                            <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-1 mb-1">
                              <div>Column</div>
                              <div>Type</div>
                              <div>Nullable</div>
                            </div>
                            {tableInfo.columns.map((column: any, i: number) => (
                              <div key={i} className="grid grid-cols-3 gap-2 py-1 border-b border-gray-100 last:border-0">
                                <div>{column.name}</div>
                                <div>{column.type}</div>
                                <div>{column.nullable ? 'Yes' : 'No'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="enums" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Enums</CardTitle>
                    <CardDescription>Enum types detected in the database</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(schemaData.detail.enums || {}).map(([enumName, values]: [string, any]) => (
                        <div key={enumName} className="border rounded-md p-4">
                          <h3 className="font-medium text-sm mb-2">{enumName}</h3>
                          <div className="flex flex-wrap gap-2">
                            {values.map((value: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500">
          No schema data available
        </div>
      )}
    </div>
  );
} 