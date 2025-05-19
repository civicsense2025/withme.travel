/**
 * Metadata Editor Client Component
 * 
 * This component provides an interface for editing metadata in the admin dashboard.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetadataFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
}

function MetadataField({ label, value, onChange, placeholder, helpText }: MetadataFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <label className="block text-sm font-medium">JSON Editor</label>
        <div className="text-sm">
          <Button
            onClick={() => {
              try {
                const formatted = JSON.stringify(JSON.parse(value), null, 2);
                onChange(formatted);
              } catch (e) {
                // If it's not valid JSON, leave it as is
              }
            }}
            variant="outline"
            size="sm"
          >
            Format
          </Button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-80 font-mono text-sm p-4 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export interface MetadataEditorClientProps {
  initialData?: any;
  onSave?: (data: any) => void;
  itemType: string; // e.g., 'itinerary', 'trip', 'place'
  itemId: string;
}

export function MetadataEditorClient({
  initialData = {},
  onSave,
  itemType,
  itemId,
}: MetadataEditorClientProps) {
  const [metadata, setMetadata] = useState<Record<string, any>>(initialData);
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  // Initialize JSON value from metadata
  useEffect(() => {
    setJsonValue(JSON.stringify(metadata, null, 2));
  }, []);

  // Simple form fields for common metadata
  const commonFields = {
    title: metadata.title || '',
    description: metadata.description || '',
    keywords: Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : metadata.keywords || '',
    image: metadata.image || '',
  };

  const updateField = (field: string, value: string) => {
    const newMetadata = { ...metadata, [field]: value };
    setMetadata(newMetadata);
    
    // Keep JSON in sync
    setJsonValue(JSON.stringify(newMetadata, null, 2));
  };

  const updateJsonValue = (value: string) => {
    setJsonValue(value);
    setJsonError('');
    
    try {
      const parsed = JSON.parse(value);
      setMetadata(parsed);
    } catch (e) {
      if (e instanceof Error) {
        setJsonError(e.message);
      } else {
        setJsonError('Invalid JSON');
      }
    }
  };

  const handleSave = async () => {
    if (jsonError) return;
    
    setIsSaving(true);
    
    try {
      const data = activeTab === 'json' ? JSON.parse(jsonValue) : metadata;
      await onSave?.(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving metadata:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Edit Metadata: {itemType} ({itemId})
        </h1>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !!jsonError}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      {saveSuccess && (
        <Alert className="mb-6" variant="success">
          Metadata saved successfully!
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="form">Form View</TabsTrigger>
          <TabsTrigger value="json">JSON View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="space-y-6">
          <div className="bg-white p-6 rounded-md shadow-sm border">
            <h2 className="text-lg font-medium mb-4">Basic Information</h2>
            <MetadataField
              label="Title"
              value={commonFields.title}
              onChange={(value) => updateField('title', value)}
              placeholder="Enter title"
            />
            <MetadataField
              label="Description"
              value={commonFields.description}
              onChange={(value) => updateField('description', value)}
              placeholder="Enter description"
              helpText="A brief description of this item"
            />
            <MetadataField
              label="Keywords"
              value={commonFields.keywords}
              onChange={(value) => {
                const keywords = value.split(',').map(k => k.trim());
                updateField('keywords', value);
                updateField('keywordsArray', keywords);
              }}
              placeholder="keyword1, keyword2, keyword3"
              helpText="Comma-separated list of keywords"
            />
            <MetadataField
              label="Featured Image URL"
              value={commonFields.image}
              onChange={(value) => updateField('image', value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          {/* Additional sections can be added here for more complex metadata */}
        </TabsContent>
        
        <TabsContent value="json">
          <div className="bg-white p-6 rounded-md shadow-sm border">
            <JsonEditor
              value={jsonValue}
              onChange={updateJsonValue}
              error={jsonError}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 