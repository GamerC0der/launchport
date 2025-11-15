'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/calendar', label: 'schedule' },
  ];
  return (
    <aside className="w-64 h-screen border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold">LaunchPort</h2>
        <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">×</button>
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
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
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

