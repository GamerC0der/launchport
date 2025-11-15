'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

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

export default function MarsPage() {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarsPhotos() {
      try {
        const response = await fetch('/api/mars?limit=50');
        
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Mars Images</h1>
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">Loading images...</div>
        ) : photos.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">No images available</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="relative aspect-square">
                  <img
                    src={photo.img_src}
                    alt={`Mars photo from ${photo.earth_date}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="288" height="192"%3E%3Crect fill="%23ccc" width="288" height="192"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {photo.rover.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {photo.camera.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {photo.earth_date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

