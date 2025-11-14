'use client';

interface WidgetPickerProps {
  onSelect: (widgetType: 'next-launch' | 'all-launches') => void;
  onClose: () => void;
}

export default function WidgetPicker({ onSelect, onClose }: WidgetPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Widget</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              onSelect('next-launch');
              onClose();
            }}
            className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
          >
            <div className="font-medium text-gray-900 dark:text-white">Next Launch</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Show the next upcoming launch</div>
          </button>
          <button
            onClick={() => {
              onSelect('all-launches');
              onClose();
            }}
            className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
          >
            <div className="font-medium text-gray-900 dark:text-white">All Launches</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Show upcoming launches list</div>
          </button>
        </div>
      </div>
    </div>
  );
}

