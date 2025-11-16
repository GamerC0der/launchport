'use client';
import React, { useState, useEffect } from 'react';
import { HiMagnifyingGlass, HiXMark, HiCalendar, HiListBullet } from 'react-icons/hi2';

interface Launch {
  name: string;
  provider: string;
  vehicle: string;
  pad: { name: string; location: { name: string; state: string } };
  launch_description: string;
  formatted_date: string;
  t0: string | null;
  date: string;
}

interface ApiResponse {
  result: Launch[];
}

interface CalendarViewProps {
  launches: Launch[];
  onLaunchClick: (launch: Launch) => void;
}

function CalendarView({ launches, onLaunchClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart.setDate(monthStart.getDate() - monthStart.getDay()));
  const endDate = new Date(monthEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay())));

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(new Date(day));
    day = new Date(day.setDate(day.getDate() + 1));
  }

  const launchesByDate = launches.reduce((acc, launch) => {
    if (launch.date) {
      const timestamp = typeof launch.date === 'string' ? parseInt(launch.date) : launch.date;
      const date = new Date(timestamp * 1000);
      const dateKey = date.toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(launch);
    }
    return acc;
  }, {} as Record<string, Launch[]>);

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ‹
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateKey = date.toDateString();
          const dayLaunches = launchesByDate[dateKey] || [];
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDay = isToday(date);

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg ${
                isCurrentMonthDay
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600'
              } ${isTodayDay ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-2 ${isCurrentMonthDay ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayLaunches.slice(0, 3).map((launch, idx) => (
                  <div
                    key={idx}
                    onClick={() => onLaunchClick(launch)}
                    className="text-xs p-1 bg-blue-100 dark:bg-blue-900/50 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 truncate"
                    title={launch.name}
                  >
                    {launch.name.length > 15 ? `${launch.name.substring(0, 15)}...` : launch.name}
                  </div>
                ))}
                {dayLaunches.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{dayLaunches.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {launches.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No launches found
        </div>
      )}
    </div>
  );
}

