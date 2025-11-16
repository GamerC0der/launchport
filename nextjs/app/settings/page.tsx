'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../utils/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    hideImagesTab: false,
    hideHomeTab: false,
    hideScheduleTab: false,
  });

  useEffect(() => {
    const currentSettings = getSettings();
    setSettings(currentSettings);
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    updateSetting(key, newValue);
  };

  const ToggleSetting = ({ label, description, settingKey }: { label: string; description: string; settingKey: keyof typeof settings }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-800 last:border-b-0">
      <div>
        <p className="text-lg font-medium text-white">{label}</p>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-center text-white">Settings</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Sidebar Navigation</h2>
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
      </main>
    </div>
  );
}

