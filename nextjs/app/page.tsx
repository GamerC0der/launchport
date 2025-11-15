'use client';

import NextLaunchWidget from './components/NextLaunchWidget';
import AllLaunchesWidget from './components/AllLaunchesWidget';
import MarsWidget from './components/MarsWidget';
import ViewAllLaunchesButton from './components/ViewAllLaunchesButton';
import StarsBackground from './components/StarsBackground';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <header className="bg-white dark:bg-gray-800 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">LaunchPort</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <StarsBackground />
        <div className="relative z-10">
          <section className="mb-12">
            <NextLaunchWidget />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Mars Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MarsWidget />
              <MarsWidget />
              <MarsWidget />
            </div>
          </section>

          <section className="mb-12">
            <AllLaunchesWidget />
          </section>

          <section className="flex justify-center">
            <ViewAllLaunchesButton />
          </section>
        </div>
      </main>
    </div>
  );
}
