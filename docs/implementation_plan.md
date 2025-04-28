# Implementation Plan: Content Sharing & Personalization

## Overview

This document outlines a phased approach to implementing the withme.travel content sharing and personalization system. The implementation is divided into 5 sequential migrations, each building on the previous ones.

## Migration Sequence

### 1. Core Schema Updates

**File:** `migrations/20250610_01_core_schema.sql`

**Purpose:** Establish the foundation for content layering and personalization.

**Key Components:**
- Add content layering columns to itinerary_items (original_description, personal_notes)
- Add content attribution fields (source_item_id, original_creator_id, attribution_text)
- Add basic quality metrics (quality_tier, quality_score, popularity_score)
- Create item_customizations table for personal modifications

**Benefits:**
- Enables tracking content origins
- Separates core content from personal customizations
- Provides foundation for quality tracking

### 2. SEO Implementation

**File:** `migrations/20250610_02_seo.sql`

**Purpose:** Implement SEO best practices and canonical URL management.

**Key Components:**
- Add content_type and url_format enums
- Add SEO fields (canonical_id, canonical_url, public_slug, meta_title, meta_description)
- Add slug generation function
- Create URL path computation

**Benefits:**
- Establishes proper SEO infrastructure
- Ensures canonical references for shared content
- Enables SEO-friendly URL generation

### 3. User Preferences System

**File:** `migrations/20250610_03_preferences.sql`

**Purpose:** Store and utilize user preferences for personalization.

**Key Components:**
- Create user_preferences table
- Add travel style settings (pace, timing, preferred categories)
- Add preference weighting factors
- Implement match scoring function

**Benefits:**
- Enables personalized content matching
- Supports different travel styles
- Allows preference-based sorting and filtering

### 4. Content Sharing Functions

**File:** `migrations/20250610_04_sharing.sql`

**Purpose:** Implement the ability to copy and customize content.

**Key Components:**
- Create copy_itinerary_items function
- Handle day/date adjustments
- Maintain attribution chain
- Update popularity metrics

**Benefits:**
- Enables partial copying of itineraries
- Maintains proper attribution
- Preserves canonical references
- Tracks content popularity

### 5. Random Itinerary Generation

**File:** `migrations/20250610_05_generation.sql`

**Purpose:** Generate personalized random itineraries based on preferences.

**Key Components:**
- Implement generate_random_itinerary function
- Add day structuring logic
- Incorporate personalized scoring
- Balance activity types and timing

**Benefits:**
- Creates complete itineraries with minimal effort
- Offers personalized suggestions
- Maintains logical day structure
- Includes high-quality, relevant content

## Implementation Strategy

1. **Deploy Sequentially**: Deploy each migration separately, with testing between each step.

2. **Data Validation**: After each migration, validate existing data remains intact.

3. **Feature Activation**: Enable frontend features as their supporting migrations are deployed.

4. **Performance Monitoring**: Monitor query performance and add indexes as needed.

## API Integration Examples

### Content Sharing:
```typescript
// API endpoint for copying items
app.post('/api/trips/:destinationTripId/copy-items', async (req, res) => {
  const { sourceTrip, itemIds, targetDay, preserveDates } = req.body;
  const userId = req.user.id;
  
  const copiedItems = await supabase.rpc('copy_itinerary_items', {
    source_trip_id: sourceTrip,
    destination_trip_id: req.params.destinationTripId,
    user_id: userId,
    item_ids: itemIds,
    target_start_day: targetDay,
    preserve_dates: preserveDates
  });
  
  return res.json(copiedItems);
});
```

### Random Generation:
```typescript
// API endpoint for random itineraries
app.post('/api/destinations/:destinationId/random-itinerary', async (req, res) => {
  const { days, settings } = req.body;
  const userId = req.user.id;
  
  const itinerary = await supabase.rpc('generate_random_itinerary', {
    destination_id: req.params.destinationId,
    user_id: userId,
    num_days: days,
    settings: settings
  });
  
  return res.json(itinerary);
});
```

## Next Steps

After implementing these migrations, consider:

1. Implementing a recommendation engine that suggests related activities
2. Adding automatic template generation from popular trips
3. Developing social sharing features for public trips

