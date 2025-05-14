import React from 'react';
import { ReviewList, Review } from './ReviewList';

export default {
  title: 'Features/ReviewList',
  component: ReviewList,
};

const reviews: Review[] = [
  {
    id: '1',
    author: 'Alice',
    date: '2024-06-01',
    rating: 5,
    content: 'Amazing trip! The food and nightlife were unforgettable.',
  },
  {
    id: '2',
    author: 'Bob',
    date: '2024-05-20',
    rating: 4,
    content: 'Loved the beaches and local culture. Would visit again.',
  },
];

export const Default = () => <ReviewList reviews={reviews} />;

export const Empty = () => <ReviewList reviews={[]} emptyMessage="No reviews found for Montreal" />;

export const WithHandlers = () => (
  <ReviewList
    reviews={reviews}
    onFilter={() => alert('Filter clicked')}
    onSort={() => alert('Sort clicked')}
  />
);

export const LightMode = () => <ReviewList reviews={reviews} />;
LightMode.parameters = {
  backgrounds: { default: 'light' },
  docs: { description: { story: 'ReviewList in light mode.' } },
};

export const DarkMode = () => <ReviewList reviews={reviews} />;
DarkMode.parameters = {
  backgrounds: { default: 'dark' },
  docs: { description: { story: 'ReviewList in dark mode.' } },
};
