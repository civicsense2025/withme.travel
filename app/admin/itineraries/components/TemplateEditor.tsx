'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { TABLES } from '@/utils/constants/database';
import { useToast } from '@/components/ui/use-toast';
import { ImageSearchSelector } from '@/components/images/image-search-selector';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { Loader, Image as ImageIcon, ExternalLink } from 'lucide-react';
import TemplateContentEditor from './TemplateContentEditor';
import TemplateDebugger from './TemplateDebugger';
import { TemplateData, TemplateSection, TemplateItem } from '../types';
import Image from 'next/image';
import { ImageAttribution } from '@/components/images';

interface TemplateEditorProps {
  template?: TemplateData;
  isNew?: boolean;
}

interface ImageData {
  id: string;
  url: string;
  alt_text?: string;
  type?: string;
  source_name?: string;
  source_url?: string;
  photographer?: string;
  photographer_url?: string;
  metadata?: any;
}

export default function TemplateEditor({ template, isNew = false }: TemplateEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<ImageData | null>(null);
  
  const [form, setForm] = useState({
    id: template?.id || '',
    title: template?.title || '',
    slug: template?.slug || '',
    description: template?.description || '',
    destination_id: template?.destination_id || null,
    is_published: template?.is_published || false,
    featured: template?.featured || false,
    featuredImage: template?.cover_image_url || ''
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch image data if we have a featured image
  useEffect(() => {
    if (form.featuredImage && !selectedImageData) {
      fetchImageData(form.featuredImage);
    }
  }, [form.featuredImage]);

  const fetchImageData = async (imageUrl: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.IMAGES)
        .select('*')
        .eq('url', imageUrl)
        .maybeSingle();
      
      if (data) {
        setSelectedImageData(data);
      }
    } catch (error) {
      console.error('Error fetching image data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    if (!form.title) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive"
      });
      return false;
    }
    
    // Generate slug from title if not provided
    if (!form.slug) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      // Check if template exists before updating (for edit mode)
      if (!isNew) {
        const { data: existing, error: fetchError } = await supabase
          .from(TABLES.ITINERARY_TEMPLATES)
          .select('id')
          .eq('id', form.id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!existing) {
          toast({
            title: "Not Found",
            description: "This template no longer exists.",
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
      }

      const templateData = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        destination_id: form.destination_id,
        is_published: form.is_published,
        featured: form.featured,
        cover_image_url: form.featuredImage
      };

      let result;
      if (isNew) {
        result = await supabase
          .from(TABLES.ITINERARY_TEMPLATES)
          .insert(templateData)
          .select()
          .single();
      } else {
        // Pre-update existence check
        const { data: existing, error: fetchError } = await supabase
          .from(TABLES.ITINERARY_TEMPLATES)
          .select('id')
          .eq('id', form.id)
          .maybeSingle();
        if (fetchError) throw fetchError;
        if (!existing) {
          toast({
            title: "Not Found",
            description: "This template no longer exists.",
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
        result = await supabase
          .from(TABLES.ITINERARY_TEMPLATES)
          .update(templateData)
          .eq('id', form.id)
          .select()
          .maybeSingle();
      }

      const { data, error } = result;

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(error.message || 'Failed to save template');
      }
      if (!data) {
        throw new Error('No template data returned from Supabase. The template may have been deleted.');
      }

      toast({
        title: isNew ? "Template Created" : "Template Updated",
        description: `"${form.title}" has been ${isNew ? 'created' : 'updated'} successfully.`
      });

      if (isNew && data) {
        if (data.slug) {
          router.push(`/admin/itineraries/${data.slug}`);
        } else {
          router.push(`/admin/itineraries/edit/${data.id}`);
        }
      } else {
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = async (imageUrl: string, position: number, metadata?: any) => {
    try {
      // First save the image to our database
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imageUrl,
          imageType: 'template_cover',
          alt: `Cover image for ${form.title}`,
          refId: form.id, // link to the template
          sourceUrl: metadata?.sourceUrl,
          sourceName: metadata?.sourceName,
          photographer: metadata?.photographer,
          photographerUrl: metadata?.photographerUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save image:', error);
        toast({
          title: "Image Save Error",
          description: "Failed to save image. Using direct URL instead.",
          variant: "destructive"
        });
        // Fall back to using the direct URL
        setForm(prev => ({ ...prev, featuredImage: imageUrl }));
        return;
      }

      const data = await response.json();
      console.log('Image saved successfully:', data);
      
      // Use the saved image URL (in case there's any processing)
      const savedImageUrl = data.image?.url || imageUrl;
      setForm(prev => ({ ...prev, featuredImage: savedImageUrl }));
      setSelectedImageData(data.image || null);
      
      toast({
        title: "Image Selected",
        description: "Cover image has been updated.",
      });
    } catch (error) {
      console.error('Error saving image:', error);
      // Fall back to direct URL on error
      setForm(prev => ({ ...prev, featuredImage: imageUrl }));
    }
  };

  // Handle selection from the Media Library
  const handleMediaLibrarySelect = (image: ImageData) => {
    setSelectedImageData(image);
    setForm(prev => ({ ...prev, featuredImage: image.url }));
    setIsMediaLibraryOpen(false);
    
    toast({
      title: "Image Selected",
      description: "Cover image has been updated from the media library.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? 'Create Template' : 'Edit Template'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              {!isNew && <TabsTrigger value="content">Content</TabsTrigger>}
              {!isNew && <TabsTrigger value="debug">Debugger</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    placeholder="Enter template title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input 
                    id="slug" 
                    name="slug" 
                    value={form.slug} 
                    onChange={handleChange} 
                    placeholder="Enter URL slug (or leave empty to generate from title)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="Enter description"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="featuredImage">Featured Image</Label>
                  <div className="flex flex-col gap-2">
                    {form.featuredImage && (
                      <Card>
                        <div className="relative w-full aspect-video rounded-t-md overflow-hidden border-b border-border">
                          <Image 
                            src={form.featuredImage} 
                            alt={selectedImageData?.alt_text || `Cover image for ${form.title}`} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        
                        {selectedImageData && (
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Image Metadata</h4>
                              <Badge variant="outline">{selectedImageData.type || 'template_cover'}</Badge>
                            </div>
                            {selectedImageData.alt_text && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Alt text:</span> {selectedImageData.alt_text}
                              </p>
                            )}
                            
                            <ImageAttribution image={selectedImageData} variant="badges" />
                            
                            <div className="mt-3 p-2 bg-muted rounded-md text-xs">
                              <p className="font-medium mb-1">Attribution Preview:</p>
                              <ImageAttribution image={selectedImageData} variant="inline" />
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsImageSelectorOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {form.featuredImage ? 'Add New Image' : 'Select Image'}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsMediaLibraryOpen(true)}
                        className="flex items-center gap-2"
                      >
                        Browse Media Library
                      </Button>
                      
                      {form.featuredImage && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setForm(prev => ({ ...prev, featuredImage: '' }));
                            setSelectedImageData(null);
                          }}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <Input 
                      id="featuredImage" 
                      name="featuredImage" 
                      value={form.featuredImage} 
                      onChange={handleChange} 
                      placeholder="Or enter image URL directly"
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_published" 
                    checked={form.is_published} 
                    onCheckedChange={(checked) => handleSwitchChange('is_published', checked)} 
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="featured" 
                    checked={form.featured} 
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)} 
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {isNew ? 'Create Template' : 'Save Changes'}
                </Button>
              </div>
            </TabsContent>
            
            {!isNew && (
              <TabsContent value="content">
                <TemplateContentEditor templateId={form.id} />
              </TabsContent>
            )}
            
            {!isNew && (
              <TabsContent value="debug">
                <TemplateDebugger templateId={form.id} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Image selector dialog */}
      <ImageSearchSelector 
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onImageSelect={handleImageSelect}
        initialSearchTerm={form.title}
      />
      
      {/* Media library dialog */}
      <MediaLibrary
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleMediaLibrarySelect}
        currentRefId={form.id}
        defaultImageType="template_cover"
      />
    </div>
  );
} 