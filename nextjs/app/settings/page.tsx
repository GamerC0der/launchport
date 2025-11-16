'use client';

import { useState, useEffect } from 'react';
import { HiHome, HiCalendar, HiPhotograph, HiDeviceMobile, HiViewGrid, HiCog, HiRefresh } from 'react-icons/hi';
import { getSettings, updateSetting, resetSettings } from '../utils/settings';

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

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      resetSettings();
      const defaultSettings = getSettings();
      setSettings(defaultSettings);
    }
  };

  const ToggleSetting = ({ 
    label, 
    description, 
    settingKey, 
    icon: Icon 
  }: { 
    label: string; 
    description: string; 
    settingKey: keyof typeof settings;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className={`group flex items-center justify-between border-b border-gray-700/50 dark:border-gray-700 last:border-b-0 transition-colors hover:bg-gray-800/30 dark:hover:bg-gray-800/30 ${settings.mobileView ? 'py-3 px-2' : 'py-4 px-3'}`}>
      <div className="flex items-start gap-3 flex-1">
        {Icon && (
          <div className={`mt-0.5 text-gray-400 group-hover:text-gray-300 dark:text-gray-500 dark:group-hover:text-gray-400 transition-colors ${settings.mobileView ? 'text-lg' : 'text-xl'}`}>
            <Icon className={settings.mobileView ? 'w-5 h-5' : 'w-6 h-6'} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-100 dark:text-gray-100 ${settings.mobileView ? 'text-base' : 'text-lg'}`}>{label}</p>
          <p className={`text-gray-400 dark:text-gray-400 mt-1 leading-relaxed ${settings.mobileView ? 'text-xs' : 'text-sm'}`}>{description}</p>
        </div>
      </div>
      <button
        onClick={() => handleToggle(settingKey)}
        className={`relative ml-4 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          settings[settingKey] 
            ? 'bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-500/30' 
            : 'bg-gray-600 dark:bg-gray-700'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-200 ease-in-out ${
            settings[settingKey] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-10">
        <div className={`max-w-4xl mx-auto ${settings.mobileView ? 'px-4 py-5' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
          <div className="flex items-center gap-3 justify-center">
            <HiCog className={`text-gray-700 dark:text-gray-300 ${settings.mobileView ? 'w-6 h-6' : 'w-8 h-8'}`} />
            <h1 className={`font-bold text-gray-900 dark:text-white ${settings.mobileView ? 'text-2xl' : 'text-4xl'}`}>Settings</h1>
          </div>
        </div>
      </header>

      <main className={`max-w-4xl mx-auto ${settings.mobileView ? 'px-4 py-6' : 'px-4 sm:px-6 lg:px-8 py-12'}`}>
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${settings.mobileView ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-2 mb-6">
            <HiViewGrid className={`text-gray-700 dark:text-gray-300 ${settings.mobileView ? 'w-5 h-5' : 'w-6 h-6'}`} />
            <h2 className={`font-bold text-gray-900 dark:text-white ${settings.mobileView ? 'text-lg' : 'text-xl'}`}>Sidebar Navigation</h2>
          </div>
          <div className="space-y-1">
            <ToggleSetting
              label="Hide Home Tab"
              description="Hide the Home tab from the sidebar navigation"
              settingKey="hideHomeTab"
              icon={HiHome}
            />
            <ToggleSetting
              label="Hide Schedule Tab"
              description="Hide the Schedule tab from the sidebar navigation"
              settingKey="hideScheduleTab"
              icon={HiCalendar}
            />
            <ToggleSetting
              label="Hide Images Tab"
              description="Hide the Images tab from the sidebar navigation"
              settingKey="hideImagesTab"
              icon={HiPhotograph}
            />
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mt-6 ${settings.mobileView ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-2 mb-6">
            <HiDeviceMobile className={`text-gray-700 dark:text-gray-300 ${settings.mobileView ? 'w-5 h-5' : 'w-6 h-6'}`} />
            <h2 className={`font-bold text-gray-900 dark:text-white ${settings.mobileView ? 'text-lg' : 'text-xl'}`}>Display</h2>
          </div>
          <div className="space-y-1">
            <ToggleSetting
              label="Mobile View"
              description="Optimize the UI for mobile devices with compact layouts and overlay sidebar"
              settingKey="mobileView"
            />
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm overflow-hidden mt-6 ${settings.mobileView ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-2 mb-4">
            <HiRefresh className={`text-red-600 dark:text-red-400 ${settings.mobileView ? 'w-5 h-5' : 'w-6 h-6'}`} />
            <h2 className={`font-bold text-gray-900 dark:text-white ${settings.mobileView ? 'text-lg' : 'text-xl'}`}>Reset Settings</h2>
          </div>
          <p className={`text-gray-600 dark:text-gray-400 mb-4 ${settings.mobileView ? 'text-sm' : 'text-base'}`}>
            Reset all settings to their default values. This action cannot be undone.
          </p>
          <button
            onClick={handleReset}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${settings.mobileView ? 'text-sm' : 'text-base'}`}
          >
            <HiRefresh className={settings.mobileView ? 'w-4 h-4' : 'w-5 h-5'} />
            Reset All Settings
          </button>
        </div>
      </main>
    </div>
  );
}

