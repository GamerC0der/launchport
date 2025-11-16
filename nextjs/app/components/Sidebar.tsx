'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiHome, HiCalendar, HiPhotograph, HiCog } from 'react-icons/hi';
import { getSettings } from '../utils/settings';

export default function Sidebar({ onClose, mobileView = false }: { onClose: () => void; mobileView?: boolean }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState({
    hideImagesTab: false,
    hideHomeTab: false,
    hideScheduleTab: false,
    mobileView: false,
  });

  useEffect(() => {
    const currentSettings = getSettings();
    setSettings(currentSettings);
    
    const handleStorageChange = () => {
      const updatedSettings = getSettings();
      setSettings(updatedSettings);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settingsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleStorageChange);
    };
  }, []);

  const menuItems = [
    ...(settings.hideHomeTab ? [] : [{ href: '/', label: 'Home', icon: HiHome }]),
    ...(settings.hideScheduleTab ? [] : [{ href: '/calendar', label: 'Schedule', icon: HiCalendar }]),
    ...(settings.hideImagesTab ? [] : [{ href: '/images', label: 'Images', icon: HiPhotograph }]),
  ];
  return (
    <aside className={`w-64 h-screen border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 overflow-y-auto flex flex-col ${
      mobileView ? 'p-4' : 'p-6'
    }`}>
      <div className={`flex justify-between items-center ${mobileView ? 'mb-6' : 'mb-8'}`}>
        <h2 className={`font-bold text-gray-900 dark:text-gray-100 ${mobileView ? 'text-xl' : 'text-2xl'}`}>LaunchPort</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-2xl leading-none">×</button>
      </div>
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobileView ? onClose : undefined}
              className={`flex items-center gap-3 rounded-lg transition-all ${
                mobileView ? 'px-3 py-2' : 'px-4 py-3'
              } ${
                isActive
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <item.icon className={`${mobileView ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span className={mobileView ? 'text-sm' : ''}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={`mt-auto ${mobileView ? 'pt-2' : 'pt-4'}`}>
        <Link
          href="/settings"
          onClick={mobileView ? onClose : undefined}
          className={`flex items-center gap-3 rounded-lg transition-all ${
            mobileView ? 'px-3 py-2' : 'px-4 py-3'
          } ${
            pathname === '/settings'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <HiCog className={`${mobileView ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span className={mobileView ? 'text-sm' : ''}>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

