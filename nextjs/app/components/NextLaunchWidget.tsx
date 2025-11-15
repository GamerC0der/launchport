'use client';

import { useEffect, useState } from 'react';

interface Launch {
  name: string;
  provider: string;
  vehicle: string;
  pad: { location: { name: string } };
  formatted_date: string;
}

export default function NextLaunchWidget() {
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaunch() {
      try {
        const res = await fetch('/api/launches?type=next&limit=1');
        const data = await res.json();
        setLaunch(data.result?.[0] || null);
      } catch (error) {
        console.error('Error fetching launch:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLaunch();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Next Launch</h3>
        <div className="text-gray-500 dark:text-gray-400">No upcoming launches</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Next Launch</h3>
      {launch.name && launch.name !== 'Unknown' && (
        <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{launch.name}</h4>
      )}
      <div className="space-y-1 text-gray-700 dark:text-gray-300">
        {launch.provider && launch.provider !== 'Unknown' && launch.vehicle && launch.vehicle !== 'Unknown' && (
          <p className="text-sm">{launch.provider} • {launch.vehicle}</p>
        )}
        {launch.provider && launch.provider !== 'Unknown' && (!launch.vehicle || launch.vehicle === 'Unknown') && (
          <p className="text-sm">{launch.provider}</p>
        )}
        {(!launch.provider || launch.provider === 'Unknown') && launch.vehicle && launch.vehicle !== 'Unknown' && (
          <p className="text-sm">{launch.vehicle}</p>
        )}
        {launch.formatted_date && launch.formatted_date !== 'Unknown' && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{launch.formatted_date}</p>
        )}
        {launch.pad?.location?.name && launch.pad.location.name !== 'Unknown' && (
          <p className="text-xs text-gray-500 dark:text-gray-500">{launch.pad.location.name}</p>
        )}
      </div>
    </div>
  );
}