/**
 * ImageSearchSelector Component
 * 
 * This component allows users to search for and select images.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, Image, Upload } from 'lucide-react';

interface ImageResult {
  id: string;
  url: string;
  thumbnail?: string;
  alt?: string;
  width?: number;
  height?: number;
  source?: string;
  author?: string;
}

export interface ImageSearchSelectorProps {
  onSelect?: (image: ImageResult) => void;
  initialValue?: string;
  className?: string;
  placeholder?: string;
  sources?: ('unsplash' | 'pexels' | 'upload')[];
}

export function ImageSearchSelector({
  onSelect,
  initialValue = '',
  className,
  placeholder = 'Search for images...',
  sources = ['unsplash', 'pexels', 'upload'],
}: ImageSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  const [activeSource, setActiveSource] = useState<string>(sources[0] || 'unsplash');

  // For demo purposes, generate some fake results
  const mockSearch = (term: string, source: string) => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Generate fake results
      const fakeResults: ImageResult[] = Array.from({ length: 8 }, (_, i) => ({
        id: `${source}-${i}`,
        url: `https://source.unsplash.com/random/800x600?${term}&sig=${i}`,
        thumbnail: `https://source.unsplash.com/random/200x150?${term}&sig=${i}`,
        alt: `${term} image ${i}`,
        width: 800,
        height: 600,
        source: source,
        author: `Author ${i}`,
      }));
      
      setResults(fakeResults);
      setLoading(false);
    }, 800);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      mockSearch(searchTerm, activeSource);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (image: ImageResult) => {
    setSelectedImage(image);
    onSelect?.(image);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setSearchTerm('');
    setResults([]);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a fake image result from the uploaded file
    const fileUrl = URL.createObjectURL(file);
    const uploadedImage: ImageResult = {
      id: `upload-${Date.now()}`,
      url: fileUrl,
      thumbnail: fileUrl,
      alt: file.name,
      source: 'upload',
    };

    setResults([uploadedImage, ...results]);
    handleSelect(uploadedImage);
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Source selector */}
      <div className="flex space-x-2 border-b pb-2">
        {sources.map((source) => (
          <button
            key={source}
            type="button"
            className={cn(
              'px-3 py-1 rounded-md text-sm capitalize',
              activeSource === source 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            )}
            onClick={() => setActiveSource(source)}
          >
            {source}
          </button>
        ))}
      </div>

      {/* Search input */}
      {activeSource !== 'upload' && (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-10 py-2 border rounded-md"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-2.5"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Upload input */}
      {activeSource === 'upload' && (
        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop an image, or click to browse
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer"
          >
            Select Image
          </label>
        </div>
      )}

      {/* Search button */}
      {activeSource !== 'upload' && (
        <button
          type="button"
          onClick={handleSearch}
          disabled={!searchTerm.trim() || loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {results.map((image) => (
            <div
              key={image.id}
              className={cn(
                'relative rounded-md overflow-hidden cursor-pointer aspect-video',
                selectedImage?.id === image.id && 'ring-2 ring-primary'
              )}
              onClick={() => handleSelect(image)}
            >
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              <img
                src={image.thumbnail || image.url}
                alt={image.alt || 'Image'}
                className="w-full h-full object-cover"
              />
              {selectedImage?.id === image.id && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary/30">
                  <div className="bg-white rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected image */}
      {selectedImage && (
        <div className="mt-4 p-4 border rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Selected Image</h3>
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-destructive"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-md overflow-hidden mr-3">
              <img
                src={selectedImage.thumbnail || selectedImage.url}
                alt={selectedImage.alt || 'Selected image'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm">
              {selectedImage.source && (
                <p className="text-muted-foreground capitalize">
                  Source: {selectedImage.source}
                </p>
              )}
              {selectedImage.author && (
                <p className="text-muted-foreground">By: {selectedImage.author}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 