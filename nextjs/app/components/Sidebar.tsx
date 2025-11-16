'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiHome, HiCalendar, HiPhotograph, HiCog } from 'react-icons/hi';
import { getSettings } from '../utils/settings';

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const [hideImagesTab, setHideImagesTab] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setHideImagesTab(settings.hideImagesTab);
    
    const handleStorageChange = () => {
      const updatedSettings = getSettings();
      setHideImagesTab(updatedSettings.hideImagesTab);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settingsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleStorageChange);
    };
  }, []);

  const menuItems = [
    { href: '/', label: 'Home', icon: HiHome },
    { href: '/calendar', label: 'Schedule', icon: HiCalendar },
    ...(hideImagesTab ? [] : [{ href: '/images', label: 'Images', icon: HiPhotograph }]),
  ];
  return (
    <aside className="w-64 h-screen border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 p-6 overflow-y-auto flex flex-col">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">LaunchPort</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">×</button>
      </div>
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            pathname === '/settings'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <HiCog className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

