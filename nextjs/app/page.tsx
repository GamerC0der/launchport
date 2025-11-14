'use client';

import { useState, useEffect } from 'react';
import DraggableWidget from './components/DraggableWidget';
import NextLaunchWidget from './components/NextLaunchWidget';
import AllLaunchesWidget from './components/AllLaunchesWidget';
import WidgetPicker from './components/WidgetPicker';

interface Widget {
  id: string;
  type: 'next-launch' | 'all-launches';
  x: number;
  y: number;
}

const snapToGrid = (value: number): number => {
  const GRID_SIZE = 96;
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export default function Home() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hub-widgets');
    if (saved) {
      try {
        const loadedWidgets = JSON.parse(saved);
        if (loadedWidgets && loadedWidgets.length > 0) {
          const snappedWidgets = loadedWidgets.map((w: Widget) => ({
            ...w,
            x: snapToGrid(w.x),
            y: snapToGrid(w.y),
          }));
          setWidgets(snappedWidgets);
          return;
        }
      } catch (e) {
        console.error('Error loading widgets:', e);
      }
    }
    
    const GRID_SIZE = 96;
    const widgetWidth = 288;
    
    const centerX = (window.innerWidth / 2) - (widgetWidth / 2);
    const leftWidgetX = snapToGrid(centerX - GRID_SIZE * 2);
    const rightWidgetX = snapToGrid(centerX + GRID_SIZE * 2);
    const centerY = (window.innerHeight / 2) - 100;
    
    const defaultWidgets: Widget[] = [
      {
        id: 'next-launch-default',
        type: 'next-launch',
        x: snapToGrid(leftWidgetX),
        y: snapToGrid(centerY),
      },
      {
        id: 'all-launches-default',
        type: 'all-launches',
        x: snapToGrid(rightWidgetX),
        y: snapToGrid(centerY),
      },
    ];
    setWidgets(defaultWidgets);
  }, []);

  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('hub-widgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  const handleAddWidget = (type: 'next-launch' | 'all-launches') => {
    const GRID_SIZE = 96;
    const padding = 32;
    let foundPosition = false;
    let gridX = padding;
    let gridY = padding + 80;
    while (!foundPosition && gridY < window.innerHeight - 200) {
      const isOccupied = widgets.some(w => 
        Math.abs(w.x - gridX) < GRID_SIZE && Math.abs(w.y - gridY) < GRID_SIZE
      );
      
      if (!isOccupied) {
        foundPosition = true;
      } else {
        gridX += GRID_SIZE;
        if (gridX > window.innerWidth - 320) {
          gridX = padding;
          gridY += GRID_SIZE;
        }
      }
    }
    
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      x: snapToGrid(gridX),
      y: snapToGrid(gridY),
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleDrag = (id: string, x: number, y: number) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const handleRemove = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'next-launch':
        return <NextLaunchWidget />;
      case 'all-launches':
        return <AllLaunchesWidget />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen p-8 bg-gray-50 dark:bg-gray-900 grid-bg">
      <h1 className="text-4xl mb-6 text-center font-bold text-gray-900 dark:text-white">LaunchPort</h1>
      
      <button
        onClick={() => setShowPicker(true)}
        className="fixed left-[272px] top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-40 text-2xl font-bold"
        aria-label="Add widget"
      >
        +
      </button>

      {widgets.map(widget => (
        <DraggableWidget
          key={widget.id}
          id={widget.id}
          x={widget.x}
          y={widget.y}
          onDrag={handleDrag}
          onRemove={handleRemove}
        >
          {renderWidget(widget)}
        </DraggableWidget>
      ))}

      {showPicker && (
        <WidgetPicker
          onSelect={handleAddWidget}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
