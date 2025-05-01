import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Itineraries',
  description: 'Explore travel itineraries shared by the community.',
};

export default function ItinerariesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
