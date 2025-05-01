'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, UploadCloud } from 'lucide-react';
import Image from 'next/image'; // Use Next.js Image component
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ImageResult {
  id: string;
  url: string;
  thumbUrl: string;
  description: string;
  photographer: string;
  photographerUrl: string;
}

interface ImageSearchSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string, position: number) => void;
  initialSearchTerm?: string;
}

export function ImageSearchSelector({
  isOpen,
  onClose,
  onImageSelect,
  initialSearchTerm = '',
}: ImageSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [activeTab, setActiveTab] = useState('unsplash'); // 'unsplash', 'pexels', or 'upload'
  const [unsplashResults, setUnsplashResults] = useState<ImageResult[]>([]);
  const [pexelsResults, setPexelsResults] = useState<ImageResult[]>([]);
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [pexelsPage, setPexelsPage] = useState(1);
  const [unsplashTotalPages, setUnsplashTotalPages] = useState(1);
  const [pexelsTotalPages, setPexelsTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // --- Add state for preview ---
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(50); // Default 50%
  // --- End preview state ---

  const searchImages = useCallback(
    async (
      provider: 'unsplash' | 'pexels',
      page: number,
      query: string,
      append: boolean = false
    ) => {
      if (!query) return;
      setIsLoading(true);
      setError(null);

      const apiUrl =
        provider === 'unsplash'
          ? `/api/images/search-unsplash?query=${encodeURIComponent(query)}&page=${page}`
          : `/api/images/search-pexels?query=${encodeURIComponent(query)}&page=${page}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch from ${provider}`);
        }
        const data = await response.json();

        if (provider === 'unsplash') {
          setUnsplashResults((prev) => (append ? [...prev, ...data.photos] : data.photos));
          setUnsplashTotalPages(data.totalPages || 1);
        } else {
          setPexelsResults((prev) => (append ? [...prev, ...data.photos] : data.photos));
          setPexelsTotalPages(data.totalPages || 1);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial search when component mounts or initialSearchTerm changes
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      setUnsplashPage(1);
      setPexelsPage(1);
      searchImages('unsplash', 1, initialSearchTerm);
      searchImages('pexels', 1, initialSearchTerm);
    }
  }, [initialSearchTerm, searchImages]);

  const handleSearch = () => {
    if (!searchTerm) return;
    setUnsplashPage(1);
    setPexelsPage(1);
    searchImages('unsplash', 1, searchTerm);
    searchImages('pexels', 1, searchTerm);
  };

  const loadMore = () => {
    if (activeTab === 'unsplash' && unsplashPage < unsplashTotalPages) {
      const nextPage = unsplashPage + 1;
      setUnsplashPage(nextPage);
      searchImages('unsplash', nextPage, searchTerm, true);
    } else if (activeTab === 'pexels' && pexelsPage < pexelsTotalPages) {
      const nextPage = pexelsPage + 1;
      setPexelsPage(nextPage);
      searchImages('pexels', nextPage, searchTerm, true);
    }
  };

  const handleSelect = (url: string) => {
    // Instead of just setting selectedImageUrl, trigger the preview step
    setPreviewImageUrl(url);
    setCurrentPosition(50); // Reset position on new selection
    setIsPreviewing(true);
    setSelectedImageUrl(null); // Clear primary selection when entering preview
  };

  const handleConfirm = () => {
    if (isPreviewing && previewImageUrl) {
      // If in preview mode, call onImageSelect with URL and position
      onImageSelect(previewImageUrl, currentPosition);
      onClose(); // Close after confirming from preview
    }
    // Remove the old logic for confirming directly from grid selection
    /* else if (selectedImageUrl) { 
      onImageSelect(selectedImageUrl, 50); // Default to 50 if confirming without preview? (Decide flow)
      onClose();
    } */
  };

  // Reset state when dialog closes - include preview state
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSearchTerm(initialSearchTerm);
        setActiveTab('unsplash');
        setUnsplashResults([]);
        setPexelsResults([]);
        setUnsplashPage(1);
        setPexelsPage(1);
        setUnsplashTotalPages(1);
        setPexelsTotalPages(1);
        setIsLoading(false);
        setError(null);
        setSelectedImageUrl(null);
        // Reset preview state
        setIsPreviewing(false);
        setPreviewImageUrl(null);
        setCurrentPosition(50);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialSearchTerm]);

  const renderResults = (results: ImageResult[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {results.map((img) => (
        <button
          key={img.id}
          className={`relative aspect-video overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${selectedImageUrl === img.url ? 'ring-2 ring-primary ring-offset-2' : ''}`}
          onClick={() => handleSelect(img.url)}
        >
          <Image
            src={img.thumbUrl}
            alt={img.description}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-xs text-white">
            <a
              href={img.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Prevent button click when clicking link
              className="hover:underline truncate"
            >
              {img.photographer}
            </a>
          </div>
        </button>
      ))}
    </div>
  );

  // Update upload handler to also trigger preview
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      // ** Placeholder for ACTUAL upload logic **
      try {
        setIsLoading(true); // Show loading indicator
        // 1. Simulate API call to upload (replace with real call)
        const uploadedUrl = await new Promise<string>(
          (resolve) => setTimeout(() => resolve(URL.createObjectURL(file)), 1500) // Simulate delay & get local blob URL
        );
        // 2. Trigger preview with the uploaded URL
        setPreviewImageUrl(uploadedUrl);
        setCurrentPosition(50);
        setIsPreviewing(true);
        setActiveTab('upload'); // Stay on upload tab or switch?
      } catch (uploadError: any) {
        setError(`Upload failed: ${uploadError.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {isPreviewing ? 'Adjust & Confirm Cover Image' : 'Select Cover Image'}
          </DialogTitle>
        </DialogHeader>

        {!isPreviewing ? (
          <div className="px-6 py-4 border-b flex gap-2 items-center">
            <Input
              placeholder="Search Unsplash or Pexels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={activeTab === 'upload'}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchTerm || activeTab === 'upload'}
              aria-label="Search images"
            >
              {isLoading && activeTab !== 'upload' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div className="px-6 pt-4 pb-2"></div>
        )}

        {error && (
          <div className="px-6 pt-2">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
          {!isPreviewing ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex flex-col flex-grow px-6 pt-4"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
                <TabsTrigger value="pexels">Pexels</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-grow h-0 pr-1">
                <TabsContent value="unsplash" className="mt-0">
                  {renderResults(unsplashResults)}
                  {unsplashPage < unsplashTotalPages && !isLoading && (
                    <div className="mt-4 flex justify-center pb-4">
                      <Button onClick={loadMore} disabled={isLoading} variant="secondary">
                        Load More
                      </Button>
                    </div>
                  )}
                  {isLoading && activeTab === 'unsplash' && (
                    <div className="flex justify-center items-center h-[100px]">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isLoading &&
                    unsplashResults.length === 0 &&
                    searchTerm &&
                    activeTab === 'unsplash' && (
                      <div className="flex justify-center items-center h-[100px]">
                        <p className="text-muted-foreground">
                          No Unsplash results for "{searchTerm}".
                        </p>
                      </div>
                    )}
                </TabsContent>
                <TabsContent value="pexels" className="mt-0">
                  {renderResults(pexelsResults)}
                  {pexelsPage < pexelsTotalPages && !isLoading && (
                    <div className="mt-4 flex justify-center pb-4">
                      <Button onClick={loadMore} disabled={isLoading} variant="secondary">
                        Load More
                      </Button>
                    </div>
                  )}
                  {isLoading && activeTab === 'pexels' && (
                    <div className="flex justify-center items-center h-[100px]">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isLoading &&
                    pexelsResults.length === 0 &&
                    searchTerm &&
                    activeTab === 'pexels' && (
                      <div className="flex justify-center items-center h-[100px]">
                        <p className="text-muted-foreground">
                          No Pexels results for "{searchTerm}".
                        </p>
                      </div>
                    )}
                </TabsContent>
                <TabsContent value="upload" className="mt-0">
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-muted rounded-md p-8 text-center">
                    {isLoading ? (
                      <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                    )}
                    <h3 className="text-lg font-semibold mb-2">Upload Your Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a file from your device.
                    </p>
                    <Button asChild disabled={isLoading}>
                      <label htmlFor="file-upload">
                        Choose File
                        <Input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileUpload}
                          accept="image/*"
                          disabled={isLoading}
                        />
                      </label>
                    </Button>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : (
            <div className="flex-grow flex flex-col p-6 space-y-4 overflow-y-auto">
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-md border bg-muted">
                {previewImageUrl && (
                  <Image
                    src={previewImageUrl}
                    alt="Cover image preview"
                    fill
                    className="object-cover"
                    style={{ objectPosition: `center ${currentPosition}%` }}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position-slider" className="text-sm">
                  Adjust Vertical Position ({currentPosition}%)
                </Label>
                <Slider
                  id="position-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[currentPosition]}
                  onValueChange={([val]) => setCurrentPosition(val)}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t mt-auto flex justify-between w-full">
          {isPreviewing ? (
            <Button variant="outline" onClick={() => setIsPreviewing(false)} disabled={isLoading}>
              Back to Select
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          )}

          <Button onClick={handleConfirm} disabled={!isPreviewing || !previewImageUrl || isLoading}>
            {isLoading && isPreviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading && isPreviewing ? 'Saving...' : 'Use This Image & Position'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
