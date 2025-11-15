'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';
import { HiMagnifyingGlass } from 'react-icons/hi2';

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

export default function ImagesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, searchQuery === '' ? 0 : 750);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      try {
        const allPhotos: Photo[] = [];
        const searchQueries = debouncedQuery.trim()
          ? [debouncedQuery.trim()]
          : ['space'];

        for (const query of searchQueries) {
          try {
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
              if (data.collection && data.collection.items && Array.isArray(data.collection.items)) {
                for (const item of data.collection.items) {
                  const nasaItem = item as NASAImageItem;
                  if (!nasaItem.data || nasaItem.data.length === 0) continue;

                  const itemData = nasaItem.data[0];
                  if (itemData.media_type !== 'image') continue;

                  let imageLink = nasaItem.links?.find(link => link.rel === 'preview');
                  if (!imageLink) {
                    imageLink = nasaItem.links?.find(link =>
                      link.href.match(/jpg|jpeg|png|gif|webp$/i) ||
                      link.render === 'image'
                    );
                  }
                  if (!imageLink || !imageLink.href) continue;

                  if (allPhotos.some(p => p.id === itemData.nasa_id)) continue;

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
          } catch (error) {
            console.error(`Error fetching images for query "${query}":`, error);
            continue;
          }
        }

        // Shuffle and limit
        for (let i = allPhotos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allPhotos[i], allPhotos[j]] = [allPhotos[j], allPhotos[i]];
        }

        setPhotos(allPhotos.slice(0, 50));
      } catch (error) {
        console.error('Error fetching images:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Images</h1>
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
        <div className="mb-6">
          <div className="max-w-2xl mx-auto relative">
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
        </div>
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">Loading images...</div>
        ) : photos.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            {searchQuery.trim() ? 'No images found for your search' : 'No images available'}
          </div>
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
                    alt={`NASA image from ${photo.earth_date}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="288" height="192"%3E%3Crect fill="%23ccc" width="288" height="192"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

