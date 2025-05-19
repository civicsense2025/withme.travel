/**
 * Destinations FAQ variant
 * Customized FAQ for destination pages, including travel-specific questions.
 */
import React from 'react';
import { FAQ } from '../organisms/FAQ';
import { FaqEntry, FaqLayout } from '@/types/faq';

// Sample data for destinations FAQ
const destinationsFaqs: FaqEntry[] = [
  {
    id: 'dest-1',
    question: 'What is the best time of year to visit popular destinations?',
    answer: `
      <p>The ideal time to visit depends on the destination:</p>
      <ul>
        <li><strong>European cities:</strong> Spring (April-June) and fall (September-October) offer pleasant weather and fewer crowds.</li>
        <li><strong>Southeast Asia:</strong> November to February provides dry and cool conditions in most countries.</li>
        <li><strong>Caribbean:</strong> December to April is the dry season with ideal beach weather.</li>
        <li><strong>Japan:</strong> Cherry blossom season (late March to early April) and fall foliage (November) are particularly beautiful.</li>
      </ul>
      <p>Check specific destination guides for more detailed seasonal information.</p>
    `,
    tags: ['Planning', 'Weather']
  },
  {
    id: 'dest-2',
    question: 'How do I find the best flight deals to international destinations?',
    answer: `
      <p>To find the best flight deals:</p>
      <ol>
        <li>Book 2-3 months in advance for international flights</li>
        <li>Use flight comparison tools like Google Flights, Skyscanner, or Kayak</li>
        <li>Set price alerts for your desired routes</li>
        <li>Be flexible with dates if possible - midweek flights are often cheaper</li>
        <li>Consider nearby airports as alternatives</li>
        <li>Use airline miles or credit card points when advantageous</li>
      </ol>
      <p>For seasonal destinations, booking even further ahead (4-6 months) may be necessary.</p>
    `,
    tags: ['Planning', 'Flights', 'Budget']
  },
  {
    id: 'dest-3',
    question: 'Do I need travel insurance for international trips?',
    answer: `
      <p>While not always mandatory, travel insurance is highly recommended for international trips. Good travel insurance should cover:</p>
      <ul>
        <li>Emergency medical expenses and evacuation</li>
        <li>Trip cancellation or interruption</li>
        <li>Lost, damaged, or delayed baggage</li>
        <li>Travel delays</li>
      </ul>
      <p>Some countries may require proof of travel insurance for entry. Credit cards sometimes offer limited travel protection, but standalone policies typically provide more comprehensive coverage.</p>
    `,
    tags: ['Planning', 'Safety']
  },
  {
    id: 'dest-4',
    question: 'How can I save destinations to my account for future planning?',
    answer: `
      <p>Saving destinations for future planning is easy:</p>
      <ol>
        <li>Click the heart/bookmark icon on any destination card or page</li>
        <li>Access your saved destinations from your profile dashboard</li>
        <li>Organize destinations into collections for different trip ideas</li>
        <li>Share your saved destinations with friends to plan together</li>
      </ol>
      <p>You can also add notes to saved destinations to remember why you were interested in them.</p>
    `,
    tags: ['Platform', 'Organization']
  },
  {
    id: 'dest-5',
    question: 'What should I pack for different types of destinations?',
    answer: `
      <p>While packing needs vary by destination, here are some essentials by destination type:</p>
      <p><strong>Beach destinations:</strong></p>
      <ul>
        <li>Swimwear, sunscreen, hat, sunglasses</li>
        <li>Light, breathable clothing</li>
        <li>Insect repellent</li>
        <li>Waterproof phone case</li>
      </ul>
      <p><strong>Urban destinations:</strong></p>
      <ul>
        <li>Comfortable walking shoes</li>
        <li>Versatile, layerable clothing</li>
        <li>Day bag with anti-theft features</li>
        <li>Portable charger</li>
      </ul>
      <p><strong>Cold weather destinations:</strong></p>
      <ul>
        <li>Insulated jacket, thermal layers</li>
        <li>Waterproof boots, warm socks</li>
        <li>Hat, gloves, scarf</li>
        <li>Lip balm and moisturizer</li>
      </ul>
      <p>Always check weather forecasts before your trip and adjust accordingly.</p>
    `,
    tags: ['Preparation', 'Packing']
  }
];

export interface DestinationsFAQProps {
  /** Custom items to merge with default destination FAQs */
  customItems?: FaqEntry[];
  /** Whether to merge custom items or replace entirely */
  replaceDefault?: boolean;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Whether to show filters */
  showFilter?: boolean;
  /** Layout variant */
  layout?: FaqLayout;
  /** Additional CSS class */
  className?: string;
}

export function DestinationsFAQ({
  customItems,
  replaceDefault = false,
  title = 'Destinations FAQ',
  description = 'Find answers to common questions about planning trips to various destinations.',
  showFilter = true,
  layout = 'sidebar',
  className
}: DestinationsFAQProps) {
  // Combine default and custom items if provided
  const items = replaceDefault ? 
    (customItems || []) : 
    [...destinationsFaqs, ...(customItems || [])];
  
  return (
    <FAQ
      items={items}
      title={title}
      description={description}
      layout={layout}
      showFilter={showFilter}
      className={className}
      structuredData={true}
    />
  );
}