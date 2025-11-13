'use client';
import { useState } from 'react';
import launchesData from '../../data/l.json';

interface Launch {
  name: string;
  provider: string;
  vehicle: string;
  pad: { name: string; location: { name: string; state: string } };
  launch_description: string;
  formatted_date: string;
  t0: string | null;
}

export default function Calendar() {
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const launches = launchesData.result as Launch[];
  const grouped = launches.reduce((acc, launch) => {
    if (!acc[launch.formatted_date]) acc[launch.formatted_date] = [];
    acc[launch.formatted_date].push(launch);
    return acc;
  }, {} as Record<string, Launch[]>);
  const dates = Object.keys(grouped).sort((a, b) => {
    const [mA, dA] = [a.split(' ')[0], parseInt(a.split(' ')[1])];
    const [mB, dB] = [b.split(' ')[0], parseInt(b.split(' ')[1])];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(mA) - months.indexOf(mB) || dA - dB;
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Launch Calendar</h1>
      <div className="grid grid-cols-7 gap-4">
        {dates.map((date) => (
          <div key={date} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 min-h-[120px]">
            <div className="font-semibold mb-2">{date}</div>
            {grouped[date].map((launch, idx) => (
              <div key={idx} onClick={() => setSelectedLaunch(launch)} className="text-sm p-2 mb-1 bg-blue-100 dark:bg-blue-900 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800">
                {launch.name}
              </div>
            ))}
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