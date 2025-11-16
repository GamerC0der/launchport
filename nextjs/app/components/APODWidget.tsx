'use client';

import { useEffect, useState } from 'react';

interface APODData {
  title: string;
  imageUrl: string;
  explanation: string;
  date: string;
  copyright?: string;
}

export default function APODWidget() {
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function fetchAPOD() {
      try {
        const response = await fetch('/api/apod');
        
        if (!response.ok) {
          throw new Error('Failed to fetch APOD');
        }
        
        const data = await response.json();
        setApodData(data);
      } catch (error) {
        console.error('Error fetching APOD:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAPOD();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!apodData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Astronomy Picture of the Day</h3>
        <div className="text-gray-500 dark:text-gray-400">Unable to load picture of the day</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Astronomy Picture of the Day
      </h3>
      
      <div className="mb-4">
        {!imageError ? (
          <img
            src={apodData.imageUrl}
            alt={apodData.title}
            className="w-full h-auto rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Image unavailable</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          {apodData.title}
        </h4>
        
        {apodData.copyright && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Credit:</span> {apodData.copyright}
          </p>
        )}
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Date:</span> {new Date(apodData.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {apodData.explanation}
        </p>
      </div>
    </div>
  );
}

