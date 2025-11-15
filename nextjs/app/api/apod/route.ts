import { NextResponse } from 'next/server';

interface APODData {
  title: string;
  imageUrl: string;
  explanation: string;
  date: string;
  copyright?: string;
}

export async function GET() {
  try {
    const response = await fetch('https://apod.nasa.gov/apod/astropix.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch APOD page');
    }

    const html = await response.text();

    const dateMatch = html.match(/(\d{4})\s+(\w+)\s+(\d{1,2})/);
    const date = dateMatch ? `${dateMatch[1]}-${getMonthNumber(dateMatch[2])}-${dateMatch[3].padStart(2, '0')}` : new Date().toISOString().split('T')[0];

    let titleMatch = html.match(/See Explanation[^<]*<[^>]*>\s*<b>([^<]+)<\/b>/i);
    if (!titleMatch) {
      titleMatch = html.match(/<b>([^<]{5,})<\/b>/);
    }
    const title = titleMatch ? titleMatch[1].trim() : 'Astronomy Picture of the Day';

    let imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (!imgMatch) {
      const anchorMatch = html.match(/<a[^>]+href=["']([^"']+\.(jpg|jpeg|png|gif|webp))["']/i);
      if (anchorMatch) {
        imgMatch = anchorMatch;
      }
    }
    let imageUrl = imgMatch ? imgMatch[1] : null;

    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://apod.nasa.gov/apod/${imageUrl}`;
    }

    let explanationMatch = html.match(/<b>Explanation:<\/b>\s*([\s\S]*?)(?=<b>|$)/i);
    if (!explanationMatch) {
      explanationMatch = html.match(/Explanation:\s*([\s\S]*?)(?=<b>|Tomorrow|$)/i);
    }
    let explanation = explanationMatch ? explanationMatch[1].trim() : '';

    explanation = explanation
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    let copyrightMatch = html.match(/Image Credit\s*(?:&amp;|&)?Copyright:\s*([^<\n]+)/i);
    if (!copyrightMatch) {
      copyrightMatch = html.match(/Image Credit:\s*([^<\n]+)/i);
    }
    const copyright = copyrightMatch ? copyrightMatch[1].trim().replace(/&amp;/g, '&') : undefined;

    if (!imageUrl) {
      throw new Error('Could not find image URL');
    }

    const apodData: APODData = {
      title,
      imageUrl,
      explanation,
      date,
      copyright,
    };

    return NextResponse.json(apodData);
  } catch (error) {
    console.error('Error fetching APOD:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Astronomy Picture of the Day' },
      { status: 500 }
    );
  }
}

function getMonthNumber(monthName: string): string {
  const months: { [key: string]: string } = {
    'january': '01',
    'february': '02',
    'march': '03',
    'april': '04',
    'may': '05',
    'june': '06',
    'july': '07',
    'august': '08',
    'september': '09',
    'october': '10',
    'november': '11',
    'december': '12',
  };
  return months[monthName.toLowerCase()] || '01';
}

