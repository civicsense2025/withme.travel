import React from 'react';
import { EssentialsSection } from './EssentialsSection';

export default {
  title: 'Features/EssentialsSection',
  component: EssentialsSection,
};

export const Default = () => (
  <EssentialsSection
    pace="Energetic with strategic afternoon breaks to recharge"
    budget="$180 USD per day"
    startTime="08:30 AM"
    tags={['nightlife', 'beaches', 'gastronomy', 'nature', 'samba']}
    languages={['Portuguese', 'English in tourist areas']}
  />
);

export const NoTags = () => (
  <EssentialsSection
    pace="Relaxed"
    budget="$100 USD per day"
    startTime="09:00 AM"
    tags={[]}
    languages={['French']}
  />
);

export const NoLanguages = () => (
  <EssentialsSection
    pace="Fast-paced"
    budget="$200 USD per day"
    startTime="07:00 AM"
    tags={['adventure', 'culture']}
    languages={[]}
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