export default function Schedule() {
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [pastLaunches, setPastLaunches] = useState<Launch[]>([]);
  const [nextLaunches, setNextLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    async function fetchLaunches() {
      try {
        const nextResponse = await fetch('/api/launches?type=next&limit=10');
        const nextData = await nextResponse.json();
        
        const processLaunches = (data: ApiResponse) => {
          return data.result.map((l: any) => {
            const processed: any = { ...l };
            if ('sort_date' in processed) {
              processed.date = processed.sort_date;
              delete processed.sort_date;
            }
            if ('date_str' in processed) {
              processed.formatted_date = processed.date_str;
              delete processed.date_str;
            }
            if (processed.provider && typeof processed.provider === 'object') {
              processed.provider = processed.provider.name || '';
            }
            if (processed.vehicle && typeof processed.vehicle === 'object') {
              processed.vehicle = processed.vehicle.name || '';
            }
            return processed;
          });
        };
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const next = processLaunches(nextData).filter((l: Launch) => {
          if (l.name.includes('EscaPADE') || l.launch_description.includes('EscaPADE')) {
            return false;
          }
          if (l.date) {
            const timestamp = typeof l.date === 'string' ? parseInt(l.date) : l.date;
            const launchDate = new Date(timestamp * 1000);
            launchDate.setHours(0, 0, 0, 0);
            return launchDate >= today;
          }
          return true;
        });
        
        setPastLaunches([]);
        setNextLaunches(next);
      } catch (error) {
        console.error('Error fetching launches:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLaunches();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLaunch) {
        setSelectedLaunch(null);
      }
    };
    
    if (selectedLaunch) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedLaunch]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading launches...</div>
      </div>
    );
  }

  const allProviders = Array.from(
    new Set(
      nextLaunches.map(l => l.provider).filter(p => p && p !== 'Unknown')
    )
  ).sort();

  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev => {
      const next = new Set(prev);
      if (next.has(provider)) {
        next.delete(provider);
      } else {
        next.add(provider);
      }
      return next;
    });
  };

  const filterLaunches = (launches: Launch[]) => {
    let filtered = launches;

    if (selectedProviders.size > 0) {
      filtered = filtered.filter(launch => 
        selectedProviders.has(launch.provider)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(launch => 
        launch.name.toLowerCase().includes(query) ||
        launch.provider.toLowerCase().includes(query) ||
        launch.vehicle.toLowerCase().includes(query) ||
        launch.pad?.location?.name?.toLowerCase().includes(query) ||
        launch.launch_description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredNextLaunches = filterLaunches(nextLaunches);

  return (
    <div className="p-8 overflow-y-auto h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Launch Schedule</h1>

      <div className="mb-6 flex justify-center">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <HiListBullet className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <HiCalendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="w-full max-w-2xl relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <HiMagnifyingGlass className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search launches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {allProviders.length > 0 && (
          <div className="w-full max-w-2xl">
            <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Company:</div>
            <div className="flex flex-wrap gap-2">
              {allProviders.map(provider => (
                <button
                  key={provider}
                  onClick={() => toggleProvider(provider)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedProviders.has(provider)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {provider}
                </button>
              ))}
              {selectedProviders.size > 0 && (
                <button
                  onClick={() => setSelectedProviders(new Set())}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {viewMode === 'list' && (
        <div className="flex flex-col items-center gap-4">
          {filteredNextLaunches.length === 0 ? (
            <div className="w-full max-w-2xl text-center py-12 text-gray-500 dark:text-gray-400">
              No launches found
            </div>
          ) : (
            filteredNextLaunches.map((launch, idx) => (
              <div key={`next-${idx}`} className="w-full max-w-2xl border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="font-semibold mb-3">{launch.formatted_date}</div>
                <div onClick={() => setSelectedLaunch(launch)} className="text-sm p-4 bg-blue-100 dark:bg-blue-900 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 min-h-[60px]">
                  <div className="font-medium text-base mb-2">{launch.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {[launch.provider, launch.vehicle].filter(v => v && v !== 'Unknown').join(' • ')}
                  </div>
                  {launch.pad?.location?.name && launch.pad.location.name !== 'Unknown' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">{launch.pad.location.name}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          launches={filteredNextLaunches}
          onLaunchClick={setSelectedLaunch}
        />
      )}
      {selectedLaunch && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200"
          onClick={() => setSelectedLaunch(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-start justify-between rounded-t-2xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white pr-4">{selectedLaunch.name}</h2>
              <button 
                onClick={() => setSelectedLaunch(null)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-6">
              {selectedLaunch.launch_description && (
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">{selectedLaunch.launch_description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedLaunch.provider && selectedLaunch.provider !== 'Unknown' && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Provider</div>
                    <div className="text-gray-900 dark:text-white font-medium">{selectedLaunch.provider}</div>
                  </div>
                )}
                
                {selectedLaunch.vehicle && selectedLaunch.vehicle !== 'Unknown' && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Vehicle</div>
                    <div className="text-gray-900 dark:text-white font-medium">{selectedLaunch.vehicle}</div>
                  </div>
                )}
                
                {selectedLaunch.pad?.name && selectedLaunch.pad.name !== 'Unknown' && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Launch Pad</div>
                    <div className="text-gray-900 dark:text-white font-medium">{selectedLaunch.pad.name}</div>
                  </div>
                )}
                
                {selectedLaunch.pad?.location?.name && selectedLaunch.pad.location.name !== 'Unknown' && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Location</div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {selectedLaunch.pad.location.name}
                      {selectedLaunch.pad.location.state && `, ${selectedLaunch.pad.location.state}`}
                    </div>
                  </div>
                )}
                
                {selectedLaunch.formatted_date && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Date</div>
                    <div className="text-gray-900 dark:text-white font-medium">{selectedLaunch.formatted_date}</div>
                  </div>
                )}
                
                {selectedLaunch.t0 && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Launch Time</div>
                    <div className="text-gray-900 dark:text-white font-medium">{new Date(selectedLaunch.t0).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}