'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TABLES } from '@/utils/constants/database';
import { useToast } from '@/lib/hooks/use-toast'
import { Loader, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { TemplateSection, TemplateItem } from '../types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { TimePicker } from '@/components/ui/time-picker';

interface TemplateSectionsEditorProps {
  templateId: string;
  sections: TemplateSection[];
  items: TemplateItem[];
  onChange?: (sections: TemplateSection[], items: TemplateItem[]) => void;
}

export default function TemplateSectionsEditor({
  templateId,
  sections: initialSections,
  items: initialItems,
  onChange,
}: TemplateSectionsEditorProps) {
  const [sections, setSections] = useState<TemplateSection[]>(initialSections);
  const [items, setItems] = useState<TemplateItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const addNewSection = () => {
    const newDayNumber =
      sections.length > 0 ? Math.max(...sections.map((s) => s.day_number)) + 1 : 1;

    const newSection: TemplateSection = {
      id: `temp-${Date.now()}`,
      template_id: templateId,
      day_number: newDayNumber,
      title: `Day ${newDayNumber}`,
      position: 0,
    };

    setSections([...sections, newSection]);

    if (onChange) {
      onChange([...sections, newSection], items);
    }
  };

  const updateSection = (updatedSection: TemplateSection) => {
    const updatedSections = sections.map((section) =>
      section.id === updatedSection.id ? updatedSection : section
    );

    setSections(updatedSections);

    if (onChange) {
      onChange(updatedSections, items);
    }
  };

  const deleteSection = (sectionId: string | number) => {
    // First check if there are items in this section
    const sectionItems = items.filter(
      (item) =>
        item.section_id === sectionId ||
        item.day_number === sections.find((s) => s.id === sectionId)?.day_number
    );

    if (sectionItems.length > 0) {
      toast({
        title: 'Cannot Delete Section',
        description: 'This section contains items. Please delete all items first.',
        variant: 'destructive',
      });
      return;
    }

    const updatedSections = sections.filter((section) => section.id !== sectionId);
    setSections(updatedSections);

    if (onChange) {
      onChange(updatedSections, items);
    }
  };

  const addNewItem = (sectionId: string | number, dayNumber: number) => {
    const sectionItems = items.filter(
      (item) => item.section_id === sectionId || item.day_number === dayNumber
    );

    const newPosition =
      sectionItems.length > 0 ? Math.max(...sectionItems.map((item) => item.position || 0)) + 1 : 0;

    const newItem: TemplateItem = {
      id: `temp-${Date.now()}`,
      template_id: templateId,
      section_id: sectionId,
      day_number: dayNumber,
      day: dayNumber,
      position: newPosition,
      title: 'New Activity',
      item_type: 'activity',
    };

    setItems([...items, newItem]);

    if (onChange) {
      onChange(sections, [...items, newItem]);
    }
  };

  const updateItem = (updatedItem: TemplateItem) => {
    const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));

    setItems(updatedItems);

    if (onChange) {
      onChange(sections, updatedItems);
    }
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    setItems(updatedItems);

    if (onChange) {
      onChange(sections, updatedItems);
    }
  };

  const moveItemUp = (itemId: string) => {
    const itemIndex = items.findIndex((item) => item.id === itemId);
    if (itemIndex <= 0) return;

    const item = items[itemIndex];
    const prevItem = items[itemIndex - 1];

    // Make sure they're in the same section/day
    if (item.section_id !== prevItem.section_id || item.day_number !== prevItem.day_number) {
      return;
    }

    // Swap positions
    const updatedItems = [...items];
    const itemPosition = item.position || 0;
    const prevPosition = prevItem.position || 0;

    updatedItems[itemIndex] = { ...item, position: prevPosition };
    updatedItems[itemIndex - 1] = { ...prevItem, position: itemPosition };

    setItems(updatedItems);

    if (onChange) {
      onChange(sections, updatedItems);
    }
  };

  const moveItemDown = (itemId: string) => {
    const itemIndex = items.findIndex((item) => item.id === itemId);
    if (itemIndex >= items.length - 1) return;

    const item = items[itemIndex];
    const nextItem = items[itemIndex + 1];

    // Make sure they're in the same section/day
    if (item.section_id !== nextItem.section_id || item.day_number !== nextItem.day_number) {
      return;
    }

    // Swap positions
    const updatedItems = [...items];
    const itemPosition = item.position || 0;
    const nextPosition = nextItem.position || 0;

    updatedItems[itemIndex] = { ...item, position: nextPosition };
    updatedItems[itemIndex + 1] = { ...nextItem, position: itemPosition };

    setItems(updatedItems);

    if (onChange) {
      onChange(sections, updatedItems);
    }
  };

  const getSectionItems = (sectionId: string | number, dayNumber: number) => {
    return items
      .filter(
        (item) =>
          item.section_id === sectionId || (item.day_number === dayNumber && !item.section_id)
      )
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const saveChanges = async () => {
    setIsLoading(true);
    try {
      // Process sections
      for (const section of sections) {
        if (typeof section.id === 'string' && section.id.startsWith('temp-')) {
          // This is a new section, create it
          const { data, error } = await supabase
            .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
            .insert({
              template_id: templateId,
              day_number: section.day_number,
              title: section.title,
              description: section.description,
              position: section.position,
            })
            .select('id')
            .single();

          if (error) throw error;
          if (!data) throw new Error('No section data returned from Supabase.');

          // Update the ID in our local state
          section.id = data.id;
        } else {
          // Update existing section
          const { error } = await supabase
            .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
            .update({
              title: section.title,
              description: section.description,
              day_number: section.day_number,
              position: section.position,
            })
            .eq('id', section.id);

          if (error) throw error;
        }
      }

      // Process items
      for (const item of items) {
        if (typeof item.id === 'string' && item.id.startsWith('temp-')) {
          // This is a new item, create it
          const { error } = await supabase.from(TABLES.ITINERARY_TEMPLATE_ITEMS).insert({
            template_id: templateId,
            section_id: item.section_id,
            day: item.day_number,
            day_number: item.day_number,
            title: item.title,
            description: item.description,
            position: item.position,
            item_order: item.position,
            start_time: item.start_time,
            end_time: item.end_time,
            location: item.location,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            estimated_cost: item.estimated_cost,
            currency: item.currency,
            duration_minutes: item.duration_minutes,
            item_type: item.item_type,
            category: item.category,
          });

          if (error) throw error;
        } else {
          // Update existing item
          const { error } = await supabase
            .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
            .update({
              section_id: item.section_id,
              day: item.day_number,
              day_number: item.day_number,
              title: item.title,
              description: item.description,
              position: item.position,
              item_order: item.position,
              start_time: item.start_time,
              end_time: item.end_time,
              location: item.location,
              address: item.address,
              latitude: item.latitude,
              longitude: item.longitude,
              estimated_cost: item.estimated_cost,
              currency: item.currency,
              duration_minutes: item.duration_minutes,
              item_type: item.item_type,
              category: item.category,
            })
            .eq('id', item.id);

          if (error) throw error;
        }
      }

      toast({
        title: 'Success',
        description: 'Template sections and items saved successfully',
      });

      router.refresh();
    } catch (error: any) {
      console.error('Error saving template content:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template content',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Template Content</h2>
        <div className="flex gap-2">
          <Button onClick={addNewSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
          <Button onClick={saveChanges} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <Accordion type="multiple" className="w-full">
        {sections
          .sort((a, b) => a.day_number - b.day_number)
          .map((section) => (
            <AccordionItem key={section.id} value={section.id.toString()}>
              <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-900 px-4 rounded-md">
                <div className="flex-1 text-left">
                  Day {section.day_number}: {section.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor={`section-title-${section.id}`}>Day Title</Label>
                    <Input
                      id={`section-title-${section.id}`}
                      value={section.title || ''}
                      onChange={(e) => updateSection({ ...section, title: e.target.value })}
                      placeholder="Day title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`section-description-${section.id}`}>Day Description</Label>
                    <Textarea
                      id={`section-description-${section.id}`}
                      value={section.description || ''}
                      onChange={(e) => updateSection({ ...section, description: e.target.value })}
                      placeholder="Description of this day"
                      rows={3}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Activities</h3>
                      <Button size="sm" onClick={() => addNewItem(section.id, section.day_number)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {getSectionItems(section.id, section.day_number).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-md">
                          No activities added yet. Click "Add Activity" to get started.
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">Order</TableHead>
                              <TableHead>Activity</TableHead>
                              <TableHead className="w-[150px]">Time</TableHead>
                              <TableHead className="w-[100px]">Duration</TableHead>
                              <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getSectionItems(section.id, section.day_number).map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="flex flex-col items-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => moveItemUp(item.id)}
                                      className="h-6 w-6"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    {item.position || 0}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => moveItemDown(item.id)}
                                      className="h-6 w-6"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <Input
                                      value={item.title || ''}
                                      onChange={(e) =>
                                        updateItem({ ...item, title: e.target.value })
                                      }
                                      placeholder="Activity title"
                                      className="font-medium"
                                    />
                                    <Textarea
                                      value={item.description || ''}
                                      onChange={(e) =>
                                        updateItem({ ...item, description: e.target.value })
                                      }
                                      placeholder="Activity description"
                                      rows={2}
                                      className="text-sm"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-500">Start</div>
                                    <Input
                                      type="time"
                                      value={item.start_time?.slice(0, 5) || ''}
                                      onChange={(e) =>
                                        updateItem({ ...item, start_time: e.target.value })
                                      }
                                      className="text-sm"
                                    />
                                    <div className="text-sm text-gray-500">End</div>
                                    <Input
                                      type="time"
                                      value={item.end_time?.slice(0, 5) || ''}
                                      onChange={(e) =>
                                        updateItem({ ...item, end_time: e.target.value })
                                      }
                                      className="text-sm"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.duration_minutes || ''}
                                    onChange={(e) =>
                                      updateItem({
                                        ...item,
                                        duration_minutes: e.target.value
                                          ? parseInt(e.target.value)
                                          : undefined,
                                      })
                                    }
                                    placeholder="Minutes"
                                    className="text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSection(section.id)}
                    >
                      Delete This Day
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>

      {sections.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">No days have been added to this template yet</div>
            <Button onClick={addNewSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Day
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end mt-6">
        <Button onClick={saveChanges} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save All Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
