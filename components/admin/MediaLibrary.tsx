'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageSearchSelector } from '@/components/images/image-search-selector';
import { TABLES, ENUMS } from '@/utils/constants/database';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Edit, Trash, Plus, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageAttribution } from '@/components/images';

interface User {
  id: string;
  // Add any other necessary properties
}

export interface Image {
  id: number | string;
  external_id?: string | null;
  source?: string | null;
  url: string;
  image_url: string;
  thumb_url?: string | null;
  alt_text?: string | null;
  photographer?: string | null;
  photographer_url?: string | null;
  attribution_html?: string | null;
  width?: number | null;
  height?: number | null;
  city_id?: string | null;
  destination_id?: string | null;
  trip_id?: string | null;
  user_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  // Keep these for backward compatibility during transition
  source_name?: string | null;
  source_url?: string | null;
  type?: string | null;
  metadata?: any;
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (image: Image) => void;
  allowSelection?: boolean;
  currentRefId?: string;
  defaultImageType?: string;
}

export function MediaLibrary({
  isOpen,
  onClose,
  onSelect,
  allowSelection = true,
  currentRefId,
  defaultImageType = 'template_cover',
}: MediaLibraryProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('library');
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Image>>({});
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Use effect to get the user on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUser(data.user);
      }
    };
    getUser();
  }, [supabase.auth]);

  // Fetch images
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from(TABLES.IMAGES)
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('alt_text', `%${searchTerm}%`);
      }

      if (currentRefId) {
        query = query.or(`ref_id.eq.${currentRefId},ref_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setImages(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching images',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, searchTerm]);

  // Handle image selection from external service
  const handleImageSelect = async (imageUrl: string, position: number, metadata?: any) => {
    try {
      // Save the image to the database
      const { data, error } = await supabase
        .from(TABLES.IMAGES)
        .insert({
          url: imageUrl,
          image_url: imageUrl,
          thumb_url: metadata?.thumbUrl || imageUrl,
          alt_text: metadata?.alt || 'Image',
          source: metadata?.sourceName || null,
          external_id: metadata?.id || null,
          photographer: metadata?.photographer || null,
          photographer_url: metadata?.photographerUrl || null,
          width: metadata?.width || null,
          height: metadata?.height || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Image saved',
        description: 'Image has been added to the media library',
      });

      // Refresh the library
      await fetchImages();
      setIsImageSelectorOpen(false);
      setActiveTab('library');

      // Auto-select the new image if selection is enabled
      if (allowSelection && onSelect && data) {
        onSelect(data);
      }
    } catch (error: any) {
      toast({
        title: 'Error saving image',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteImage = async (image: Image) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const { error } = await supabase.from(TABLES.IMAGES).delete().eq('id', image.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Image deleted',
        description: 'Image has been removed from the library',
      });

      await fetchImages();
    } catch (error: any) {
      toast({
        title: 'Error deleting image',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (image: Image) => {
    setEditForm(image);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const { error } = await supabase
        .from(TABLES.IMAGES)
        .update({
          alt_text: editForm.alt_text,
          source: editForm.source || editForm.source_name,
          photographer: editForm.photographer,
          photographer_url: editForm.photographer_url,
        })
        .eq('id', editForm.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Image updated',
        description: 'Image metadata has been updated',
      });

      await fetchImages();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error updating image',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderImageGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card
          key={image.id}
          className={`overflow-hidden ${selectedImage?.id === image.id ? 'ring-2 ring-primary' : ''}`}
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={image.image_url || image.url}
              alt={image.alt_text || 'Image'}
              fill
              className="object-cover"
            />
            <ImageAttribution image={image} variant="overlay" />
          </div>
          <CardFooter className="flex justify-between p-2">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(image)}
                title="Edit metadata"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteImage(image)}
                title="Delete image"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            {allowSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedImage(image);
                  if (onSelect) {
                    onSelect(image);
                  }
                }}
              >
                Select
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Media Library</DialogTitle>
            <DialogDescription>Manage and select images for your content</DialogDescription>
          </DialogHeader>

          <div className="flex-grow flex flex-col overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex flex-col flex-grow"
            >
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="library">Library</TabsTrigger>
                  <TabsTrigger value="upload">Add New</TabsTrigger>
                </TabsList>

                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-60"
                  />
                  <Button onClick={fetchImages} disabled={isLoading} variant="outline" size="icon">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-grow px-6 py-4">
                <TabsContent value="library" className="mt-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : images.length > 0 ? (
                    renderImageGrid()
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No images found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload new images or adjust your search filters
                      </p>
                      <Button onClick={() => setActiveTab('upload')}>
                        <Plus className="h-4 w-4 mr-2" /> Add New Image
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Add New Images</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Search and select images from Unsplash, Pexels, or upload your own
                    </p>
                    <Button onClick={() => setIsImageSelectorOpen(true)}>
                      Open Image Selector
                    </Button>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {allowSelection && (
              <Button
                onClick={() => {
                  if (selectedImage && onSelect) {
                    onSelect(selectedImage);
                    onClose();
                  }
                }}
                disabled={!selectedImage}
              >
                Use Selected Image
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image selector dialog */}
      <ImageSearchSelector
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onImageSelect={handleImageSelect}
        initialSearchTerm=""
      />

      {/* Edit metadata dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image Metadata</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-md mb-2">
              {editForm.url && (
                <Image
                  src={editForm.url}
                  alt={editForm.alt_text || 'Image preview'}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alt-text" className="text-right">
                Alt Text
              </Label>
              <Input
                id="alt-text"
                value={editForm.alt_text || ''}
                onChange={(e) => setEditForm({ ...editForm, alt_text: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image-type" className="text-right">
                Type
              </Label>
              <Select
                value={editForm.type ?? undefined}
                onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                className="col-span-3"
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue>Select type</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ENUMS.IMAGE_TYPE.DESTINATION}>Destination</SelectItem>
                  <SelectItem value={ENUMS.IMAGE_TYPE.TRIP_COVER}>Trip Cover</SelectItem>
                  <SelectItem value={ENUMS.IMAGE_TYPE.USER_AVATAR}>User Avatar</SelectItem>
                  <SelectItem value={ENUMS.IMAGE_TYPE.TEMPLATE_COVER}>Template Cover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Source
              </Label>
              <Input
                id="source"
                value={editForm.source || editForm.source_name || ''}
                onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                className="col-span-3"
                placeholder="Unsplash, Pexels, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source-url" className="text-right">
                Source URL
              </Label>
              <Input
                id="source-url"
                value={
                  typeof editForm.url === 'string'
                    ? editForm.url
                    : typeof editForm.source_url === 'string'
                      ? editForm.source_url
                      : ''
                }
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                className="col-span-3"
                placeholder="https://"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photographer" className="text-right">
                Photographer
              </Label>
              <Input
                id="photographer"
                value={editForm.photographer || ''}
                onChange={(e) => setEditForm({ ...editForm, photographer: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photographer-url" className="text-right">
                Photographer URL
              </Label>
              <Input
                id="photographer-url"
                value={editForm.photographer_url ?? undefined}
                onChange={(e) => setEditForm({ ...editForm, photographer_url: e.target.value })}
                className="col-span-3"
                placeholder="https://"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
