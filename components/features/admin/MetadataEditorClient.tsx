'use client';

import React, { useState } from 'react';
import { ItineraryTemplate, ItineraryTemplateMetadata } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { mergeMetadata } from '@/utils/itinerary/metadata-helpers';
import { COMPLETE_SAMPLE_METADATA } from '@/utils/itinerary/sample-metadata';
import { useToast } from '@/lib/hooks/use-toast'
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ItineraryMetadataSection } from '@/components/itinerary/itinerary-metadata-section';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MetadataEditorClientProps {
  template: ItineraryTemplate;
}

export function MetadataEditorClient({ template }: MetadataEditorClientProps) {
  const { toast } = useToast();
  const [metadata, setMetadata] = useState<ItineraryTemplateMetadata>(template.metadata || {});
  const [jsonEditor, setJsonEditor] = useState<string>(JSON.stringify(metadata, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Basic field editors
  const [pace, setPace] = useState(metadata.pace || '');
  const [budgetPerDay, setBudgetPerDay] = useState(
    metadata.estimated_budget_usd_per_day?.toString() || ''
  );
  const [accessibilityLevel, setAccessibilityLevel] = useState(metadata.accessibility_level || '');
  const [morningStart, setMorningStart] = useState(metadata.morning_start || '');
  const [localTips, setLocalTips] = useState((metadata.local_tips || []).join('\\n'));

  // Handle basic field updates
  const updateBasicFields = () => {
    // Create metadata update
    const updatedMetadata: Partial<ItineraryTemplateMetadata> = {
      pace: pace || undefined,
      estimated_budget_usd_per_day: budgetPerDay ? Number(budgetPerDay) : undefined,
      accessibility_level: accessibilityLevel || undefined,
      morning_start: morningStart || undefined,
      local_tips: localTips ? localTips.split('\\n').filter((tip) => tip.trim()) : undefined,
    };

    // Update metadata state
    setMetadata(mergeMetadata(metadata, updatedMetadata));

    // Update JSON editor
    setJsonEditor(JSON.stringify(mergeMetadata(metadata, updatedMetadata), null, 2));

    toast({
      title: 'Fields updated',
      description: 'Updates applied to preview. Remember to save changes.',
      duration: 3000,
    });
  };

  // Handle JSON editor updates
  const updateFromJson = () => {
    try {
      const parsedJson = JSON.parse(jsonEditor);
      setMetadata(parsedJson);
      setJsonError(null);

      // Update basic fields
      setPace(parsedJson.pace || '');
      setBudgetPerDay(parsedJson.estimated_budget_usd_per_day?.toString() || '');
      setAccessibilityLevel(parsedJson.accessibility_level || '');
      setMorningStart(parsedJson.morning_start || '');
      setLocalTips((parsedJson.local_tips || []).join('\\n'));

      toast({
        title: 'JSON updated',
        description: 'Metadata updated from JSON editor',
        duration: 3000,
      });
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  // Load template examples
  const loadExample = (example: ItineraryTemplateMetadata) => {
    setMetadata(example);
    setJsonEditor(JSON.stringify(example, null, 2));

    // Update basic fields
    setPace(example.pace || '');
    setBudgetPerDay(example.estimated_budget_usd_per_day?.toString() || '');
    setAccessibilityLevel(example.accessibility_level || '');
    setMorningStart(example.morning_start || '');
    setLocalTips((example.local_tips || []).join('\\n'));
  };

  // Save changes to the database
  const saveChanges = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/itineraries/${template.slug}/metadata`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to save metadata');
      }

      toast({
        title: 'Saved successfully',
        description: 'Metadata has been updated',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error saving metadata',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Editor</TabsTrigger>
          <TabsTrigger value="advanced">JSON Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Basic Editor Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Metadata Fields</CardTitle>
              <CardDescription>Edit the most commonly used metadata fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pace">Pace</Label>
                <Input
                  id="pace"
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  placeholder="e.g., Moderate with strategic rest periods"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Estimated Budget (USD per day)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budgetPerDay}
                  onChange={(e) => setBudgetPerDay(e.target.value)}
                  placeholder="e.g., 175"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessibility">Accessibility Level</Label>
                <Select value={accessibilityLevel} onValueChange={setAccessibilityLevel}>
                  <SelectTrigger id="accessibility">
                    <SelectValue>Select accessibility level</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy - suitable for all mobility levels">Easy</SelectItem>
                    <SelectItem value="Moderate - some uneven terrain or stairs">
                      Moderate
                    </SelectItem>
                    <SelectItem value="Difficult - challenging terrain or many stairs">
                      Difficult
                    </SelectItem>
                    <SelectItem value="Very difficult - not wheelchair accessible">
                      Very Difficult
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="morning-start">Morning Start Time</Label>
                <Input
                  id="morning-start"
                  value={morningStart}
                  onChange={(e) => setMorningStart(e.target.value)}
                  placeholder="e.g., 8:30 AM typical departure"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="local-tips">Local Tips (one per line)</Label>
                <Textarea
                  id="local-tips"
                  value={localTips}
                  onChange={(e) => setLocalTips(e.target.value)}
                  placeholder="Enter one tip per line"
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateBasicFields}>Apply Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Examples</CardTitle>
              <CardDescription>Load example metadata to use as a starting point</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-start space-x-2">
              <Button variant="outline" onClick={() => loadExample(COMPLETE_SAMPLE_METADATA)}>
                Complete Example
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Advanced JSON Editor Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>JSON Editor</CardTitle>
              <CardDescription>Edit the raw JSON metadata structure</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jsonEditor}
                onChange={(e) => setJsonEditor(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
              {jsonError && <p className="text-destructive mt-2 text-sm">{jsonError}</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={updateFromJson}>Parse JSON</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Metadata Preview</CardTitle>
              <CardDescription>
                Preview how the metadata will appear on the itinerary page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-background">
                <ItineraryMetadataSection metadata={metadata} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveChanges} disabled={isLoading} size="lg">
          {isLoading ? 'Saving...' : 'Save Changes to Database'}
        </Button>
      </div>
    </div>
  );
}
