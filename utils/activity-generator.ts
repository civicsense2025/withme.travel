import { ItineraryItem } from '@/types/itinerary';

// Categories of activities
const ACTIVITY_CATEGORIES = {
  CULTURE: [
    'museum',
    'history',
    'art',
    'gallery',
    'theater',
    'performance',
    'exhibition',
    'landmark',
    'heritage',
    'culture',
    'historical',
  ],
  NATURE: [
    'park',
    'garden',
    'trail',
    'hike',
    'mountain',
    'beach',
    'lake',
    'river',
    'forest',
    'nature',
    'outdoor',
    'landscape',
    'wildlife',
  ],
  FOOD: [
    'restaurant',
    'cafe',
    'eatery',
    'culinary',
    'food',
    'cuisine',
    'dinner',
    'lunch',
    'breakfast',
    'brunch',
    'tasting',
    'market',
  ],
  ADVENTURE: [
    'adventure',
    'sport',
    'activity',
    'rafting',
    'climbing',
    'surfing',
    'diving',
    'paragliding',
    'kayaking',
    'biking',
    'cycling',
  ],
  RELAXATION: [
    'spa',
    'relax',
    'massage',
    'wellness',
    'retreat',
    'meditation',
    'yoga',
    'hot spring',
    'thermal',
    'chill',
  ],
  SHOPPING: [
    'shop',
    'market',
    'mall',
    'boutique',
    'store',
    'shopping',
    'souvenir',
    'craft',
    'fair',
    'bazaar',
    'local goods',
  ],
  NIGHTLIFE: [
    'bar',
    'club',
    'pub',
    'lounge',
    'nightlife',
    'night',
    'cocktail',
    'entertainment',
    'music',
    'dance',
    'concert',
  ],
  TRANSPORT: [
    'tour',
    'cruise',
    'ferry',
    'train',
    'tram',
    'cable car',
    'scenic drive',
    'boat',
    'bicycle',
    'rental',
  ],
};

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'for',
  'nor',
  'on',
  'at',
  'to',
  'by',
  'of',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'should',
  'can',
  'could',
  'in',
  'into',
  'during',
  'before',
  'after',
  'above',
  'below',
  'from',
  'up',
  'down',
  'with',
  'about',
  'against',
  'between',
  'through',
  'throughout',
  'this',
  'that',
  'these',
  'those',
  'there',
  'here',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
]);

// Activity idea template formats - more specific, active phrases
const ACTIVITY_TEMPLATES: Record<string, string[]> = {
  CULTURE: [
    'Wander through {keyword} {type}',
    'Take photos at the historic {keyword} {type}',
    'Hear stories from local guides at {keyword} {type}',
    'Learn {keyword} traditions at the {type}',
    'Sketch the architecture of {keyword} {type}',
  ],
  NATURE: [
    'Hike through {keyword} {type} at sunrise',
    'Picnic overlooking the {keyword} {type}',
    'Watch wildlife at {keyword} {type}',
    'Swim in the clear waters of {keyword} {type}',
    'Photograph the sunset at {keyword} {type}',
  ],
  FOOD: [
    'Try {keyword} street food at the local {type}',
    'Sample {keyword} wine with cheese at a {type}',
    'Learn to cook {keyword} dishes at a {type}',
    'Taste {keyword} coffee at a hidden {type}',
    'Join locals for {keyword} dinner at a family {type}',
  ],
  ADVENTURE: [
    'Zip-line over the {keyword} {type}',
    'Kayak through {keyword} {type}',
    'Climb the challenging {keyword} {type}',
    'Mountain bike down {keyword} {type} trails',
    'Go paragliding over {keyword} {type}',
  ],
  RELAXATION: [
    'Soak in the {keyword} thermal {type}',
    'Practice yoga overlooking {keyword} {type}',
    'Book a traditional {keyword} {type} treatment',
    'Meditate at a peaceful {keyword} {type}',
    'Unwind with a sunset {keyword} {type} session',
  ],
  SHOPPING: [
    'Haggle for treasures at {keyword} {type}',
    'Find handmade crafts at {keyword} {type}',
    'Support local artisans at {keyword} {type}',
    'Hunt for vintage finds at {keyword} {type}',
    'Browse local spices at {keyword} {type}',
  ],
  NIGHTLIFE: [
    'Dance until dawn at a {keyword} {type}',
    'Sip craft cocktails at a rooftop {keyword} {type}',
    'Listen to live jazz at {keyword} {type}',
    'Join locals at an underground {keyword} {type}',
    'Taste local brews at a {keyword} {type}',
  ],
  TRANSPORT: [
    'Rent a vintage Vespa to explore {keyword} {type}',
    'Take a sunset sailboat tour of {keyword} {type}',
    'Cycle along the {keyword} {type} path',
    'Ride the historic tram through {keyword} {type}',
    'Hire a local guide to show you hidden {keyword} {type}',
  ],
};

