'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TABLES } from '@/utils/constants/tables';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Database, RefreshCw } from 'lucide-react';

interface TemplateDebuggerProps {
  templateId: string;
}

export default function TemplateDebugger({ templateId }: TemplateDebuggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [itemsData, setItemsData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch template
      console.log(`Fetching template data for ID: ${templateId}`);
      const { data: template, error: templateError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATES)
        .select('*')
        .eq('id', templateId)
        .single();
      if (templateError) {
        throw new Error(`Error fetching template: ${templateError.message}`);
      }
      setTemplateData(template);
      // Fetch sections
      console.log(`Fetching sections for template ID: ${templateId}`);
      const { data: sections, error: sectionsError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
        .select('*')
        .eq('template_id', templateId)
        .order('day_number', { ascending: true });
      if (sectionsError) {
        setError(`Error fetching sections: ${sectionsError.message}`);
      } else {
        setSectionsData(sections || []);
        console.log(`Found ${sections?.length || 0} sections`);
      }
      // Fetch items
      console.log(`Fetching items for template ID: ${templateId}`);
      const { data: items, error: itemsError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
        .select('*')
        .eq('template_id', templateId)
        .order('day_number', { ascending: true });
      if (itemsError) {
        setError(`Error fetching items: ${itemsError.message}`);
      } else {
        setItemsData(items || []);
        console.log(`Found ${items?.length || 0} items`);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      console.error('Error in debugger:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [templateId]);

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden bg-amber-50 dark:bg-amber-950/20">
      <CardHeader className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Template Debugger
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Accordion
          type="multiple"
          className="space-y-4"
          defaultValue={['template', 'tables', 'sections', 'items']}
        >
          <AccordionItem value="template" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/50">
              Template Data
            </AccordionTrigger>
            <AccordionContent className="bg-white dark:bg-black border-t p-4">
              <div className="overflow-x-auto">
                {templateData ? (
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(templateData, null, 2)}
                  </pre>
                ) : (
                  <div className="text-zinc-500 dark:text-zinc-400">No template data found</div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tables" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/50">
              Table Constants
            </AccordionTrigger>
            <AccordionContent className="bg-white dark:bg-black border-t p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">ITINERARY_TEMPLATES</h3>
                  <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-2 rounded overflow-x-auto">
                    {TABLES.ITINERARY_TEMPLATES}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">ITINERARY_TEMPLATE_SECTIONS</h3>
                  <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-2 rounded overflow-x-auto">
                    {TABLES.ITINERARY_TEMPLATE_SECTIONS}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">ITINERARY_TEMPLATE_ITEMS</h3>
                  <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-2 rounded overflow-x-auto">
                    {TABLES.ITINERARY_TEMPLATE_ITEMS}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sections" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/50">
              Sections ({sectionsData.length})
            </AccordionTrigger>
            <AccordionContent className="bg-white dark:bg-black border-t p-4">
              {sectionsData.length > 0 ? (
                <div className="space-y-4">
                  {sectionsData.map((section, index) => (
                    <div
                      key={section.id}
                      className="border p-3 rounded bg-zinc-50 dark:bg-zinc-900"
                    >
                      <h4 className="font-medium mb-2">
                        Section {index + 1}: {section.title || `Day ${section.day_number}`}
                      </h4>
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(section, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 dark:text-zinc-400">No sections found</div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="items" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/50">
              Items ({itemsData.length})
            </AccordionTrigger>
            <AccordionContent className="bg-white dark:bg-black border-t p-4">
              {itemsData.length > 0 ? (
                <div className="space-y-4">
                  {itemsData.map((item, index) => (
                    <div key={item.id} className="border p-3 rounded bg-zinc-50 dark:bg-zinc-900">
                      <h4 className="font-medium mb-2">
                        Item {index + 1}: {item.title}
                      </h4>
                      <pre className="text-xs overflow-x-auto">{JSON.stringify(item, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 dark:text-zinc-400">No items found</div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="execute"
            className="border border-amber-500 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              Execute Test Queries
            </AccordionTrigger>
            <AccordionContent className="bg-white dark:bg-black border-t p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        // Create a test section
                        const { data, error } = await supabase
                          .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
                          .insert({
                            template_id: templateId,
                            title: 'Test Section',
                            day_number: sectionsData.length + 1,
                            position: sectionsData.length,
                            created_at: new Date().toISOString(),
                          })
                          .select();

                        if (error) throw error;

                        console.log('Test section created:', data);

                        // Refresh data
                        await fetchData();
                      } catch (err: any) {
                        console.error('Error creating test section:', err);
                        setError(`Error creating test section: ${err.message}`);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Test Create Section
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700"
                    onClick={async () => {
                      if (sectionsData.length === 0) {
                        setError('No sections available to test with');
                        return;
                      }

                      setIsLoading(true);
                      try {
                        const testSection = sectionsData[0];

                        // Create a test item
                        const { data, error } = await supabase
                          .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
                          .insert({
                            template_id: templateId,
                            section_id: testSection.id,
                            title: 'Test Item',
                            day_number: testSection.day_number,
                            position: 0,
                            created_at: new Date().toISOString(),
                          })
                          .select();

                        if (error) throw error;

                        console.log('Test item created:', data);

                        // Refresh data
                        await fetchData();
                      } catch (err: any) {
                        console.error('Error creating test item:', err);
                        setError(`Error creating test item: ${err.message}`);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Test Create Item
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
