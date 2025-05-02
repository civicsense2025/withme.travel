'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Download,
  Check,
  AlertCircle,
  Database,
  RefreshCw,
  Info,
  ArrowDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SchemaUpdatePage() {
  const [loading, setLoading] = useState(false);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [validateEnums, setValidateEnums] = useState(false);
  const [openTableMap, setOpenTableMap] = useState<Record<string, boolean>>({});

  const fetchSchemaDetails = async () => {
    setLoading(true);
    setError(null);
    setDownloadSuccess(false);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('detail', 'true');
      if (validateEnums) {
        queryParams.append('validateEnums', 'true');
      }

      const response = await fetch(`/api/debug/schema-check?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSchemaData(data);

      // Initialize table open states for large datasets
      if (data?.detail?.tables) {
        const initialOpenState: Record<string, boolean> = {};
        Object.keys(data.detail.tables).forEach((tableName) => {
          initialOpenState[tableName] = false;
        });
        setOpenTableMap(initialOpenState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schema details');
      console.error('Error fetching schema details:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTableOpen = (tableName: string) => {
    setOpenTableMap((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
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

  const renderStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Check className="h-3 w-3 mr-1" />
        OK
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Missing
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database Schema Manager</h1>
          <p className="text-gray-500">Update database constants from current schema</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="validate-enums"
              checked={validateEnums}
              onCheckedChange={setValidateEnums}
            />
            <Label htmlFor="validate-enums">Validate Enums</Label>
          </div>
          <Button
            onClick={fetchSchemaDetails}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Schema
          </Button>
        </div>
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
                Detected {schemaData.detectedTables?.length || 0} tables and found{' '}
                {schemaData.missingTables?.length || 0} missing tables
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

                  {validateEnums && (
                    <>
                      <h3 className="font-medium mb-2 mt-4">Missing Enums</h3>
                      {schemaData.missingEnums?.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-amber-500 space-y-1">
                          {schemaData.missingEnums.map((enumName: string) => (
                            <li key={enumName}>{enumName}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-green-600">All required enum types exist</p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Schema Warnings</h3>
                  {schemaData.detail?.warnings?.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-amber-500 space-y-1">
                      {schemaData.detail.warnings.map((warning: any, i: number) => (
                        <li key={i}>
                          {warning.table && <span className="font-medium">{warning.table}: </span>}
                          {warning.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-600">No schema warnings detected</p>
                  )}
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="constants">Generated Constants</TabsTrigger>
                <TabsTrigger value="tables">
                  Tables ({Object.keys(schemaData.detail.tables || {}).length})
                </TabsTrigger>
                <TabsTrigger value="enums">
                  Enums ({Object.keys(schemaData.detail.enums || {}).length})
                </TabsTrigger>
                <TabsTrigger value="relationships">Relationships</TabsTrigger>
              </TabsList>

              <TabsContent value="constants" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Constants File</CardTitle>
                    <CardDescription>
                      Copy or download this to replace your constants file
                    </CardDescription>
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
                    <CardDescription>
                      Tables detected in the current database schema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(schemaData.detail.tables || {}).map(
                        ([tableName, tableInfo]: [string, any]) => (
                          <Collapsible
                            key={tableName}
                            className="border rounded-md"
                            open={openTableMap[tableName]}
                            onOpenChange={() => toggleTableOpen(tableName)}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-sm">{tableName}</h3>
                                  {tableInfo.hasPrimaryKey && (
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                    >
                                      PK: {tableInfo.primaryKeyColumns.join(', ')}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    ({tableInfo.columns.length} columns)
                                  </span>
                                </div>
                                {openTableMap[tableName] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="text-xs p-4 pt-0 border-t">
                                <div className="grid grid-cols-4 gap-2 font-semibold pb-1 mb-1">
                                  <div>Column</div>
                                  <div>Type</div>
                                  <div>Nullable</div>
                                  <div>Default</div>
                                </div>
                                {tableInfo.columns.map((column: any, i: number) => (
                                  <div
                                    key={i}
                                    className="grid grid-cols-4 gap-2 py-1 border-b border-gray-100 last:border-0"
                                  >
                                    <div className="font-medium">{column.name}</div>
                                    <div>
                                      {column.type}
                                      {column.maxLength ? `(${column.maxLength})` : ''}
                                    </div>
                                    <div>{column.nullable ? 'Yes' : 'No'}</div>
                                    <div className="truncate" title={column.default || 'null'}>
                                      {column.default || (
                                        <span className="text-gray-400">null</span>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {/* Show indexes if available */}
                                {schemaData.detail.indexes &&
                                  schemaData.detail.indexes[tableName] && (
                                    <div className="mt-3 pt-2 border-t">
                                      <h4 className="font-medium mb-2">Indexes</h4>
                                      <div className="grid grid-cols-3 gap-2 font-semibold pb-1 mb-1">
                                        <div>Name</div>
                                        <div>Columns</div>
                                        <div>Type</div>
                                      </div>
                                      {schemaData.detail.indexes[tableName].map(
                                        (index: any, i: number) => (
                                          <div
                                            key={i}
                                            className="grid grid-cols-3 gap-2 py-1 border-b border-gray-100 last:border-0"
                                          >
                                            <div>{index.name}</div>
                                            <div>{index.columns.join(', ')}</div>
                                            <div>
                                              {index.isPrimary ? (
                                                <Badge
                                                  variant="outline"
                                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                                >
                                                  Primary Key
                                                </Badge>
                                              ) : index.isUnique ? (
                                                <Badge
                                                  variant="outline"
                                                  className="bg-purple-50 text-purple-700 border-purple-200"
                                                >
                                                  Unique
                                                </Badge>
                                              ) : (
                                                <Badge variant="outline">Index</Badge>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                {/* Show foreign keys if available */}
                                {schemaData.detail.foreignKeys &&
                                  schemaData.detail.foreignKeys[tableName] && (
                                    <div className="mt-3 pt-2 border-t">
                                      <h4 className="font-medium mb-2">Foreign Keys</h4>
                                      <div className="grid grid-cols-4 gap-2 font-semibold pb-1 mb-1">
                                        <div>Column</div>
                                        <div>References</div>
                                        <div>On Update</div>
                                        <div>On Delete</div>
                                      </div>
                                      {schemaData.detail.foreignKeys[tableName].map(
                                        (fk: any, i: number) => (
                                          <div
                                            key={i}
                                            className="grid grid-cols-4 gap-2 py-1 border-b border-gray-100 last:border-0"
                                          >
                                            <div>{fk.column}</div>
                                            <div>
                                              {fk.referencesTable}.{fk.referencesColumn}
                                            </div>
                                            <div>{fk.onUpdate}</div>
                                            <div>{fk.onDelete}</div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      )}
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
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(schemaData.detail.enums || {}).map(
                        ([enumName, values]: [string, any]) => (
                          <div key={enumName} className="border rounded-md p-4">
                            <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                              {enumName}
                              <span className="text-xs text-gray-500">
                                ({values.length} values)
                              </span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {values.map((value: string, i: number) => (
                                <Badge key={i} variant="outline" className="px-2 py-1 text-xs">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="relationships" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Relationships</CardTitle>
                    <CardDescription>Foreign key relationships between tables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {Object.entries(schemaData.detail.foreignKeys || {})
                        .filter(([_, fks]) => (fks as any[]).length > 0)
                        .map(([tableName, fks]: [string, any]) => (
                          <div key={tableName} className="border rounded-md p-4">
                            <h3 className="font-medium text-sm mb-3">{tableName}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {fks.map((fk: any, i: number) => (
                                <div key={i} className="bg-gray-50 p-3 rounded-md flex flex-col">
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                    <span className="font-medium">{tableName}</span>
                                    <ArrowDown className="h-3 w-3" />
                                    <span className="font-medium">{fk.referencesTable}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">{fk.column}</span> &rarr;{' '}
                                    <span className="font-medium">
                                      {fk.referencesTable}.{fk.referencesColumn}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-500">
                                    On Update:{' '}
                                    <Badge variant="outline" className="text-xs">
                                      {fk.onUpdate}
                                    </Badge>{' '}
                                    On Delete:{' '}
                                    <Badge variant="outline" className="text-xs">
                                      {fk.onDelete}
                                    </Badge>
                                  </div>
                                </div>
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
        <div className="text-center p-8 text-gray-500">No schema data available</div>
      )}
    </div>
  );
}
