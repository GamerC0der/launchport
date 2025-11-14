'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface DraggableWidgetProps {
  id: string;
  x: number;
  y: number;
  children: ReactNode;
  onDrag: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

const GRID_SIZE = 96;

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export default function DraggableWidget({ id, x, y, children, onDrag, onRemove }: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = widgetRef.current?.closest('[class*="relative"]') as HTMLElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const widgetWidth = widgetRef.current?.offsetWidth || 288;
      const widgetHeight = widgetRef.current?.offsetHeight || 200;
      
      const rawX = e.clientX - containerRect.left - dragOffset.x;
      const rawY = e.clientY - containerRect.top - dragOffset.y;
      
      const maxX = Math.floor((container.clientWidth - widgetWidth) / GRID_SIZE) * GRID_SIZE;
      const maxY = Math.floor((container.clientHeight - widgetHeight) / GRID_SIZE) * GRID_SIZE;
      
      let newX = snapToGrid(Math.max(0, Math.min(rawX, maxX)));
      let newY = snapToGrid(Math.max(0, Math.min(rawY, maxY)));
      
      setPosition({ x: newX, y: newY });
      onDrag(id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onDrag]);

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 1,
      }}
      className="select-none"
    >
      <div className="relative group">
        <div
          onMouseDown={handleMouseDown}
          className={`${isDragging ? 'opacity-90 shadow-2xl' : ''} transition-all`}
          style={{ userSelect: 'none' }}
        >
          {children}
        </div>
        <button
          onClick={() => onRemove(id)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
          aria-label="Remove widget"
        >
          ×
        </button>
      </div>
    </div>
  );
}

