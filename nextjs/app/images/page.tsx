'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoArrowBack } from 'react-icons/io5';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';

interface Photo {
  id: string;
  img_src: string;
  earth_date: string;
}

interface NASAImageItem {
  data: Array<{
    nasa_id: string;
    title: string;
    date_created: string;
    media_type: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    render?: string;
  }>;
}

function SkeletonLoader() {
  return (
    <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
  );
}

export default function ImagesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [numResults, setNumResults] = useState(25);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, searchQuery === '' ? 0 : 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      try {
        const allPhotos: Photo[] = [];
        const query = debouncedQuery.trim() || 'space';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page=1&page_size=50`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.collection?.items) {
            for (const item of data.collection.items) {
              const nasaItem = item as NASAImageItem;
              if (!nasaItem.data?.[0] || nasaItem.data[0].media_type !== 'image') continue;

              const itemData = nasaItem.data[0];
              const imageLink = nasaItem.links?.find(link => 
                link.rel === 'preview' || 
                link.href.match(/jpg|jpeg|png|gif|webp$/i) ||
                link.render === 'image'
              );

              if (!imageLink?.href || allPhotos.some(p => p.id === itemData.nasa_id)) continue;

              allPhotos.push({
                id: itemData.nasa_id,
                img_src: imageLink.href,
                earth_date: itemData.date_created
                  ? new Date(itemData.date_created).toISOString().split('T')[0]
                  : 'Unknown',
              });
            }
          }
        }

        setPhotos(allPhotos.slice(0, numResults));
      } catch (error) {
        console.error('Error fetching images:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, [debouncedQuery, numResults]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    if (selectedPhoto) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Images</h1>
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <HiMagnifyingGlass className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={numResults}
              onChange={(e) => setNumResults(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={4}>4 results</option>
              <option value={10}>10 results</option>
              <option value={25}>25 results</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: numResults }).map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-12">
            {searchQuery.trim() ? 'No images found' : 'No images available'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 group cursor-pointer"
              >
                <Image
                  src={photo.img_src}
                  alt={`NASA image from ${photo.earth_date}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="288" height="192"%3E%3Crect fill="%23ccc" width="288" height="192"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
              aria-label="Close modal"
            >
              <IoClose className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.img_src}
              alt={`NASA image from ${selectedPhoto.earth_date}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="288" height="192"%3E%3Crect fill="%23ccc" width="288" height="192"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-lg text-sm">
              Date: {selectedPhoto.earth_date}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