// Template descriptions for activities
const DESCRIPTION_TEMPLATES: Record<string, string[]> = {
  CULTURE: [
    "Immerse yourself in {destination}'s rich culture and history.",
    'Explore the artistic treasures and historical significance of this iconic place.',
    'Discover the local heritage that makes {destination} unique.',
    "Step back in time and connect with {destination}'s fascinating past.",
    'Experience the cultural richness that defines {destination}.',
  ],
  NATURE: [
    'Connect with the natural beauty that surrounds {destination}.',
    'Escape the city and enjoy the breathtaking landscapes nearby.',
    'Take in the stunning scenery that makes {destination} special.',
    "Refresh your spirit with {destination}'s outdoor wonders.",
    'Experience the natural splendor that attracts visitors to {destination}.',
  ],
  FOOD: [
    "Savor the authentic flavors that define {destination}'s culinary scene.",
    'Treat your taste buds to the local specialties {destination} is known for.',
    'Experience the gastronomic delights that locals love in {destination}.',
    "Discover why {destination}'s food scene is a highlight for visitors.",
    'Indulge in the culinary traditions that tell the story of {destination}.',
  ],
  ADVENTURE: [
    'Get your adrenaline pumping with this exciting activity in {destination}.',
    'Challenge yourself with this thrilling adventure experience.',
    'Break out of your comfort zone with this popular {destination} activity.',
    'Create unforgettable memories with this exciting excursion.',
    'Experience {destination} from a more adventurous perspective.',
  ],
  RELAXATION: [
    'Take time to unwind and rejuvenate during your stay in {destination}.',
    'Escape the hustle and treat yourself to some well-deserved relaxation.',
    'Refresh your body and mind with this peaceful {destination} experience.',
    'Find your zen moment amid the excitement of your {destination} trip.',
    'Balance your active itinerary with this calming activity.',
  ],
  SHOPPING: [
    'Find unique treasures and souvenirs to remember your {destination} trip.',
    "Browse local crafts and goods that showcase {destination}'s character.",
    'Discover why shopping in {destination} is an experience in itself.',
    'Support local artisans and businesses while finding special mementos.',
    'Explore the markets and shops that give {destination} its distinctive flavor.',
  ],
  NIGHTLIFE: [
    'Experience {destination} after dark and see another side of the city.',
    'Join locals for an authentic evening out in {destination}.',
    "Unwind after a day of sightseeing with {destination}'s evening offerings.",
    'Discover the vibrant night scene that makes {destination} special.',
    'Create memorable evening moments during your {destination} adventure.',
  ],
  TRANSPORT: [
    'See {destination} from a different perspective with this transportation option.',
    'Cover more ground and discover hidden gems around {destination}.',
    'Enjoy the journey as much as the destinations around {destination}.',
    'Travel like a local and experience {destination} more authentically.',
    'Make getting around part of your {destination} adventure.',
  ],
};

