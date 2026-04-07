import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Wrench, AlertTriangle, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

const priorityConfig = {
  CRITICAL: { color: 'bg-red-500', textColor: 'text-red-700' },
  HIGH: { color: 'bg-orange-500', textColor: 'text-orange-700' },
  MEDIUM: { color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  LOW: { color: 'bg-green-500', textColor: 'text-green-700' },
};

export function MaintenanceCalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [maintenanceEvents, setMaintenanceEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceEvents();
  }, [currentDate]);

  const fetchMaintenanceEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const response = await fetch(
        `${API_BASE}/incidents/calendar?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      );

      if (response.ok) {
        const events = await response.json();
        setMaintenanceEvents(events);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance events:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];

    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return maintenanceEvents.filter(event => {
      if (!event.scheduledStart) return false;
      const eventDate = new Date(event.scheduledStart);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Maintenance Calendar</h1>
          <p className="text-gray-500 mt-1 text-sm">Scheduled maintenance and repair activities</p>
        </div>
        <button
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 border-b border-gray-200">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            const eventsForDay = getEventsForDay(day);
            const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-200 rounded-lg ${
                  isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                } ${day ? 'hover:bg-gray-50' : ''} transition-colors`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {eventsForDay.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={() => navigate(`/incidents/${event.id}`)}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                            priorityConfig[event.priority]?.color || 'bg-gray-500'
                          } text-white truncate`}
                          title={`${event.title} - ${formatTime(event.scheduledStart)} to ${formatTime(event.scheduledEnd)}`}
                        >
                          <div className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {eventsForDay.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{eventsForDay.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Upcoming Maintenance</h3>
        <div className="space-y-3">
          {maintenanceEvents
            .filter(event => new Date(event.scheduledStart) >= new Date())
            .sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart))
            .slice(0, 5)
            .map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/incidents/${event.id}`)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${priorityConfig[event.priority]?.color || 'bg-gray-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.resourceName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(event.scheduledStart).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(event.scheduledStart)} - {formatTime(event.scheduledEnd)}
                  </p>
                </div>
              </div>
            ))}
          {maintenanceEvents.filter(event => new Date(event.scheduledStart) >= new Date()).length === 0 && (
            <p className="text-gray-500 text-center py-4">No upcoming maintenance scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
}