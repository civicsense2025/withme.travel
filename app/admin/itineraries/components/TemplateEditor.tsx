'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { TABLES } from '@/utils/constants/tables';
import { useToast } from '@/components/ui/use-toast';
import { TemplateData, Destination, TemplateSection, TemplateItem } from '../types';
import TemplateContentEditor from './TemplateContentEditor';
import { Separator } from '@/components/ui/separator';
import { Loader } from 'lucide-react';
import ImageSelector from '@/app/components/ImageSelector';

interface TemplateEditorProps {
  template: TemplateData;
  destinations: Destination[];
  sections: TemplateSection[];
  items: TemplateItem[];
}

export default function TemplateEditor({ 
  template, 
  destinations,
  sections: initialSections,
  items: initialItems
}: TemplateEditorProps) {
  const [title, setTitle] = useState(template.title || '');
  const [slug, setSlug] = useState(template.slug || '');
  const [description, setDescription] = useState(template.description || '');
  const [destinationId, setDestinationId] = useState(template.destination_id || '');
  const [days, setDays] = useState(template.duration_days || 1);
  const [isFeatured, setIsFeatured] = useState(template.is_featured || false);
  const [coverImage, setCoverImage] = useState(template.cover_image_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<TemplateSection[]>(initialSections || []);
  const [items, setItems] = useState<TemplateItem[]>(initialItems || []);
  
  const { toast } = useToast();
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from(TABLES.ITINERARY_TEMPLATES)
        .update({
          title,
          slug,
          description,
          destination_id: destinationId,
          days,
          duration_days: days,
          is_featured: isFeatured,
          cover_image_url: coverImage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', template.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Template details saved successfully",
      });
      
      router.refresh();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (updatedSections: TemplateSection[], updatedItems: TemplateItem[]) => {
    setSections(updatedSections);
    setItems(updatedItems);
  };

  const handleImageSelect = (imageMeta: { url: string }) => {
    setCoverImage(imageMeta.url);
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList>
        <TabsTrigger value="details">Template Details</TabsTrigger>
        <TabsTrigger value="content">Content & Activities</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Template title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="URL slug"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Template description"
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Select value={destinationId} onValueChange={setDestinationId}>
                    <SelectTrigger id="destination">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((destination) => (
                        <SelectItem key={destination.id} value={destination.id}>
                          {destination.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="days">Number of Days</Label>
                  <Input
                    id="days"
                    type="number"
                    min={1}
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                  <Label htmlFor="is-featured">Featured Template</Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <ImageSelector
                    selectedImage={coverImage}
                    onImageSelect={handleImageSelect}
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Details'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="content">
        <Card>
          <CardHeader>
            <CardTitle>Template Content</CardTitle>
          </CardHeader>
          <CardContent>
            <TemplateContentEditor
              templateId={template.id}
              sections={sections}
              items={items}
              onChange={handleContentChange}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 