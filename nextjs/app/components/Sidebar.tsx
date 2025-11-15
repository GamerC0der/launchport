'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/calendar', label: 'Schedule' },
  ];
  return (
    <aside className="w-64 h-screen border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 p-6 overflow-y-auto">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">LaunchPort</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">×</button>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