// Activity types mapping
const ACTIVITY_TYPE_MAP: Record<string, string[]> = {
  MUSEUM: ['museum', 'gallery', 'exhibition', 'collection', 'artifact'],
  LANDMARK: [
    'landmark',
    'monument',
    'statue',
    'tower',
    'palace',
    'castle',
    'cathedral',
    'church',
    'temple',
  ],
  PARK: ['park', 'garden', 'square', 'plaza', 'green space', 'botanical'],
  BEACH: ['beach', 'coastline', 'shore', 'bay', 'oceanfront', 'seashore'],
  RESTAURANT: ['restaurant', 'dining', 'eatery', 'cafe', 'bistro', 'cuisine'],
  ADVENTURE: ['adventure', 'tour', 'excursion', 'expedition', 'quest', 'journey', 'trip'],
  SHOPPING: ['shopping', 'market', 'bazaar', 'shop', 'mall', 'boutique', 'store'],
  EVENT: ['event', 'festival', 'celebration', 'fair', 'concert', 'performance', 'show'],
};

// For consistent type mapping
type ActivityType =
  | 'MUSEUM'
  | 'LANDMARK'
  | 'PARK'
  | 'BEACH'
  | 'RESTAURANT'
  | 'ADVENTURE'
  | 'SHOPPING'
  | 'EVENT';

// Define local budget category type and values
export type BudgetCategory =
  | 'accommodation'
  | 'transportation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'other';
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  'accommodation',
  'transportation',
  'food',
  'activities',
  'shopping',
  'other',
];

/**
 * Interface for activity idea objects
 */
export interface ActivityIdea {
  title: string;
  description: string;
  category: string;
  activityType: ActivityType;
  duration: number;
  budgetCategory: BudgetCategory;
  relevanceScore: number;
}

/**
 * Extracts meaningful keywords from a text by removing stop words and extracting most frequent terms
 *
 * @param text - The text to analyze (typically a destination description)
 * @param maxKeywords - Maximum number of keywords to return
 * @returns An array of extracted keywords
 */
