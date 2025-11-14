export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/launches?type=next&limit=1`, { cache: 'no-store' });
  const launch = (await res.json()).result?.[0];
  return <div className="flex justify-center items-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-md w-full">
      <h1 className="text-4xl mb-6 text-center font-bold text-gray-900 dark:text-white">LaunchPort</h1>
      {launch ? <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{launch.name}</h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p className="text-lg">{launch.provider} • {launch.vehicle}</p>
          <p className="text-gray-600 dark:text-gray-400">{launch.formatted_date}</p>
          {launch.pad?.location?.name && <p className="text-sm text-gray-500 dark:text-gray-500">{launch.pad.location.name}</p>}
        </div>
      </div> : <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">No upcoming launches</div>}
    </div>
  </div>;
}
