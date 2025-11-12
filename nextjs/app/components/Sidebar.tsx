'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/', label: 'Hub' },
    { href: '/calendar', label: 'Calendar' },
  ];

  return (
    <aside className="w-64 min-h-screen border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">LaunchPort</h2>
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

