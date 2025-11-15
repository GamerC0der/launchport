'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="flex">
      {isOpen && <Sidebar onClose={() => setIsOpen(false)} />}
      {!isOpen && <button onClick={() => setIsOpen(true)} className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded">☰</button>}
      <main className="flex-1">{children}</main>
    </div>
  );
}
