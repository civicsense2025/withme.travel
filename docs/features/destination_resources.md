# Library Feature Documentation

## Overview

The Library feature aims to enrich the user's travel planning and experience by providing engaging and informative content specific to destinations. This includes various **content types** like quizzes, glossaries of local terms, regional recipes, guides, and potentially simple games. These content items can be linked to destinations, trips, and even specific itinerary items, offering contextually relevant learning and fun.

## Goals

- **Enhance Destination Discovery:** Provide users with fun and interactive ways to learn about places they are planning to visit or are interested in.
- **Increase Engagement:** Offer supplementary content beyond basic itinerary planning.
- **Improve Trip Preparedness:** Equip travelers with useful local knowledge (language, customs, food).
- **Content Hub:** Create a centralized repository (the Library) for various types of destination-related content.
- **Integration:** Seamlessly link Library content within the trip planning workflow.

## Content Types

The system is designed to support various types of content within the Library:

- **Quiz:** Test user knowledge about a destination (history, culture, geography).
- **Glossary:** Define local terms, slang, or important phrases.
- **Recipe:** Share recipes for iconic local dishes.
- **Guide:** Provide short guides, tips, or interesting facts (e.g., "Top 5 Coffee Shops", "Understanding Local Transportation").
- **Game:** (Future) Simple interactive games like matching or flashcards related to the destination.

## Database Schema Overview

The feature relies on several database tables, defined primarily in `supabase/migrations/destination_resources_schema.sql` (consider renaming this file later if desired):

1.  **`destination_resources`:** (Consider renaming to `library_items` or similar)

    - The core table linking a content item to a destination.
    - Stores common metadata: `id`, `destination_id`, `content_type` (renamed from `resource_type`), `title`, `description`, `status`, `author_id`, etc.

2.  **Content-Specific Tables:**

    - **`quiz_questions`:** Holds the text, type, and details for each question in a quiz.
    - **`quiz_answers`:** Stores the possible answers for each quiz question, indicating the correct one.
    - **`glossary_terms`:** Contains the term, definition, pronunciation, examples, etc., for glossaries.
    - **`recipes`:** Stores ingredients, instructions, timings, etc., for recipes.
    - **`guides`:** Holds the main content (e.g., Markdown) for guides.
    - _(Future tables for other content types like `games` would follow a similar pattern)_

3.  **Linking Tables:**

    - **`resource_trip_link`:** (Consider renaming) Connects specific Library content to a trip.
    - **`resource_itinerary_link`:** (Consider renaming) Connects specific Library content to an itinerary item.

4.  **Interaction Tracking:**
    - **`user_resource_interactions`:** (Consider renaming) Tracks user progress, quiz scores, completion status, etc., for each content item they engage with.

## Integration Points

- **Destination Pages:** Display available Library content (guides, quizzes, glossaries) relevant to the viewed destination.
- **Trip Dashboard/Itinerary:** Allow users (or the system automatically) to link relevant Library content to a trip or specific itinerary items.
- **User Profile:** Potentially show completed Library content or quiz high scores.

## Future Expansion Ideas

- **Gamification:** Award badges or points for completing content or achieving high quiz scores.
- **User-Generated Content:** Allow trusted users or creators to submit their own guides, recipes, or glossary terms.
- **Library Categories/Tags:** Add tagging for better organization and filtering of content.
- **Game Types:** Implement simple matching games, flashcards, or map-based challenges.
- **Difficulty Levels:** Add difficulty ratings to quizzes or games.
- **Recommendations:** Suggest relevant Library content to users based on their upcoming trips or interests.
