'use client';

import { useState, useEffect } from 'react';
import NextLaunchWidget from './components/NextLaunchWidget';
import AllLaunchesWidget from './components/AllLaunchesWidget';
import MarsWidget from './components/MarsWidget';
import APODWidget from './components/APODWidget';
import ViewAllLaunchesButton from './components/ViewAllLaunchesButton';
import StarsBackground from './components/StarsBackground';
import { getSettings } from './utils/settings';

export default function Home() {
  const [hasLoadedImages, setHasLoadedImages] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [hideAPOD, setHideAPOD] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setMobileView(settings.mobileView);
    setHideAPOD(settings.hideAPOD);

    const handleSettingsChange = () => {
      const updatedSettings = getSettings();
      setMobileView(updatedSettings.mobileView);
      setHideAPOD(updatedSettings.hideAPOD);
    };

    window.addEventListener('settingsUpdated', handleSettingsChange);
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <header className={`bg-white dark:bg-gray-800 shadow-sm relative z-10 ${mobileView ? 'py-4' : 'py-6'}`}>
        <div className={`max-w-7xl mx-auto ${mobileView ? 'px-4' : 'px-4 sm:px-6 lg:px-8'}`}>
          <h1 className={`font-bold text-center text-gray-900 dark:text-white ${mobileView ? 'text-2xl' : 'text-4xl'}`}>LaunchPort</h1>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto relative ${mobileView ? 'px-4 py-6' : 'px-4 sm:px-6 lg:px-8 py-12'}`}>
        <StarsBackground />
        <div className="relative z-10">
          <section className={mobileView ? 'mb-8' : 'mb-12'}>
            <NextLaunchWidget />
          </section>

          <section className={mobileView ? 'mb-8' : 'mb-12'}>
            {hasLoadedImages && (
              <h2 className={`font-semibold mb-6 text-gray-900 dark:text-white ${mobileView ? 'text-xl' : 'text-2xl'}`}>Mars Images</h2>
            )}
            <div className={`grid grid-cols-1 gap-6 ${mobileView ? '' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              <MarsWidget onImagesLoaded={() => setHasLoadedImages(true)} />
              <MarsWidget onImagesLoaded={() => setHasLoadedImages(true)} />
              <MarsWidget onImagesLoaded={() => setHasLoadedImages(true)} />
            </div>
          </section>

          <section className={mobileView ? 'mb-8' : 'mb-12'}>
            <AllLaunchesWidget />
          </section>

          {!hideAPOD && (
            <section className={`${mobileView ? 'mb-8' : 'mb-12'} flex justify-center`}>
              <div className={`w-full ${mobileView ? '' : 'max-w-3xl'}`}>
                <APODWidget />
              </div>
            </section>
          )}

          <section className="flex justify-center">
            <ViewAllLaunchesButton />
          </section>
        </div>
      </main>
    </div>
  );
}
