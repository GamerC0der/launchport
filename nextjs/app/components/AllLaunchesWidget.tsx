'use client';

import { useEffect, useState } from 'react';

interface Launch {
  name: string;
  provider: string;
  vehicle: string;
  formatted_date: string;
}

export default function AllLaunchesWidget() {
  const [nextLaunches, setNextLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaunches() {
      try {
        const res = await fetch('/api/launches?type=next&limit=5');
        const data = await res.json();
        setNextLaunches(data.result || []);
      } catch (error) {
        console.error('Error fetching launches:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLaunches();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 w-[288px]">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 w-[288px]">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upcoming Launches</h3>
      <div className="space-y-3">
        {nextLaunches.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm">No upcoming launches</div>
        ) : (
          nextLaunches.map((launch, idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
              <div className="font-medium text-sm text-gray-900 dark:text-white">{launch.name || 'Unknown'}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {launch.formatted_date && launch.formatted_date !== 'Unknown' && launch.formatted_date}
                {(launch.provider && launch.provider !== 'Unknown') || (launch.vehicle && launch.vehicle !== 'Unknown') ? ' • ' : ''}
                {[launch.provider, launch.vehicle].filter(v => v && v !== 'Unknown').join(' • ')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

