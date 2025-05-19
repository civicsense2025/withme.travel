'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/hooks/use-toast'
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, Loader, X, Upload, Search } from 'lucide-react';

interface ImageMeta {
  url: string;
  alt?: string;
  photographer?: string;
  photographerUrl?: string;
  source?: 'unsplash' | 'pexels';
}

interface ImageSelectorProps {
  selectedImage: string;
  onImageSelect: (meta: ImageMeta) => void;
}

export default function ImageSelector({ selectedImage, onImageSelect }: ImageSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<'pexels' | 'unsplash'>('unsplash');

  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const searchImages = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let results;

      if (searchSource === 'pexels') {
        // Search Pexels API
        const response = await fetch(
          `/api/image-search/pexels?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        results = data.photos || [];
      } else {
        // Search Unsplash API
        const response = await fetch(
          `/api/image-search/unsplash?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        results = data.results || [];
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching images:', error);
      toast({
        title: 'Error',
        description: 'Failed to search images',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectImage = (meta: ImageMeta) => {
    onImageSelect(meta);
    setIsDialogOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Upload to Supabase Storage
      const filename = `image_${Date.now()}`;
      const { data, error } = await supabase.storage.from('images').upload(filename, file, {
        upsert: true,
      });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);

      // Update with image URL
      onImageSelect({
        url: urlData.publicUrl,
        alt: undefined,
        photographer: undefined,
        photographerUrl: undefined,
        source: undefined,
      });

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-2 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden relative">
        {selectedImage ? (
          <div className="relative w-full h-64">
            <Image src={selectedImage} alt="Selected image" fill style={{ objectFit: 'cover' }} />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() =>
                onImageSelect({
                  url: '',
                  alt: undefined,
                  photographer: undefined,
                  photographerUrl: undefined,
                  source: undefined,
                })
              }
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-900 h-64 flex flex-col items-center justify-center">
            <ImageIcon size={48} className="text-gray-400 mb-2" />
            <div className="text-gray-500 dark:text-gray-400">No image selected</div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Search size={16} className="mr-2 h-4 w-4" />
              Search Images
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[875px]">
            <DialogHeader>
              <DialogTitle>Select an Image</DialogTitle>
              <DialogDescription>
                Search for an image from Pexels or Unsplash, or upload your own.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="unsplash">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="unsplash" onClick={() => setSearchSource('unsplash')}>
                  Unsplash
                </TabsTrigger>
                <TabsTrigger value="pexels" onClick={() => setSearchSource('pexels')}>
                  Pexels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unsplash" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for images on Unsplash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission
                        searchImages();
                      }
                    }}
                  />
                  <Button onClick={searchImages} disabled={isSearching}>
                    {isSearching ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search size={16} className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
                  {searchResults
                    .filter((image: any) => image?.urls && image.urls.small && image.urls.regular)
                    .map((image: any) => (
                      <div
                        key={image.id}
                        className="relative h-40 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          handleSelectImage({
                            url: image.urls.regular,
                            alt: image.alt_description || 'Unsplash image',
                            photographer: image.user?.name,
                            photographerUrl: image.user?.links?.html,
                            source: 'unsplash',
                          })
                        }
                      >
                        <Image
                          src={image.urls.small}
                          alt={image.alt_description || 'Unsplash image'}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-md"
                        />
                      </div>
                    ))}
                </div>

                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-10 text-gray-500">
                    Search for images to see results here
                  </div>
                )}

                {isSearching && (
                  <div className="text-center py-10">
                    <Loader className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Searching...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pexels" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for images on Pexels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission
                        searchImages();
                      }
                    }}
                  />
                  <Button onClick={searchImages} disabled={isSearching}>
                    {isSearching ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search size={16} className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
                  {searchResults
                    .filter((image: any) => image?.src && image.src.medium && image.src.large)
                    .map((image: any) => (
                      <div
                        key={image.id}
                        className="relative h-40 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          handleSelectImage({
                            url: image.src.large,
                            alt: image.photographer || 'Pexels image',
                            photographer: image.photographer,
                            photographerUrl: image.url,
                            source: 'pexels',
                          })
                        }
                      >
                        <Image
                          src={image.src.medium}
                          alt={image.photographer || 'Pexels image'}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-md"
                        />
                      </div>
                    ))}
                </div>

                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-10 text-gray-500">
                    Search for images to see results here
                  </div>
                )}

                {isSearching && (
                  <div className="text-center py-10">
                    <Loader className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Searching...</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="relative flex-1">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload size={16} className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}
