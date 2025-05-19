'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageSearchSelector } from '@/components/features/images/image-search-selector';
import { MediaLibrary } from '@/components/features/admin/MediaLibrary';
import { useToast } from '@/lib/hooks/use-toast'
import { Plus } from 'lucide-react';

export default function MediaPage() {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const { toast } = useToast();

  const handleImageSelected = (image: any) => {
    toast({
      title: 'Image Selected',
      description: `Selected image: ${image.alt_text || 'Unnamed image'}`,
    });
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Media Library</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImageSelectorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add From External
          </Button>
          <Button onClick={() => setIsMediaLibraryOpen(true)}>Open Media Library</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Media Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This page lets you manage all media assets in the system. You can:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>View all images in the media library</li>
            <li>Edit image metadata (alt text, attribution, etc.)</li>
            <li>Add new images from Unsplash or Pexels</li>
            <li>Upload your own images</li>
            <li>Delete images that are no longer needed</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Browse, search, and manage all images currently in the system.</p>
            <Button onClick={() => setIsMediaLibraryOpen(true)}>Open Media Library</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Images</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add new images from Unsplash, Pexels, or upload your own.</p>
            <Button onClick={() => setIsImageSelectorOpen(true)}>Add New Images</Button>
          </CardContent>
        </Card>
      </div>

      {/* Media library dialog */}
      <MediaLibrary
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleImageSelected}
        allowSelection={false}
      />

      {/* Image selector for adding new images */}
      <ImageSearchSelector
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onImageSelect={(url, position, metadata) => {
          toast({
            title: 'Image Added',
            description: 'Image has been added to the media library',
          });
          setIsImageSelectorOpen(false);
        }}
      />
    </div>
  );
}
