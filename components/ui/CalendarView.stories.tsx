import React from 'react';
import { CalendarView, CalendarEvent } from './CalendarView';

export default {
  title: 'Features/CalendarView',
  component: CalendarView,
};

// Sample events for the current month
const getCurrentMonthEvents = (): CalendarEvent[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Create 10 sample events spread throughout the current month
  return [
    {
      id: '1',
      title: 'Dinner at Restaurant',
      date: new Date(year, month, 5).toISOString(),
      time: '19:00',
      location: 'La Trattoria',
      color: 'green',
    },
    {
      id: '2',
      title: 'Beach Day',
      date: new Date(year, month, 8).toISOString(),
      time: '10:00',
      location: 'Copacabana Beach',
      color: 'blue',
    },
    {
      id: '3',
      title: 'City Tour',
      date: new Date(year, month, 8).toISOString(),
      time: '14:30',
      location: 'Downtown',
      color: 'purple',
    },
    {
      id: '4',
      title: 'Museum Visit',
      date: new Date(year, month, 12).toISOString(),
      time: '11:00',
      location: 'Modern Art Museum',
      color: 'yellow',
    },
    {
      id: '5',
      title: 'Hiking Trip',
      date: new Date(year, month, 15).toISOString(),
      time: '08:00',
      location: 'Tijuca Forest',
      color: 'green',
    },
    {
      id: '6',
      title: 'Sunset Cruise',
      date: new Date(year, month, 18).toISOString(),
      time: '17:30',
      location: 'Guanabara Bay',
      color: 'orange',
    },
    {
      id: '7',
      title: 'Local Market',
      date: new Date(year, month, 20).toISOString(),
      time: '09:00',
      location: 'Farmers Market',
      color: 'red',
    },
    {
      id: '8',
      title: 'Dance Class',
      date: new Date(year, month, 22).toISOString(),
      time: '18:00',
      location: 'Samba School',
      color: 'pink',
    },
    {
      id: '9',
      title: 'Farewell Dinner',
      date: new Date(year, month, 25).toISOString(),
      time: '20:00',
      location: 'Beachfront Restaurant',
      color: 'blue',
    },
    {
      id: '10',
      title: 'Airport Transfer',
      date: new Date(year, month, 26).toISOString(),
      time: '10:30',
      location: 'Hotel to Airport',
      color: 'gray',
    },
  ];
};

export const Default = () => (
  <div className="max-w-4xl">
    <CalendarView events={getCurrentMonthEvents()} />
  </div>
);

export const EmptyCalendar = () => (
  <div className="max-w-4xl">
    <CalendarView events={[]} />
  </div>
);

export const Interactive = () => {
  const handleEventClick = (event: CalendarEvent) => {
    alert(`Event clicked: ${event.title} at ${event.location}`);
  };

  const handleDateClick = (date: Date) => {
    alert(`Date clicked: ${date.toLocaleDateString()}`);
  };

  return (
    <div className="max-w-4xl">
      <CalendarView
        events={getCurrentMonthEvents()}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
      />
    </div>
  );
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
