'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../utils/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    hideImagesTab: false,
    hideHomeTab: false,
    hideScheduleTab: false,
    mobileView: false,
  });

  useEffect(() => {
    const currentSettings = getSettings();
    setSettings(currentSettings);

    const handleSettingsChange = () => {
      const updatedSettings = getSettings();
      setSettings(updatedSettings);
    };

    window.addEventListener('settingsUpdated', handleSettingsChange);
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsChange);
    };
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    updateSetting(key, newValue);
  };

  const ToggleSetting = ({ label, description, settingKey }: { label: string; description: string; settingKey: keyof typeof settings }) => (
    <div className={`flex items-center justify-between border-b border-gray-800 last:border-b-0 ${settings.mobileView ? 'py-3' : 'py-4'}`}>
      <div>
        <p className={`font-medium text-white ${settings.mobileView ? 'text-base' : 'text-lg'}`}>{label}</p>
        <p className={`text-gray-400 mt-1 ${settings.mobileView ? 'text-xs' : 'text-sm'}`}>{description}</p>
      </div>
      <button
        onClick={() => handleToggle(settingKey)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black ${
          settings[settingKey] ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings[settingKey] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800 relative z-10">
        <div className={`max-w-7xl mx-auto ${settings.mobileView ? 'px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-6'}`}>
          <h1 className={`font-bold text-center text-white ${settings.mobileView ? 'text-2xl' : 'text-4xl'}`}>Settings</h1>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto ${settings.mobileView ? 'px-4 py-6' : 'px-4 sm:px-6 lg:px-8 py-12'}`}>
        <div className={`bg-gray-900 rounded-lg border border-gray-800 max-w-2xl mx-auto ${settings.mobileView ? 'p-4' : 'p-6'}`}>
          <h2 className={`font-semibold text-white mb-4 ${settings.mobileView ? 'text-lg' : 'text-xl'}`}>Sidebar Navigation</h2>
          <ToggleSetting
            label="Hide Home Tab"
            description="Hide the Home tab from the sidebar navigation"
            settingKey="hideHomeTab"
          />
          <ToggleSetting
            label="Hide Schedule Tab"
            description="Hide the Schedule tab from the sidebar navigation"
            settingKey="hideScheduleTab"
          />
          <ToggleSetting
            label="Hide Images Tab"
            description="Hide the Images tab from the sidebar navigation"
            settingKey="hideImagesTab"
          />
        </div>

        <div className={`bg-gray-900 rounded-lg border border-gray-800 max-w-2xl mx-auto mt-6 ${settings.mobileView ? 'p-4' : 'p-6'}`}>
          <h2 className={`font-semibold text-white mb-4 ${settings.mobileView ? 'text-lg' : 'text-xl'}`}>Display</h2>
          <ToggleSetting
            label="Mobile View"
            description="Optimize the UI for mobile devices with compact layouts and overlay sidebar"
            settingKey="mobileView"
          />
        </div>
      </main>
    </div>
  );
}

