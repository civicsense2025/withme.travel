import React from 'react';
import { ItineraryPage } from './ItineraryPage';
import { Review } from './ReviewList';
import { CalendarEvent } from './CalendarView';
import { WeatherDay } from './WeatherForecast';

export default {
  title: 'Features/ItineraryPage',
  component: ItineraryPage,
  parameters: {
    layout: 'fullscreen',
  },
};

// Sample data for a Rio de Janeiro Itinerary
const sampleReviews: Review[] = [
  {
    id: '1',
    author: 'Maria C.',
    date: '2024-05-15',
    rating: 5,
    content:
      'This itinerary was perfect for our group of friends! We loved the nightlife recommendations and the beach day was incredible. Highly recommend for younger travelers.',
  },
  {
    id: '2',
    author: 'James K.',
    date: '2024-04-22',
    rating: 4,
    content:
      'Great balance of activities. The hiking suggestion was a bit strenuous but the views were worth it. Very good local restaurant picks too.',
  },
];

const sampleCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Arrival & Hotel Check-in',
    date: new Date(2024, 6, 1).toISOString(),
    time: '14:00',
    location: 'Copacabana Palace',
  },
  {
    id: '2',
    title: 'Welcome Dinner',
    date: new Date(2024, 6, 1).toISOString(),
    time: '19:00',
    location: 'Churrascaria Palace',
  },
  {
    id: '3',
    title: 'Beach Day & Surfing Lesson',
    date: new Date(2024, 6, 2).toISOString(),
    time: '09:00',
    location: 'Ipanema Beach',
  },
  {
    id: '4',
    title: 'Christ the Redeemer Visit',
    date: new Date(2024, 6, 3).toISOString(),
    time: '10:00',
    location: 'Corcovado Mountain',
  },
  {
    id: '5',
    title: 'Samba Class',
    date: new Date(2024, 6, 3).toISOString(),
    time: '19:00',
    location: 'Rio Scenarium',
  },
  {
    id: '6',
    title: 'Tijuca Forest Hike',
    date: new Date(2024, 6, 4).toISOString(),
    time: '09:00',
    location: 'Tijuca National Park',
  },
  {
    id: '7',
    title: 'Farewell Dinner',
    date: new Date(2024, 6, 5).toISOString(),
    time: '20:00',
    location: 'Aprazível Restaurant',
  },
];

const sampleWeatherForecast: WeatherDay[] = [
  {
    date: '2024-07-01',
    dayOfWeek: 'Mon',
    icon: 'sunny',
    condition: 'Sunny',
    tempHigh: 28,
    tempLow: 22,
    precipitation: 0,
  },
  {
    date: '2024-07-02',
    dayOfWeek: 'Tue',
    icon: 'partly-cloudy',
    condition: 'Partly Cloudy',
    tempHigh: 27,
    tempLow: 21,
    precipitation: 10,
  },
  {
    date: '2024-07-03',
    dayOfWeek: 'Wed',
    icon: 'cloudy',
    condition: 'Cloudy',
    tempHigh: 25,
    tempLow: 21,
    precipitation: 20,
  },
  {
    date: '2024-07-04',
    dayOfWeek: 'Thu',
    icon: 'rain',
    condition: 'Light Rain',
    tempHigh: 24,
    tempLow: 20,
    precipitation: 60,
  },
  {
    date: '2024-07-05',
    dayOfWeek: 'Fri',
    icon: 'partly-cloudy',
    condition: 'Partly Cloudy',
    tempHigh: 26,
    tempLow: 21,
    precipitation: 15,
  },
];

const sampleSimilarItineraries = [
  {
    id: '1',
    title: 'São Paulo Urban Discovery',
    description:
      "A vibrant urban adventure through Brazil's largest city with great art, food, and culture.",
    travelerCount: 4,
  },
  {
    id: '2',
    title: 'Salvador Bahia Experience',
    description: 'Explore Afro-Brazilian culture, cuisine and colonial architecture in Salvador.',
    travelerCount: 3,
  },
  {
    id: '3',
    title: 'Amazon Jungle Expedition',
    description:
      'Immerse yourself in the wonders of the Amazon rainforest with wildlife encounters.',
    travelerCount: 6,
  },
  {
    id: '4',
    title: 'Buzios Beach Getaway',
    description: 'Relax in the charming beach town once favored by Brigitte Bardot.',
    travelerCount: 2,
  },
];

export const Complete = () => (
  <ItineraryPage
    title="Rhythm & Rainforest: Rio's Vibrant Pulse"
    subtitle="Rio de Janeiro, Brazil"
    heroImageUrl="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1600&q=80"
    quickFacts={[
      { label: 'Best Time to Visit', icon: '📅', value: 'Sep-Mar' },
      { label: 'Currency', icon: '💵', value: 'Brazilian Real (BRL)' },
      { label: 'Language', icon: '🗣️', value: 'Portuguese' },
      { label: 'Visa Required', icon: '🛂', value: 'No for US/EU citizens' },
      { label: 'Recommended Days', icon: '📆', value: '4-7' },
    ]}
    highlights={[
      'Sunset cocktails at Sugarloaf Mountain with panoramic views',
      "Dancing samba in Lapa's vibrant nightlife district",
      "Hiking through the world's largest urban rainforest",
      'Learning to surf on the iconic Ipanema Beach',
      'Savoring feijoada and caipirinhas at local hotspots',
      'Experiencing the electric energy of a local football match',
      'Exploring the colorful Selarón Steps in Santa Teresa',
    ]}
    essentials={{
      pace: 'Energetic with strategic afternoon breaks to recharge',
      budget: '$150-180 USD per day',
      startTime: '09:00 AM',
      tags: ['beaches', 'nightlife', 'nature', 'culture', 'food'],
      languages: ['Portuguese', 'English in tourist areas'],
    }}
    creatorInfo={{
      name: 'Marina Santos',
      avatarUrl: 'https://randomuser.me/api/portraits/women/23.jpg',
      tagline: 'Born and raised in Rio, professional travel planner',
      description:
        'As a native Carioca with 15+ years in tourism, I create authentic experiences that showcase both the iconic landmarks and hidden gems of my beloved city. My itineraries balance the energy of Rio with the relaxed beach culture that defines our way of life.',
    }}
    reviews={sampleReviews}
    similarItineraries={sampleSimilarItineraries}
    calendarEvents={sampleCalendarEvents}
    weatherForecast={{
      location: 'Rio de Janeiro',
      days: sampleWeatherForecast,
    }}
    isSaved={false}
    onUseTemplate={() => alert('Using template')}
    onShare={() => alert('Sharing template')}
    onSave={() => alert('Saving template')}
    onItineraryClick={(id) => alert(`Clicked itinerary ${id}`)}
  />
);

export const Minimal = () => (
  <ItineraryPage
    title="Weekend in Rio"
    heroImageUrl="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1600&q=80"
    quickFacts={[
      { label: 'Best Time', value: 'Year-round' },
      { label: 'Budget', value: '$150/day' },
    ]}
    highlights={[
      'Visit Christ the Redeemer',
      'Relax on Copacabana Beach',
      'Enjoy Brazilian cuisine',
    ]}
    essentials={{
      pace: 'Relaxed',
      budget: '$150 USD per day',
      startTime: '10:00 AM',
    }}
    onUseTemplate={() => alert('Using template')}
  />
);
