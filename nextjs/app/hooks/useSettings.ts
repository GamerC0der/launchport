import { useState, useEffect } from 'react';
import { getSettings, Settings } from '../utils/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getSettings());

  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getSettings());
    };

    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('settingsUpdated', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('settingsUpdated', handleSettingsChange);
    };
  }, []);

  return settings;
}

