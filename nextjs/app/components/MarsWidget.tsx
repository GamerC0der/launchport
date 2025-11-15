'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MarsPhoto {
  id: string;
  img_src: string;
  earth_date: string;
  rover: {
    name: string;
  };
  camera: {
    full_name: string;
  };
}

interface MarsWidgetProps {
  onImagesLoaded?: () => void;
}

export default function MarsWidget({ onImagesLoaded }: MarsWidgetProps) {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function fetchMarsPhotos() {
      try {
        const response = await fetch('/api/mars?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Mars photos');
        }
        
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      } catch (error) {
        console.error('Error fetching Mars photos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMarsPhotos();
  }, []);

  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [photos.length]);

  if (loading) {
    return null;
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Images</h3>
        <div className="text-gray-500 dark:text-gray-400">No images available</div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="relative mb-3">
        <img
          src={currentPhoto.img_src}
          alt={`Mars photo from ${currentPhoto.earth_date}`}
          className="w-full h-48 object-cover rounded-lg"
          onLoad={() => {
            if (!imageLoaded) {
              setImageLoaded(true);
              onImagesLoaded?.();
            }
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="288" height="192"%3E%3Crect fill="%23ccc" width="288" height="192"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
          }}
        />
        {photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
        <p>{currentPhoto.rover.name} • {currentPhoto.camera.full_name}</p>
        <p>Earth Date: {currentPhoto.earth_date}</p>
        {photos.length > 1 && (
          <p className="text-gray-500 dark:text-gray-500">
            {currentIndex + 1} of {photos.length}
          </p>
        )}
      </div>
      <Link 
        href="/mars"
        className="block w-full text-center py-2 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
      >
        View More Images
      </Link>
    </div>
  );
}

