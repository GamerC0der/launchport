'use client';

import { useState } from 'react';
import NextLaunchWidget from './components/NextLaunchWidget';
import AllLaunchesWidget from './components/AllLaunchesWidget';
import MarsWidget from './components/MarsWidget';
import APODWidget from './components/APODWidget';
import ViewAllLaunchesButton from './components/ViewAllLaunchesButton';
import StarsBackground from './components/StarsBackground';

export default function Home() {
  const [hasLoadedImages, setHasLoadedImages] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <header className="bg-white dark:bg-gray-800 shadow-sm relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {hasLoadedImages && (
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Mars Images</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MarsWidget onImagesLoaded={() => setHasLoadedImages(true)} />
              <MarsWidget onImagesLoaded={() => setHasLoadedImages(true)} />
              <MarsWidget onImagesLoaded={() => setHasLoadedImages(true)} />
            </div>
          </section>

          <section className="mb-12">
            <AllLaunchesWidget />
          </section>

          <section className="mb-12 flex justify-center">
            <div className="w-full max-w-3xl">
              <APODWidget />
            </div>
          </section>

          <section className="flex justify-center">
            <ViewAllLaunchesButton />
          </section>
        </div>
      </main>
    </div>
  );
}
