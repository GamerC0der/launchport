'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { getSettings } from '../utils/settings';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setMobileView(settings.mobileView);

    if (settings.mobileView) {
      setIsOpen(false);
    }

    const handleSettingsChange = () => {
      const updatedSettings = getSettings();
      setMobileView(updatedSettings.mobileView);
      if (updatedSettings.mobileView) {
        setIsOpen(false);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsChange);
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsChange);
    };
  }, []);

  return (
    <div className={`flex relative ${mobileView ? 'mobile-view' : ''}`}>
      {mobileView && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          mobileView 
            ? (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
            : (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
        }`}
      >
        <Sidebar onClose={() => setIsOpen(false)} mobileView={mobileView} />
      </div>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed top-4 left-4 z-50 p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded transition-opacity duration-300 hover:opacity-80 ${
            mobileView ? 'block' : ''
          }`}
        >
          ☰
        </button>
      )}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          mobileView 
            ? 'ml-0' 
            : (isOpen ? 'ml-64' : 'ml-0')
        }`}
      >
        {children}
      </main>
    </div>
  );
}
