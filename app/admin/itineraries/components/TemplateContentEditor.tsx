'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TABLES } from '@/utils/constants/tables';
import { useToast } from '@/components/ui/use-toast';
import { Loader, Plus, Trash2, AlertCircle } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface TemplateContentEditorProps {
  templateId: string;
}

export default function TemplateContentEditor({ templateId }: TemplateContentEditorProps) {
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching sections and items for template ID:', templateId);
        console.log('TABLES.ITINERARY_TEMPLATE_SECTIONS:', TABLES.ITINERARY_TEMPLATE_SECTIONS);

        // Fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
          .select('*')
          .eq('template_id', templateId)
          .order('day_number', { ascending: true });

        if (sectionsError) {
          console.error('Error fetching sections:', sectionsError);
          throw new Error(`Failed to fetch sections: ${sectionsError.message}`);
        }

        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
          .select('*')
          .eq('template_id', templateId)
          .order('position', { ascending: true });

        if (itemsError) {
          console.error('Error fetching items:', itemsError);
          throw new Error(`Failed to fetch items: ${itemsError.message}`);
        }

        setSections(sectionsData || []);
        setItems(itemsData || []);

        console.log('Fetched sections:', sectionsData?.length || 0);
        console.log('Fetched items:', itemsData?.length || 0);

        if (sectionsData && sectionsData.length > 0) {
          setActiveSection(String(sectionsData[0].id));
        }
      } catch (err: any) {
        console.error('Error loading template content:', err);
        setError(err.message || 'Failed to load template content');
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      fetchData();
    }
  }, [templateId, supabase]);

  const handleSaveSection = async (section: TemplateSection) => {
    setIsSaving(true);
    setError(null);

    try {
      console.log('Saving section:', section);
      console.log('Using table:', TABLES.ITINERARY_TEMPLATE_SECTIONS);

      const { data, error: saveError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
        .upsert({
          id: section.id,
          template_id: templateId,
          title: section.title,
          description: section.description,
          day_number: section.day_number,
          position: section.position,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (saveError) {
        console.error('Error saving section:', saveError);
        throw new Error(`Failed to save section: ${saveError.message}`);
      }

      toast({
        title: 'Success',
        description: 'Section saved successfully',
      });

      // Update the sections state with the saved data
      setSections((prevSections) =>
        prevSections.map((s) => (s.id === section.id ? { ...s, ...data[0] } : s))
      );

      console.log('Section saved successfully:', data);

      return data[0];
    } catch (err: any) {
      console.error('Error in handleSaveSection:', err);
      setError(err.message || 'Failed to save section');

      toast({
        title: 'Error',
        description: err.message || 'Failed to save section',
        variant: 'destructive',
      });

      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveItem = async (item: TemplateItem) => {
    setIsSaving(true);
    setError(null);

    try {
      console.log('Saving item:', item);
      console.log('Using table:', TABLES.ITINERARY_TEMPLATE_ITEMS);

      const { data, error: saveError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
        .upsert({
          id: item.id,
          template_id: templateId,
          section_id: item.section_id,
          title: item.title,
          description: item.description,
          day_number: item.day_number,
          position: item.position,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (saveError) {
        console.error('Error saving item:', saveError);
        throw new Error(`Failed to save item: ${saveError.message}`);
      }

      toast({
        title: 'Success',
        description: 'Item saved successfully',
      });

      // Update the items state with the saved data
      setItems((prevItems) => prevItems.map((i) => (i.id === item.id ? { ...i, ...data[0] } : i)));

      console.log('Item saved successfully:', data);

      return data[0];
    } catch (err: any) {
      console.error('Error in handleSaveItem:', err);
      setError(err.message || 'Failed to save item');

      toast({
        title: 'Error',
        description: err.message || 'Failed to save item',
        variant: 'destructive',
      });

      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const addNewSection = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const newDayNumber =
        sections.length > 0 ? Math.max(...sections.map((s) => s.day_number || 0)) + 1 : 1;

      const newSection = {
        template_id: templateId,
        title: `Day ${newDayNumber}`,
        description: '',
        day_number: newDayNumber,
        position: sections.length,
        created_at: new Date().toISOString(),
      };

      console.log('Creating new section:', newSection);
      console.log('Using table:', TABLES.ITINERARY_TEMPLATE_SECTIONS);

      const { data, error: createError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
        .insert(newSection)
        .select();

      if (createError) {
        console.error('Error creating section:', createError);
        throw new Error(`Failed to create section: ${createError.message}`);
      }

      if (data && data.length > 0) {
        const createdSection = data[0] as TemplateSection;
        setSections([...sections, createdSection]);
        setActiveSection(String(createdSection.id));

        toast({
          title: 'Success',
          description: 'New section created successfully',
        });

        console.log('New section created:', createdSection);
      }
    } catch (err: any) {
      console.error('Error in addNewSection:', err);
      setError(err.message || 'Failed to create section');

      toast({
        title: 'Error',
        description: err.message || 'Failed to create section',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewItem = async (sectionId: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const section = sections.find((s) => s.id === sectionId);

      if (!section) {
        throw new Error('Section not found');
      }

      const itemsInSection = items.filter((i) => i.section_id === sectionId);
      const newPosition = itemsInSection.length;

      const newItem = {
        template_id: templateId,
        section_id: sectionId,
        title: 'New Activity',
        description: '',
        day_number: section.day_number,
        position: newPosition,
        created_at: new Date().toISOString(),
      };

      console.log('Creating new item:', newItem);
      console.log('Using table:', TABLES.ITINERARY_TEMPLATE_ITEMS);

      const { data, error: createError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
        .insert(newItem)
        .select();

      if (createError) {
        console.error('Error creating item:', createError);
        throw new Error(`Failed to create item: ${createError.message}`);
      }

      if (data && data.length > 0) {
        const createdItem = data[0] as TemplateItem;
        setItems([...items, createdItem]);

        toast({
          title: 'Success',
          description: 'New item added successfully',
        });

        console.log('New item created:', createdItem);
      }
    } catch (err: any) {
      console.error('Error in addNewItem:', err);
      setError(err.message || 'Failed to create item');

      toast({
        title: 'Error',
        description: err.message || 'Failed to create item',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this section? This will also delete all items in this section.'
      )
    ) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // First delete all items in this section
      const { error: deleteItemsError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
        .delete()
        .eq('section_id', sectionId);

      if (deleteItemsError) {
        console.error('Error deleting section items:', deleteItemsError);
        throw new Error(`Failed to delete section items: ${deleteItemsError.message}`);
      }

      // Then delete the section
      const { error: deleteSectionError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
        .delete()
        .eq('id', sectionId);

      if (deleteSectionError) {
        console.error('Error deleting section:', deleteSectionError);
        throw new Error(`Failed to delete section: ${deleteSectionError.message}`);
      }

      // Update state
      setSections(sections.filter((s) => s.id !== sectionId));
      setItems(items.filter((i) => i.section_id !== sectionId));

      // Set a new active section
      if (activeSection === String(sectionId)) {
        const remainingSections = sections.filter((s) => String(s.id) !== String(sectionId));
        if (remainingSections.length > 0) {
          setActiveSection(String(remainingSections[0].id));
        } else {
          setActiveSection(null);
        }
      }

      toast({
        title: 'Success',
        description: 'Section deleted successfully',
      });

      console.log('Section deleted:', sectionId);
    } catch (err: any) {
      console.error('Error in deleteSection:', err);
      setError(err.message || 'Failed to delete section');

      toast({
        title: 'Error',
        description: err.message || 'Failed to delete section',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('Error deleting item:', deleteError);
        throw new Error(`Failed to delete item: ${deleteError.message}`);
      }

      // Update state
      setItems(items.filter((i) => i.id !== itemId));

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });

      console.log('Item deleted:', itemId);
    } catch (err: any) {
      console.error('Error in deleteItem:', err);
      setError(err.message || 'Failed to delete item');

      toast({
        title: 'Error',
        description: err.message || 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Template Content</CardTitle>
          <Button onClick={addNewSection} disabled={isSaving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {sections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No sections yet. Add your first day to get started.
            </p>
            <Button onClick={addNewSection} disabled={isSaving}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Day
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
                <h3 className="font-medium">Days</h3>
              </div>
              <div className="divide-y">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center ${
                      activeSection === String(section.id) ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                    onClick={() => setActiveSection(String(section.id))}
                  >
                    <div>
                      <h4 className="font-medium">
                        {section.title || `Day ${section.day_number}`}
                      </h4>
                      {section.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {section.description.substring(0, 50)}
                          {section.description.length > 50 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(String(section.id));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              {activeSection ? (
                <SectionEditor
                  section={sections.find((s) => s.id === activeSection)!}
                  items={items.filter((i) => i.section_id === activeSection)}
                  onSaveSection={handleSaveSection}
                  onSaveItem={handleSaveItem}
                  onAddItem={() => addNewItem(activeSection)}
                  onDeleteItem={deleteItem}
                  isSaving={isSaving}
                />
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <p className="text-gray-500">Select a day to edit its content</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SectionEditorProps {
  section: TemplateSection;
  items: TemplateItem[];
  onSaveSection: (section: TemplateSection) => Promise<any>;
  onSaveItem: (item: TemplateItem) => Promise<any>;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  isSaving: boolean;
}

function SectionEditor({
  section,
  items,
  onSaveSection,
  onSaveItem,
  onAddItem,
  onDeleteItem,
  isSaving,
}: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<TemplateSection>({ ...section });
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null);

  // Update local state when section props change
  useEffect(() => {
    setEditedSection({ ...section });
  }, [section]);

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSection((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSection = async () => {
    await onSaveSection(editedSection);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingItem) return;

    const { name, value } = e.target;
    setEditingItem((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;

    await onSaveItem(editingItem);
    setEditingItem(null);
  };

  const startEditingItem = (item: TemplateItem) => {
    setEditingItem({ ...item });
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
          <h3 className="font-medium">Day Information</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={editedSection.title || ''}
              onChange={handleSectionChange}
              placeholder="Day title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={editedSection.description || ''}
              onChange={handleSectionChange}
              placeholder="Day description"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSection} disabled={isSaving}>
              {isSaving ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Day
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Activities</h3>
          <Button onClick={onAddItem} size="sm" disabled={isSaving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
        <div className="divide-y">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No activities yet. Add your first activity.</p>
              <Button onClick={onAddItem} className="mt-4" disabled={isSaving}>
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
          ) : (
            <div>
              {editingItem ? (
                <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                  <div className="space-y-2">
                    <Label htmlFor="itemTitle">Title</Label>
                    <Input
                      id="itemTitle"
                      name="title"
                      value={editingItem.title || ''}
                      onChange={handleItemChange}
                      placeholder="Activity title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemDescription">Description</Label>
                    <Textarea
                      id="itemDescription"
                      name="description"
                      value={editingItem.description || ''}
                      onChange={handleItemChange}
                      placeholder="Activity description"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingItem(null)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveItem} disabled={isSaving}>
                      {isSaving ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Save Activity
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          {item.description ? (
                            item.description.substring(0, 100) +
                            (item.description.length > 100 ? '...' : '')
                          ) : (
                            <span className="text-gray-400 italic">No description</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingItem(item)}
                              disabled={isSaving}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteItem(item.id)}
                              disabled={isSaving}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
