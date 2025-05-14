'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { TABLES } from '@/utils/constants/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Image as ImageIcon, Plus, Save, Trash } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
}

interface TemplateItem {
  id: string;
  title: string;
  description: string | null;
  position: number;
  place_id: string | null;
  image_url: string | null;
  metadata: any;
}

interface TemplateSection {
  id: string;
  title: string;
  description: string | null;
  day_number: number;
  position: number;
  template_items: TemplateItem[];
}

interface ItineraryTemplate {
  id: string;
  title: string;
  description: string | null;
  destination_id: string | null;
  creator_id: string | null;
  days: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  destinations?: Destination[] | null;
}

interface ItineraryTemplateEditorProps {
  template: ItineraryTemplate;
  sections: TemplateSection[];
}

export default function ItineraryTemplateEditor({
  template,
  sections: initialSections,
}: ItineraryTemplateEditorProps) {
  const [templateData, setTemplateData] = useState<ItineraryTemplate>(template);
  const [sections, setSections] = useState<TemplateSection[]>(initialSections);
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplateData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePublishedChange = (checked: boolean) => {
    setTemplateData((prev) => ({ ...prev, is_published: checked }));
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Update the template basic info
      const { error, data } = await supabase
        .from(TABLES.ITINERARY_TEMPLATES)
        .update({
          title: templateData.title,
          description: templateData.description,
          days: templateData.days,
          is_published: templateData.is_published,
          // Add other fields as needed
        })
        .eq('id', templateData.id)
        .select()
        .single(); // Ensures only one row is returned

      if (error) throw error;
      if (!data) throw new Error('No template data returned from Supabase.');

      setSuccessMessage('Template saved successfully');
      router.refresh();
    } catch (error) {
      console.error('Error saving template:', error);
      setErrorMessage('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (result: any) => {
    // Handle drag and drop reordering here
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      // Reorder sections
      const reorderedSections = [...sections];
      const [removed] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, removed);

      // Update positions
      const updatedSections = reorderedSections.map((section, index) => ({
        ...section,
        position: index,
      }));

      setSections(updatedSections);
      // Save to database would be done here
    } else if (type === 'item') {
      // Extract section IDs
      const sectionId = source.droppableId;
      const destinationSectionId = destination.droppableId;

      if (sectionId === destinationSectionId) {
        // Reorder within the same section
        const sectionIndex = sections.findIndex((s) => s.id === sectionId);
        if (sectionIndex === -1) return;

        const newSections = [...sections];
        const items = [...newSections[sectionIndex].template_items];
        const [removed] = items.splice(source.index, 1);
        items.splice(destination.index, 0, removed);

        // Update positions
        const updatedItems = items.map((item, index) => ({
          ...item,
          position: index,
        }));

        newSections[sectionIndex].template_items = updatedItems;
        setSections(newSections);
        // Save to database would be done here
      } else {
        // Move between sections
        // Implementation would be similar but across different sections
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex flex-col space-y-2">
        <div>
          <Link
            href="/admin/itineraries"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Templates
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Itinerary Template</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={templateData.is_published}
                onCheckedChange={handlePublishedChange}
              />
              <Label htmlFor="published">{templateData.is_published ? 'Published' : 'Draft'}</Label>
            </div>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Success/Error messages */}
      {errorMessage && <div className="bg-red-100 text-red-800 p-3 rounded-md">{errorMessage}</div>}
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md">{successMessage}</div>
      )}

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="sections">Sections & Items</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
              <CardDescription>Basic information about this itinerary template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Template Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={templateData.title}
                      onChange={handleTemplateChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="days">Number of Days</Label>
                    <Input
                      id="days"
                      name="days"
                      type="number"
                      value={templateData.days}
                      onChange={handleTemplateChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={templateData.description || ''}
                      onChange={handleTemplateChange}
                      rows={5}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <div className="p-4 border rounded-md">
                      {templateData.destinations && templateData.destinations.length > 0 ? (
                        <div>
                          <p className="font-medium">
                            {templateData.destinations[0].name || templateData.destinations[0].city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {templateData.destinations[0].country}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No destination selected</p>
                      )}
                      <Button variant="outline" className="mt-2" size="sm">
                        Change Destination
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="border rounded-md overflow-hidden">
                      {templateData.image_url ? (
                        <div className="relative h-40 w-full">
                          <Image
                            src={templateData.image_url}
                            alt={templateData.title}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="h-40 bg-gray-100 flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-10 w-10 mb-2" />
                          <p>No cover image</p>
                        </div>
                      )}
                      <div className="p-3 border-t">
                        <Button variant="outline" size="sm">
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Template Sections</CardTitle>
                <CardDescription>Organize your template into days and sections</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections" type="section">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {sections.map((section, index) => (
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border rounded-md p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div {...provided.dragHandleProps} className="px-2 cursor-grab">
                                    ⋮⋮
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{section.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Day {section.day_number} • {section.template_items.length}{' '}
                                      items
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline">
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Items list */}
                              <Droppable droppableId={section.id} type="item">
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="pl-6 space-y-2"
                                  >
                                    {section.template_items.map((item, itemIndex) => (
                                      <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={itemIndex}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                                          >
                                            <div className="font-medium">{item.title}</div>
                                            <div>
                                              <Button size="sm" variant="ghost">
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    <Button size="sm" variant="outline" className="w-full mt-2">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Item
                                    </Button>
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>Preview how your template will appear to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="max-w-2xl w-full border rounded-md p-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{templateData.title}</h2>
                    {templateData.description && (
                      <p className="text-muted-foreground mt-2">{templateData.description}</p>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Badge>{templateData.days} Days</Badge>
                      {templateData.destinations && templateData.destinations.length > 0 && (
                        <Badge variant="outline">
                          {templateData.destinations[0].name || templateData.destinations[0].city},
                          {templateData.destinations[0].country}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {sections.length > 0 ? (
                    <div className="space-y-6">
                      {sections.map((section) => (
                        <div key={section.id} className="border-t pt-4">
                          <h3 className="font-bold">
                            Day {section.day_number}: {section.title}
                          </h3>
                          {section.description && (
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                          )}
                          <div className="mt-3 space-y-3">
                            {section.template_items.map((item) => (
                              <div key={item.id} className="flex gap-3 py-2">
                                {item.image_url ? (
                                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                    <Image
                                      src={item.image_url}
                                      alt={item.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0" />
                                )}
                                <div>
                                  <h4 className="font-medium">{item.title}</h4>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No sections added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
