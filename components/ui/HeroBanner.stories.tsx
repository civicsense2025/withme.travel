import React from 'react';
import { HeroBanner } from './HeroBanner';

export default {
  title: 'Product Marketing/HeroBanner',
  component: HeroBanner,
};

export const Default = () => (
  <HeroBanner
    imageUrl="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    title="Rhythm & Rainforest: Rio's Vibrant Pulse"
    subtitle="Rio de Janeiro, Brazil"
    meta={
      <>
        <span>🕒 5 days</span>
        <span>👀 39 views</span>
      </>
    }
  />
);

export const NoSubtitle = () => (
  <HeroBanner
    imageUrl="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    title="Just the Title"
  />
);

export const ImageFallback = () => (
  <HeroBanner
    imageUrl="/broken-link.jpg"
    title="Fallback Example"
    subtitle="No image found"
    meta={<span>0 days</span>}
  />
);

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
