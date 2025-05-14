import React, { useState } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  time?: string;
  location?: string;
  color?: string;
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  initialDate?: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * CalendarView displays trip events in a monthly calendar format.
 * @example <CalendarView events={tripEvents} onEventClick={handleEventClick} />
 */
export function CalendarView({
  events = [],
  onEventClick,
  onDateClick,
  initialDate = new Date(),
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get first day of month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day));
  }

  // Get events for specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toISOString().split('T')[0] === dateString;
    });
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAYS.map((day) => (
          <div key={day} className="text-center py-2 text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {calendarDays.map((date, index) => {
          if (date === null) {
            return <div key={`empty-${index}`} className="bg-gray-50 h-20 rounded-lg"></div>;
          }

          const dayEvents = getEventsForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`relative bg-gray-50 hover:bg-gray-100 transition-colors h-20 p-1 rounded-lg overflow-y-auto ${
                isToday ? 'border-2 border-blue-500' : ''
              }`}
              onClick={() => handleDateClick(date)}
            >
              <div className={`text-right p-1 ${isToday ? 'font-bold text-blue-600' : ''}`}>
                {date.getDate()}
              </div>

              <div className="mt-1 space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      event.color
                        ? `bg-${event.color}-100 text-${event.color}-800`
                        : 'bg-blue-100 text-blue-800'
                    }`}
                    onClick={(e) => handleEventClick(event, e)}
                    title={event.title}
                  >
                    {event.time && <span className="font-semibold mr-1">{event.time}</span>}
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event tooltip */}
      {selectedEvent && (
        <div className="absolute z-10 bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <h3 className="font-bold mb-1">{selectedEvent.title}</h3>
          <p className="text-sm mb-1">
            {new Date(selectedEvent.date).toLocaleDateString()}
            {selectedEvent.time && ` · ${selectedEvent.time}`}
          </p>
          {selectedEvent.location && (
            <p className="text-sm text-gray-600">{selectedEvent.location}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarView;
