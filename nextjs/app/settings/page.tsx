'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../utils/settings';

export default function SettingsPage() {
  const [hideImagesTab, setHideImagesTab] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setHideImagesTab(settings.hideImagesTab);
  }, []);

  const handleToggleHideImages = () => {
    const newValue = !hideImagesTab;
    setHideImagesTab(newValue);
    updateSetting('hideImagesTab', newValue);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-center text-white">Settings</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-white">Hide Images Tab</p>
              <p className="text-sm text-gray-400 mt-1">
                Hide the Images tab from the sidebar navigation
              </p>
            </div>
            <button
              onClick={handleToggleHideImages}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black ${
                hideImagesTab ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hideImagesTab ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

