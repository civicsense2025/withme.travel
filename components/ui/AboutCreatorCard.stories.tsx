import React from 'react';
import { AboutCreatorCard } from './AboutCreatorCard';

export default {
  title: 'Features/AboutCreatorCard',
  component: AboutCreatorCard,
};

export const Default = () => (
  <AboutCreatorCard
    name="Local Travel Expert"
    tagline="Creating exceptional itineraries since 2020"
    description="This local expert creates personalized travel experiences based on extensive research and personal visits to each destination."
    ctaLabel="Support Creator"
    onCtaClick={() => alert('Support clicked!')}
  />
);

export const WithAvatar = () => (
  <AboutCreatorCard
    name="Jane Doe"
    avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
    tagline="Award-winning travel planner"
    description="Jane has crafted over 100 unique itineraries for travelers worldwide."
    ctaLabel="Contact Jane"
    onCtaClick={() => alert('Contact Jane!')}
  />
);

export const NoCTA = () => (
  <AboutCreatorCard
    name="Anonymous"
    description="A mysterious creator with a passion for travel."
  />
);

export const Light = {
  render: Default,
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  render: Default,
  parameters: { backgrounds: { default: 'dark' } },
};
