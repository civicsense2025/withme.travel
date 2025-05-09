'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TABLES } from '@/utils/constants/tables';
import { useToast } from '@/components/ui/use-toast';
import { Loader, Plus, Trash2 } from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TemplateContentEditorProps {
  templateId: string;
  sections: TemplateSection[];
  items: TemplateItem[];
  onChange: (sections: TemplateSection[], items: TemplateItem[]) => void;
}

export default function TemplateContentEditor({ 
  templateId, 
  sections: initialSections,
  items: initialItems,
  onChange
}: TemplateContentEditorProps) {
  const [sections, setSections] = useState<TemplateSection[]>(initialSections);
  const [items, setItems] = useState<TemplateItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Update parent component when our state changes
  useEffect(() => {
    onChange(sections, items);
  }, [sections, items, onChange]);

  const handleSaveAll = async () => {
    setIsLoading(true);
    
    try {
      // First, update or create sections
      for (const section of sections) {
        if (section.id.toString().startsWith('new')) {
          // This is a new section to create
          const { id, ...newSection } = section;
          
          const { data, error } = await supabase
            .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
            .insert({
              ...newSection,
              template_id: templateId,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();
            
          if (error) throw error;
          
          // Update section ID in our state and in related items
          const newId = data.id;
          setSections(prevSections => 
            prevSections.map(s => 
              s.id === id ? { ...s, id: newId } : s
            )
          );
          
          setItems(prevItems => 
            prevItems.map(item => 
              item.section_id === id ? { ...item, section_id: newId } : item
            )
          );
        } else {
          // Update existing section
          const { error } = await supabase
            .from(TABLES.ITINERARY_TEMPLATE_SECTIONS)
            .update({
              title: section.title,
              description: section.description,
              day_number: section.day_number,
              position: section.position,
              updated_at: new Date().toISOString()
            })
            .eq('id', section.id);
            
          if (error) throw error;
        }
      }
      
      // Then, update or create items
      for (const item of items) {
        if (item.id.toString().startsWith('new')) {
          // This is a new item to create
          const { id, ...newItem } = item;
          
          const { error } = await supabase
            .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
            .insert({
              ...newItem,
              template_id: templateId,
              created_at: new Date().toISOString()
            });
            
          if (error) throw error;
        } else {
          // Update existing item
          const { error } = await supabase
            .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
            .update({
              title: item.title,
              description: item.description,
              day_number: item.day_number,
              position: item.position,
              section_id: item.section_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
            
          if (error) throw error;
        }
      }
      
      toast({
        title: "Success",
        description: "Template content saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving template content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    const newSection: TemplateSection = {
      id: `new-${Date.now()}`,
      template_id: templateId,
      day_number: sections.length + 1,
      title: `Day ${sections.length + 1}`,
      position: sections.length,
    };
    
    setSections([...sections, newSection]);
  };

  const updateSection = (updatedSection: TemplateSection) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === updatedSection.id ? updatedSection : section
      )
    );
  };

  const deleteSection = (sectionId: string | number) => {
    // Remove the section
    setSections(prevSections => 
      prevSections.filter(section => section.id !== sectionId)
    );
    
    // Remove items associated with this section
    setItems(prevItems => 
      prevItems.filter(item => item.section_id !== sectionId)
    );
  };

  const addItem = (sectionId: string | number) => {
    const sectionItems = items.filter(item => item.section_id === sectionId);
    const section = sections.find(s => s.id === sectionId);
    
    const newItem: TemplateItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      template_id: templateId,
      section_id: sectionId,
      day_number: section?.day_number || 1,
      position: sectionItems.length,
      title: `Activity ${sectionItems.length + 1}`,
    };
    
    setItems([...items, newItem]);
  };

  const updateItem = (updatedItem: TemplateItem) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const deleteItem = (itemId: string) => {
    setItems(prevItems => 
      prevItems.filter(item => item.id !== itemId)
    );
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-gray-500">No sections have been added to this template yet.</p>
        <Button onClick={addSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Day
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={[sections[0]?.id.toString()]}>
        {sections.map((section) => {
          const sectionItems = items.filter(item => item.section_id === section.id);
          
          return (
            <AccordionItem 
              key={section.id.toString()} 
              value={section.id.toString()}
              className="border rounded-lg mb-4"
            >
              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{section.title || `Day ${section.day_number}`}</span>
                  <span className="text-gray-500 text-sm">({sectionItems.length} activities)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Label htmlFor={`section-day-${section.id}`}>Day Number</Label>
                      <Input
                        id={`section-day-${section.id}`}
                        type="number"
                        min={1}
                        value={section.day_number}
                        onChange={(e) => updateSection({ 
                          ...section, 
                          day_number: parseInt(e.target.value) || 1 
                        })}
                      />
                    </div>
                    <div className="space-y-2 md:text-right">
                      <Label className="md:hidden">Actions</Label>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Day
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`section-description-${section.id}`}>Description</Label>
                    <Textarea
                      id={`section-description-${section.id}`}
                      value={section.description || ''}
                      onChange={(e) => updateSection({ ...section, description: e.target.value })}
                      placeholder="Day description or notes"
                      rows={2}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Activities</h3>
                      <Button size="sm" onClick={() => addItem(section.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>
                    
                    {sectionItems.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sectionItems.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Input
                                  value={item.title || ''}
                                  onChange={(e) => updateItem({ ...item, title: e.target.value })}
                                  placeholder="Activity title"
                                />
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                  onClick={() => deleteItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-6">
                          <p className="text-gray-500 mb-2">No activities added yet</p>
                          <Button size="sm" onClick={() => addItem(section.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Activity
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      
      <div className="flex justify-between items-center mt-6">
        <Button onClick={addSection} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add New Day
        </Button>
        
        <Button onClick={handleSaveAll} disabled={isLoading}>
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