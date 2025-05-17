/**
 * FAQ component (organism)
 * Full-featured FAQ component with filtering, structured data, and different layout options.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FaqEntry, FaqLayout } from '@/types/faq';
import { FAQList } from '@/components/faq/molecules/FAQList';
import { FAQFilter } from '@/components/faq/molecules/FAQFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FAQProps {
  /** Array of FAQ entries to display */
  items: FaqEntry[];
  /** Optional title for the FAQ section */
  title?: string;
  /** Layout variant for the FAQ */
  layout?: FaqLayout;
  /** Whether to show the filter interface */
  showFilter?: boolean;
  /** Whether to show the search input in the filter */
  showSearch?: boolean;
  /** Whether to enable HTML in answers */
  allowHtml?: boolean;
  /** Schema.org structured data for SEO */
  structuredData?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional static description text */
  description?: string;
}

export function FAQ({
  items,
  title = 'Frequently Asked Questions',
  layout = 'default',
  showFilter = true,
  showSearch = true,
  allowHtml = true,
  structuredData = true,
  className,
  description
}: FAQProps) {
  // Extract all unique tags from items
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [items]);

  // State for filters
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered items based on search and tags
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filter by search
      const matchesSearch = !searchQuery || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by tags
      const matchesTags = selectedTags.length === 0 || 
        (item.tags && item.tags.some(tag => selectedTags.includes(tag)));
      
      return matchesSearch && matchesTags;
    });
  }, [items, searchQuery, selectedTags]);

  // Reset filters when items change
  useEffect(() => {
    setSelectedTags([]);
    setSearchQuery('');
  }, [items]);

  // Layout-specific container classes
  const containerClasses = {
    default: "space-y-6",
    sidebar: "md:grid md:grid-cols-3 md:gap-6",
    inline: "space-y-6",
    grid: "space-y-6",
    compact: "space-y-4"
  };

  // Layout-specific list container classes
  const listContainerClasses = {
    default: "",
    sidebar: "md:col-span-2",
    inline: "",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
    compact: ""
  };

  // Generate structured data for SEO if enabled
  const structuredDataScript = structuredData ? getStructuredData(items, title) : null;

  return (
    <div className={cn(containerClasses[layout], className)}>
      {/* For SEO - Structured Data */}
      {structuredDataScript}
      
      {/* Title and Filter Section */}
      <div className={layout === 'sidebar' ? 'md:col-span-1' : ''}>
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {description && <p className="text-muted-foreground mt-2">{description}</p>}
          </div>
        )}
        
        {showFilter && allTags.length > 0 && (
          <div className="mb-6">
            <FAQFilter
              tags={allTags}
              selectedTags={selectedTags}
              searchQuery={searchQuery}
              onTagsChange={setSelectedTags}
              onSearchChange={setSearchQuery}
              showSearch={showSearch}
            />
          </div>
        )}
      </div>
      
      {/* FAQ Items - Different layouts */}
      <div className={listContainerClasses[layout]}>
        {layout === 'grid' ? (
          // Grid layout - items in cards
          filteredItems.map((item, index) => (
            <Card key={item.id || index}>
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={cn(
                    "prose prose-sm dark:prose-invert prose-p:text-muted-foreground prose-a:text-primary"
                  )}
                >
                  {allowHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                  ) : (
                    <p className="text-muted-foreground">{item.answer}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Regular accordion list
          <FAQList 
            items={filteredItems}
            allowHtml={allowHtml}
            className={cn(
              layout === 'compact' && 'space-y-0',
            )}
            itemClassName={cn(
              layout === 'compact' && 'py-2',
            )}
          />
        )}
      </div>
    </div>
  );
}

// Helper function to generate structured data for SEO
function getStructuredData(items: FaqEntry[], title: string) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        // Strip HTML for structured data
        "text": item.answer.replace(/<[^>]*>?/gm, '')
      }
    }))
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 