const SETTINGS_KEY = 'launchport_settings';

export interface Settings {
  hideImagesTab: boolean;
  hideHomeTab: boolean;
  hideScheduleTab: boolean;
  mobileView: boolean;
  hideAPOD: boolean;
}

const defaultSettings: Settings = {
  hideImagesTab: false,
  hideHomeTab: false,
  hideScheduleTab: false,
  mobileView: false,
  hideAPOD: false,
};

export function getSettings(): Settings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  return defaultSettings;
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): void {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('settingsUpdated'));
  }
}

export function resetSettings(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(SETTINGS_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('settingsUpdated'));
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}

