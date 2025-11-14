'use client';

import { useState } from 'react';

interface WidgetPickerProps {
  onSelect: (widgetType: 'next-launch' | 'all-launches') => void;
  onClose: () => void;
}

const widgets = [
  {
    type: 'next-launch' as const,
    name: 'Next Launch',
    description: 'Show the next upcoming launch',
  },
  {
    type: 'all-launches' as const,
    name: 'All Launches',
    description: 'Show upcoming launches list',
  },
];

export default function WidgetPicker({ onSelect, onClose }: WidgetPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWidgets = widgets.filter(widget =>
    widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Widget</h3>
        <input
          type="text"
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="space-y-2">
          {filteredWidgets.length > 0 ? (
            filteredWidgets.map((widget) => (
              <button
                key={widget.type}
                onClick={() => {
                  onSelect(widget.type);
                  onClose();
                }}
                className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white">{widget.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{widget.description}</div>
              </button>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No widgets found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

