import React from 'react';
import { QuickFactsCard, QuickFact } from './QuickFactsCard';

export default {
  title: 'Features/QuickFactsCard',
  component: QuickFactsCard,
};

const facts: QuickFact[] = [
  {
    label: 'Best Time to Visit',
    icon: (
      <span role="img" aria-label="calendar">
        📅
      </span>
    ),
    value: 'Summer',
  },
  {
    label: 'Local Language',
    icon: (
      <span role="img" aria-label="globe">
        🌐
      </span>
    ),
    value: 'French/English',
  },
  {
    label: 'Daily Budget (USD)',
    icon: (
      <span role="img" aria-label="money">
        💵
      </span>
    ),
    value: '$120',
  },
];

export const Default = () => <QuickFactsCard facts={facts} />;

export const NoIcons = () => (
  <QuickFactsCard facts={facts.map((f) => ({ ...f, icon: undefined }))} />
);

export const EmptyFacts = () => <QuickFactsCard facts={[]} />;

export const Light = {
  render: Default,
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  render: Default,
  parameters: { backgrounds: { default: 'dark' } },
};
