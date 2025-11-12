import launchesData from '../../data/l.json';

interface Launch {
  name: string;
  provider: string;
  vehicle: string;
  pad: {
    name: string;
    location: {
      name: string;
      state: string;
      statename: string;
      country: string;
      slug: string;
    };
  };
  launch_description: string;
  formatted_date: string;
  t0: string | null;
  win_open: string | null;
}

export default function Calendar() {
  const launches = launchesData.result as Launch[];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Launch Calendar</h1>
      <div className="space-y-4">
        {launches.map((launch, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold">{launch.name}</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {launch.formatted_date}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {launch.launch_description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    <strong>Provider:</strong> {launch.provider}
                  </span>
                  <span>
                    <strong>Vehicle:</strong> {launch.vehicle}
                  </span>
                  <span>
                    <strong>Pad:</strong> {launch.pad.name}
                  </span>
                  <span>
                    <strong>Location:</strong> {launch.pad.location.name}, {launch.pad.location.state}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