export function extractKeywords(text: string, maxKeywords = 15): string[] {
  if (!text) return [];

  // Convert to lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');

  // Split into words and filter out stop words and very short words
  const words = cleanText.split(/\s+/).filter((word) => {
    return word.length > 2 && !STOP_WORDS.has(word);
  });

  // Count word frequencies
  const wordFrequency: Record<string, number> = {};
  words.forEach((word) => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  // Sort by frequency
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  return sortedWords.slice(0, maxKeywords);
}

/**
 * Determines the most appropriate activity type based on keywords
 *
 * @param keywords - Array of keywords extracted from text
 * @returns The activity type that best matches the keywords
 */
function determineActivityType(keywords: string[]): ActivityType {
  const scores: Record<string, number> = {};

  // Initialize scores for each activity type
  Object.keys(ACTIVITY_TYPE_MAP).forEach((type) => {
    scores[type] = 0;
  });

  // Calculate scores based on keyword matches
  keywords.forEach((keyword) => {
    Object.entries(ACTIVITY_TYPE_MAP).forEach(([type, typeKeywords]) => {
      if (typeKeywords.some((tk) => keyword.includes(tk) || tk.includes(keyword))) {
        scores[type] += 1;
      }
    });
  });

  // Find the type with the highest score
  const entries = Object.entries(scores);
  if (entries.length === 0) return 'LANDMARK'; // Default

  const highestScore = entries.reduce((prev, current) => {
    return prev[1] > current[1] ? prev : current;
  });

  return highestScore[0] as ActivityType;
}

/**
 * Determines the activity category based on keywords
 *
 * @param keywords - Array of keywords extracted from text
 * @returns The category that best matches the keywords
 */
function determineCategory(keywords: string[]): string {
  const scores: Record<string, number> = {};

  // Initialize scores for each category
  Object.keys(ACTIVITY_CATEGORIES).forEach((category) => {
    scores[category] = 0;
  });

  // Calculate scores based on keyword matches
  keywords.forEach((keyword) => {
    Object.entries(ACTIVITY_CATEGORIES).forEach(([category, categoryKeywords]) => {
      if (categoryKeywords.some((ck) => keyword.includes(ck) || ck.includes(keyword))) {
        scores[category] += 1;
      }
    });
  });

  // Find the category with the highest score
  const entries = Object.entries(scores);
  if (entries.length === 0) return 'CULTURE'; // Default

  const highestScore = entries.reduce((prev, current) => {
    return prev[1] > current[1] ? prev : current;
  });

  return highestScore[0];
}

/**
 * Generate a budget category based on activity type and category
 */
function determineBudgetCategory(activityType: ActivityType, category: string): BudgetCategory {
  // Map certain activity types to budget categories
  const typeTobudget: Record<string, BudgetCategory> = {
    RESTAURANT: 'food',
    MUSEUM: 'activities',
    LANDMARK: 'activities',
    SHOPPING: 'shopping',
    BEACH: 'activities',
    PARK: 'activities',
    ADVENTURE: 'activities',
    EVENT: 'activities',
  };

  // Map categories to budget categories
  const categoryToBudget: Record<string, BudgetCategory> = {
    FOOD: 'food',
    SHOPPING: 'shopping',
    TRANSPORT: 'transportation',
    CULTURE: 'activities',
    NATURE: 'activities',
    ADVENTURE: 'activities',
    RELAXATION: 'activities',
    NIGHTLIFE: 'activities',
  };

  // Try to get from activity type first, then from category, or default to activities
  return typeTobudget[activityType] || categoryToBudget[category] || 'activities';
}

/**
 * Estimates a reasonable duration for an activity based on type and category
 */
function estimateDuration(activityType: ActivityType, category: string): number {
  // Durations in hours
  const typeDurations: Record<string, number> = {
    MUSEUM: 2,
    LANDMARK: 1.5,
    PARK: 2,
    BEACH: 3,
    RESTAURANT: 1.5,
    ADVENTURE: 4,
    SHOPPING: 2,
    EVENT: 3,
  };

  const categoryDurations: Record<string, number> = {
    CULTURE: 2,
    NATURE: 3,
    FOOD: 1.5,
    ADVENTURE: 3.5,
    RELAXATION: 2,
    SHOPPING: 2.5,
    NIGHTLIFE: 3,
    TRANSPORT: 1.5,
  };

  // Get duration from type, category, or default
  const duration = typeDurations[activityType] || categoryDurations[category] || 2;

  // Add some randomness (±30 minutes)
  const randomFactor = Math.random() * 0.5 - 0.25;
  return Math.max(0.5, duration + randomFactor);
}

/**
 * Generates a title for an activity based on keywords and templates
 */
function generateActivityTitle(
  category: string,
  keywords: string[],
  destinationName: string
): string {
  // Get templates for this category, or use default
  const templates = ACTIVITY_TEMPLATES[category] || ACTIVITY_TEMPLATES.CULTURE;

  // Select a random template
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Select a random keyword from our extracted list
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];

  // Define more specific, localized type words based on the category
  const getTypeWords = (cat: string) => {
    if (cat === 'CULTURE') {
      return [
        'history museum',
        'local gallery',
        'historic palace',
        'ancient ruins',
        'cultural festival',
        'traditional workshop',
      ];
    } else if (cat === 'NATURE') {
      return [
        'hidden lake',
        'mountain vista',
        'coastal trail',
        'forest reserve',
        'valley overlook',
        'secret beach',
      ];
    } else if (cat === 'FOOD') {
      return [
        'family-run bistro',
        'street food stalls',
        'cooking class',
        'food festival',
        'farmers market',
        'wine vineyard',
      ];
    } else if (cat === 'ADVENTURE') {
      return [
        'rock climbing spot',
        'white water rapids',
        'zip-line course',
        'mountain biking trail',
        'kayaking waters',
        'paragliding launch',
      ];
    } else if (cat === 'RELAXATION') {
      return [
        'thermal springs',
        'beachfront yoga class',
        'hillside meditation spot',
        'traditional massage house',
        'garden retreat',
        'forest bath',
      ];
    } else if (cat === 'SHOPPING') {
      return [
        'artisan market',
        'antique district',
        'local craft shops',
        'designer boutiques',
        'vintage stores',
        'weekend bazaar',
      ];
    } else if (cat === 'NIGHTLIFE') {
      return [
        'rooftop bar',
        'jazz club',
        'underground speakeasy',
        'beachfront lounge',
        'live music venue',
        'local brewery',
      ];
    } else if (cat === 'TRANSPORT') {
      return [
        'vintage tram',
        'canal boat',
        'scenic railway',
        'coastal ferry',
        'bicycle paths',
        'vespa tour',
      ];
    }

    return ['spot', 'place', 'location', 'area', 'site'];
  };

  const typeWords = getTypeWords(category);
  const type = typeWords[Math.floor(Math.random() * typeWords.length)];

  // Generate a specific, actionable title
  let title = template.replace('{keyword}', keyword).replace('{type}', type);

  // Sometimes add the destination name for more specificity
  if (Math.random() > 0.7) {
    title = title + ` in ${destinationName}`;
  }

  return title;
}

