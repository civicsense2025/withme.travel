import React from 'react';
import { WeatherForecast, WeatherDay } from './WeatherForecast';

export default {
  title: 'Features/WeatherForecast',
  component: WeatherForecast,
};

const sampleForecast: WeatherDay[] = [
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

export const Default = () => (
  <div className="max-w-2xl">
    <WeatherForecast location="Rio de Janeiro" days={sampleForecast} />
  </div>
);

export const LoadingState = () => (
  <div className="max-w-2xl">
    <WeatherForecast location="Rio de Janeiro" days={[]} isLoading={true} />
  </div>
);

export const EmptyState = () => (
  <div className="max-w-2xl">
    <WeatherForecast location="Remote Island" days={[]} />
  </div>
);

export const FahrenheitUnit = () => {
  // Convert Celsius to Fahrenheit
  const fahrenheitData = sampleForecast.map((day) => ({
    ...day,
    tempHigh: Math.round((day.tempHigh * 9) / 5 + 32),
    tempLow: Math.round((day.tempLow * 9) / 5 + 32),
  }));

  return (
    <div className="max-w-2xl">
      <WeatherForecast
        location="Rio de Janeiro"
        days={fahrenheitData}
        tempUnit="F"
        onRefresh={() => alert('Refreshing forecast...')}
      />
    </div>
  );
};

export const Light = {
  render: Default,
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  render: Default,
  parameters: { backgrounds: { default: 'dark' } },
};
