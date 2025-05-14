import React from 'react';

export interface WeatherDay {
  date: string; // ISO date string
  dayOfWeek: string;
  icon: string;
  condition: string;
  tempHigh: number;
  tempLow: number;
  precipitation: number; // Probability in percentage
}

export interface WeatherForecastProps {
  location: string;
  days: WeatherDay[];
  tempUnit?: 'C' | 'F';
  isLoading?: boolean;
  onRefresh?: () => void;
}

/**
 * WeatherForecast displays a 5-day weather forecast for a destination.
 * @example <WeatherForecast location="Rio de Janeiro" days={forecastData} tempUnit="C" />
 */
export function WeatherForecast({
  location,
  days = [],
  tempUnit = 'C',
  isLoading = false,
  onRefresh,
}: WeatherForecastProps) {
  // Weather condition icons mapping
  const weatherIcons: Record<string, string> = {
    clear: '☀️',
    sunny: '☀️',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    overcast: '☁️',
    rain: '🌧️',
    showers: '🌦️',
    thunderstorm: '⛈️',
    snow: '❄️',
    fog: '🌫️',
    wind: '💨',
    default: '🌡️',
  };

  // Get the appropriate icon for a weather condition
  const getWeatherIcon = (condition: string): string => {
    const normalizedCondition = condition.toLowerCase();

    // Try to match the condition with our icons
    for (const [key, icon] of Object.entries(weatherIcons)) {
      if (normalizedCondition.includes(key)) {
        return icon;
      }
    }

    // Return default icon if no match found
    return weatherIcons.default;
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">{location} Weather</h2>
          <p className="text-sm text-gray-600">5-day forecast</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
            aria-label="Refresh forecast"
          >
            🔄
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : days.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No weather data available for this location.
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg p-2 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">{day.dayOfWeek}</div>
              <div className="text-2xl my-2">{getWeatherIcon(day.icon || day.condition)}</div>
              <div className="text-sm">{day.condition}</div>
              <div className="flex gap-2 mt-1">
                <span className="font-medium text-sm">
                  {day.tempHigh}°{tempUnit}
                </span>
                <span className="text-gray-500 text-sm">
                  {day.tempLow}°{tempUnit}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {day.precipitation > 0 ? `${day.precipitation}% precip.` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeatherForecast;
