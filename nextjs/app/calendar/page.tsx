'use client';
import { useState, useEffect } from 'react';

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

export default function Calendar() {
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [pastLaunches, setPastLaunches] = useState<Launch[]>([]);
  const [nextLaunches, setNextLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaunches() {
      try {
        const [nextResponse, pastResponse] = await Promise.all([
          fetch('/api/launches?type=next&limit=10'),
          fetch('/api/launches?type=past&limit=10')
        ]);
        
        const [nextData, pastData] = await Promise.all([
          nextResponse.json(),
          pastResponse.json()
        ]);
        
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
        
        const past = processLaunches(pastData).reverse().filter(
          (l: Launch) => !l.name.includes('EscaPADE') && !l.launch_description.includes('EscaPADE')
        );
        const next = processLaunches(nextData).filter(
          (l: Launch) => !l.name.includes('EscaPADE') && !l.launch_description.includes('EscaPADE')
        );
        setPastLaunches(past);
        setNextLaunches(next);
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
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading launches...</div>
      </div>
    );
  }

  return (
    <div className="p-8 overflow-y-auto h-screen">
      <h1 className="text-3xl font-bold mb-6">Launch Calendar</h1>
      <div className="flex flex-col items-center gap-4">
        {pastLaunches.map((launch, idx) => (
          <div key={`past-${idx}`} className="w-full max-w-2xl border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="font-semibold mb-2">{launch.formatted_date}</div>
            <div onClick={() => setSelectedLaunch(launch)} className="text-sm p-2 bg-blue-100 dark:bg-blue-900 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800">
              <div className="font-medium">{launch.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{launch.provider}</div>
            </div>
          </div>
        ))}
        {nextLaunches.map((launch, idx) => (
          <div key={`next-${idx}`} className="w-full max-w-2xl border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="font-semibold mb-2">{launch.formatted_date}</div>
            <div onClick={() => setSelectedLaunch(launch)} className="text-sm p-2 bg-blue-100 dark:bg-blue-900 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800">
              <div className="font-medium">{launch.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{launch.provider}</div>
            </div>
          </div>
        ))}
      </div>
      {selectedLaunch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedLaunch(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedLaunch.name}</h2>
            <p className="mb-4">{selectedLaunch.launch_description}</p>
            <div className="space-y-2 text-sm mb-4">
              <div><strong>Provider:</strong> {selectedLaunch.provider}</div>
              <div><strong>Vehicle:</strong> {selectedLaunch.vehicle}</div>
              <div><strong>Pad:</strong> {selectedLaunch.pad.name}</div>
              <div><strong>Location:</strong> {selectedLaunch.pad.location.name}, {selectedLaunch.pad.location.state}</div>
              {selectedLaunch.t0 && <div><strong>Launch Time:</strong> {new Date(selectedLaunch.t0).toLocaleString()}</div>}
            </div>
            <button onClick={() => setSelectedLaunch(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}