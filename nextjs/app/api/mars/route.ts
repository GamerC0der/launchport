import { NextResponse } from 'next/server';

interface MarsPhoto {
  id: string;
  img_src: string;
  earth_date: string;
  rover: {
    name: string;
  }
  camera: {
    full_name: string;
  };
}

interface NASAImageItem {
  data: Array<{
    nasa_id: string;
    title: string;
    date_created: string;
    description?: string;
    keywords?: string[];
    media_type: string;
  }>;
  links?: Array<{
    href: string; 
    rel: string;
    render?: string;
  }> 
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');
  const query = searchParams.get('query') || '';

  try {
    const allPhotos: MarsPhoto[] = [];

    const searchQueries = query 
      ? [query]
      : [
          'mars rover',
          'mars curiosity',
          'mars perseverance',
          'mars surface',
          'mars landscape'
        ];

    for (const searchQuery of searchQueries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
          `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchQuery)}&media_type=image&page=1&page_size=50`,
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

              const title = itemData.title || '';
              const description = itemData.description || '';
              const roverName = title.includes('Curiosity') ? 'Curiosity' :
                               title.includes('Perseverance') ? 'Perseverance' :
                               title.includes('Opportunity') ? 'Opportunity' :
                               title.includes('Spirit') ? 'Spirit' : 'Mars Rover';

              const cameraName = title.match(/(\w+)\s+Camera/i)?.[0] || 'Mars Camera';

              if (allPhotos.some(p => p.id === itemData.nasa_id)) continue;

              allPhotos.push({
                id: itemData.nasa_id,
                img_src: imageLink.href,
                earth_date: itemData.date_created ? new Date(itemData.date_created).toISOString().split('T')[0] : 'Unknown',
                rover: {
                  name: roverName,
                },
                camera: {
                  full_name: cameraName,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching Mars images for query "${searchQuery}":`, error);
        continue;
      }
    }

    for (let i = allPhotos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPhotos[i], allPhotos[j]] = [allPhotos[j], allPhotos[i]];
    }

    return NextResponse.json({ photos: allPhotos.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching Mars photos:', error);
    return NextResponse.json({ photos: [] }, { status: 500 });
  }
}