/**
 * Generates a description for an activity
 */
function generateActivityDescription(category: string, destinationName: string): string {
  // Get templates for this category, or use default
  const templates = DESCRIPTION_TEMPLATES[category] || DESCRIPTION_TEMPLATES.CULTURE;

  // Select a random template
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Replace destination placeholder
  return template.replace('{destination}', destinationName);
}

/**
 * Calculate relevance score based on keyword matches with template items
 */
function calculateRelevanceScore(
  keywords: string[],
  templateItems: Partial<ItineraryItem>[]
): number {
  if (!templateItems || templateItems.length === 0) return 1;

  let score = 1; // Base score

  // Extract text from template items
  const templateText = templateItems
    .map((item) => `${item.title || ''} ${item.description || ''}`)
    .join(' ')
    .toLowerCase();

  // Count keyword matches in template text
  keywords.forEach((keyword) => {
    if (templateText.includes(keyword)) {
      score += 0.5; // Increase score for each match
    }
  });

  return Math.min(10, score); // Cap at 10
}

/**
 * Generates activity ideas based on destination info and keywords
 *
 * @param destinationName - Name of the destination
 * @param keywords - Extracted keywords from destination description
 * @param templateItems - Optional template items to influence generation
 * @param count - Number of ideas to generate
 * @returns Array of activity idea objects
 */
export function generateActivityIdeas(
  destinationName: string,
  keywords: string[],
  templateItems?: Partial<ItineraryItem>[],
  count: number = 6
): ActivityIdea[] {
  const activityIdeas: ActivityIdea[] = [];

  // Generate the specified number of ideas
  for (let i = 0; i < count; i++) {
    // Determine category and activity type
    const category = determineCategory(keywords);
    const activityType = determineActivityType(keywords);

    // Generate title and description
    const title = generateActivityTitle(category, keywords, destinationName);
    const description = generateActivityDescription(category, destinationName);

    // Determine other properties
    const budgetCategory = determineBudgetCategory(activityType, category);
    const duration = estimateDuration(activityType, category);
    const relevanceScore = calculateRelevanceScore(keywords, templateItems || []);

    // Create idea object
    activityIdeas.push({
      title,
      description,
      category,
      activityType,
      duration,
      budgetCategory,
      relevanceScore,
    });
  }

  // Sort by relevance score (highest first)
  return activityIdeas.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
