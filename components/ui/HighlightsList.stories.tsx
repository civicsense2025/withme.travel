import React from 'react';
import { HighlightsList } from './HighlightsList';

export default {
  title: 'Features/HighlightsList',
  component: HighlightsList,
};

const highlights = [
  'Sunset cocktails at Bar Urca with Sugarloaf views',
  "Dancing samba in Lapa's vibrant nightlife district",
  "Hiking through the world's largest urban rainforest",
  'Authentic Brazilian seafood feast in Copacabana',
  'Beach lounging with caipirinhas on Ipanema',
];

export const Default = () => <HighlightsList highlights={highlights} />;

export const Empty = () => <HighlightsList highlights={[]} />;

export const CustomTitle = () => <HighlightsList highlights={highlights} title="Trip Highlights" />;

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
