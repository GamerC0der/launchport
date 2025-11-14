import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface Launch {
  name: string;
  provider: string;
  vehicle: string;
  pad: { name: string; location: { name: string; state: string } };
  launch_description: string;
  formatted_date: string;
  t0: string | null;
  date: string;
}

function parseDate(dateStr: string): number {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.match(/(\w+)\s+(\d+),?\s+(\d+)/);
      if (parts) {
        const months: { [key: string]: number } = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const month = months[parts[1]] ?? 0;
        const day = parseInt(parts[2]);
        const year = parseInt(parts[3]);
        return Math.floor(new Date(year, month, day).getTime() / 1000);
      }
      return Math.floor(Date.now() / 1000);
    }
    return Math.floor(date.getTime() / 1000);
  } catch {
    return Math.floor(Date.now() / 1000);
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.match(/(\w+)\s+(\d+)/);
      if (parts) return `${parts[1]} ${parts[2]}`;
      return dateStr.split(' ').slice(0, 2).join(' ');
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  } catch {
    return dateStr.split(' ').slice(0, 2).join(' ');
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'next';
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const launches = await scrapeSpaceflightNow(type, limit);
    if (launches.length > 0) {
      return NextResponse.json({ result: launches });
    }
  
    const fallbackLaunches = await scrapeAlternativeSource(type, limit);
    return NextResponse.json({ result: fallbackLaunches });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ result: [] }, { status: 500 });
  }
}

async function scrapeSpaceflightNow(type: string, limit: number): Promise<Launch[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const url = 'https://spaceflightnow.com/launch-schedule/';
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const launches: Launch[] = [];
    const now = Date.now() / 1000;
    
    const launchSections: any[] = [];
    let currentSection: any = null;
    const seenLaunches = new Set<string>();
    
    $('h2, h3, h4, h5, strong, b, p, div').each((idx, element) => {
      const $el = $(element);
      const text = $el.text().trim();
      
      if (!text || text.length < 10) return;
      
      if (text.match(/^(Home|News|Archive|Schedule|Mission|Reports|Members|Sign|Live|Shop|Breaking|Search)/i)) return;
      if (text.match(/^\d{4}\s*Spaceflight Now/i)) return;
      
      const dateHeaderMatch = text.match(/^(NET\s+)?((?:November|December|January|February|March|April|May|June|July|August|September|October)\s+\d+(?:\/\d+)?(?:\/\d{4})?)\s*(.+)$/i);
      
      if (dateHeaderMatch) {
        if (currentSection && currentSection.name && currentSection.name !== 'Unknown Mission') {
          const key = `${currentSection.date}-${currentSection.name}`;
          if (!seenLaunches.has(key)) {
            launchSections.push(currentSection);
            seenLaunches.add(key);
          }
        }
        
        const isNET = !!dateHeaderMatch[1];
        const datePart = dateHeaderMatch[2];
        let restOfHeader = dateHeaderMatch[3].trim();
        
        if (restOfHeader.length > 200) return;
        
        restOfHeader = restOfHeader.replace(/(\d)([A-Z])/g, '$1 $2');
        
        const parts = restOfHeader.split('•').map(p => p.trim());
        let vehicle = parts[0] || '';
        let mission = parts[1] || '';
        
        const vehiclePattern = /(Falcon 9|Falcon Heavy|Atlas 5|Atlas V|Delta IV|Electron|Vulcan|New Glenn|Starship|SLS|Artemis|Ariane|Soyuz|Antares|H3|Hanbit-Nano|Soyuz-2-1a)/i;
        const vehicleMatch = restOfHeader.match(vehiclePattern);
        if (vehicleMatch) {
          vehicle = vehicleMatch[1];
          const vehicleIndex = restOfHeader.indexOf(vehicle);
          const afterVehicle = restOfHeader.substring(vehicleIndex + vehicle.length).trim();
          if (afterVehicle.startsWith('•')) {
            mission = afterVehicle.substring(1).trim();
          } else if (afterVehicle && !mission && afterVehicle.length < 50) {
            const words = afterVehicle.split(/\s+/);
            if (words.length <= 3 && words[0].match(/^[A-Z]/)) {
              mission = words.join(' ');
            }
          }
        }
        
        if (!mission || mission === vehicle) {
          mission = '';
        }
        
        const currentYear = new Date().getFullYear();
        let fullDateStr = datePart;
        if (!datePart.match(/\d{4}/)) {
          fullDateStr = `${datePart} ${currentYear}`;
        }
        
        const launchDate = parseDate(fullDateStr);
        if (!isNaN(launchDate) && launchDate > 0) {
          currentSection = {
            name: mission || '',
            vehicle: vehicle || '',
            date: launchDate,
            dateStr: fullDateStr,
            provider: '',
            location: '',
            state: '',
            description: '',
            launchTime: '',
            isNET
          };
          
          if (vehicle.match(/Falcon|Starlink/i)) {
            currentSection.provider = 'SpaceX';
          } else if (vehicle.match(/Atlas|Vulcan|Delta/i)) {
            currentSection.provider = 'ULA';
          } else if (vehicle.match(/New Glenn/i)) {
            currentSection.provider = 'Blue Origin';
          } else if (vehicle.match(/Electron/i)) {
            currentSection.provider = 'Rocket Lab';
          } else if (vehicle.match(/Soyuz/i)) {
            currentSection.provider = 'Roscosmos';
          } else if (vehicle.match(/H3/i)) {
            currentSection.provider = 'JAXA';
          }
        } else {
          currentSection = null;
        }
      } else if (currentSection) {
        if (text.includes('Launch time:')) {
          const utcMatch = text.match(/\((\d{4})\s*UTC\)/i);
          if (utcMatch) {
            const utcTime = utcMatch[1];
            currentSection.launchTime = `${utcTime.substring(0, 2)}:${utcTime.substring(2)} UTC`;
          } else {
            const timeMatch = text.match(/Launch time:.*?(Window opens at\s+)?(\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?|AM|PM)?\s*(?:EST|PST|EDT|PDT|UTC|GMT)?)/i);
            if (timeMatch) {
              currentSection.launchTime = (timeMatch[2] || timeMatch[0]).trim();
            }
          }
        } else if (text.includes('Launch site:')) {
          const siteMatch = text.match(/Launch site:\s*(.+?)(?:,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*))?/i);
          if (siteMatch) {
            currentSection.location = siteMatch[1].trim();
            if (siteMatch[2]) {
              const locationPart = siteMatch[2].trim();
              const stateMap: { [key: string]: string } = {
                'Florida': 'FL',
                'California': 'CA',
                'Virginia': 'VA',
                'Texas': 'TX',
                'Kazakhstan': '',
                'Brazil': '',
                'Japan': ''
              };
              currentSection.state = stateMap[locationPart] || '';
            }
          }
        } else if (text.length > 50 && !text.includes('Updated:') && !text.includes('Watch live') && !text.match(/^(Home|News|Archive|Schedule)/i) && !currentSection.description) {
          currentSection.description = text.substring(0, 500).trim();
          
          if (!currentSection.name || currentSection.name === currentSection.vehicle) {
            const starlinkMatch = text.match(/Starlink\s+(\d+-\d+|\d+)/i);
            if (starlinkMatch) {
              currentSection.name = `Starlink ${starlinkMatch[1]}`;
              currentSection.vehicle = 'Falcon 9';
              currentSection.provider = 'SpaceX';
            }
            
            const transporterMatch = text.match(/Transporter[-\s]?(\d+)/i);
            if (transporterMatch) {
              currentSection.name = `Transporter-${transporterMatch[1]}`;
              currentSection.vehicle = 'Falcon 9';
              currentSection.provider = 'SpaceX';
            }
            
            const viaSatMatch = text.match(/ViaSat[-\s]?(\d+)\s*(?:F|Flight)?\s*(\d+)?/i);
            if (viaSatMatch) {
              currentSection.name = `ViaSat-${viaSatMatch[1]}${viaSatMatch[2] ? ` F${viaSatMatch[2]}` : ''}`;
              currentSection.vehicle = 'Atlas 5';
              currentSection.provider = 'ULA';
            }
            
            const escapadeMatch = text.match(/ESCAPADE|EscaPADE/i);
            if (escapadeMatch) {
              currentSection.name = 'EscaPADE';
              currentSection.vehicle = 'New Glenn';
              currentSection.provider = 'Blue Origin';
            }
            
            const spacewardMatch = text.match(/Spaceward/i);
            if (spacewardMatch) {
              currentSection.name = 'Spaceward';
              currentSection.vehicle = 'Hanbit-Nano';
            }
            
            const soyuzMatch = text.match(/Soyuz\s+MS[-\s]?(\d+)(?:\/(\d+))?/i);
            if (soyuzMatch) {
              currentSection.name = `Soyuz MS-${soyuzMatch[1]}${soyuzMatch[2] ? `/${soyuzMatch[2]}` : ''}`;
              currentSection.vehicle = 'Soyuz-2-1a';
              currentSection.provider = 'Roscosmos';
            }
            
            const qzsMatch = text.match(/QZS[-\s]?(\d+)|Michibiki\s+No\.\s*(\d+)/i);
            if (qzsMatch) {
              currentSection.name = `QZS-${qzsMatch[1] || qzsMatch[2]}`;
              currentSection.vehicle = 'H3';
              currentSection.provider = 'JAXA';
            }
            
            const sentinelMatch = text.match(/Sentinel[-\s]?(\d+)([A-Z])?/i);
            if (sentinelMatch) {
              currentSection.name = `Sentinel-${sentinelMatch[1]}${sentinelMatch[2] || ''}`;
              currentSection.vehicle = 'Falcon 9';
              currentSection.provider = 'SpaceX';
            }
            
            if (!currentSection.name && text.match(/A SpaceX Falcon 9 rocket will launch (\d+) Starlink/i)) {
              const starlinkCountMatch = text.match(/launch (\d+) Starlink/i);
              if (starlinkCountMatch) {
                currentSection.name = `Starlink ${starlinkCountMatch[1]}`;
                currentSection.vehicle = 'Falcon 9';
                currentSection.provider = 'SpaceX';
              }
            }
          }
        }
      }
    });
    
    if (currentSection && currentSection.name) {
      const key = `${currentSection.date}-${currentSection.name}`;
      if (!seenLaunches.has(key)) {
        launchSections.push(currentSection);
        seenLaunches.add(key);
      }
    }
    
    const processedLaunches = launchSections
      .filter((launch: any) => {
        if (type === 'past' && launch.date >= now) return false;
        if (type === 'next' && launch.date < now) return false;
        if (!launch.name || launch.name.length < 2) return false;
        if (launch.name.match(/^(Home|News|Archive|Schedule|Mission|Reports|Members|Sign|Live|Shop|Breaking|Search|Sunday|record|broken|late-night|Schedule Mission)/i)) return false;
        if (launch.name.length > 50 && !launch.name.match(/^(Starlink|Transporter|ViaSat|EscaPADE|Spaceward|Soyuz|QZS|Sentinel)/i)) return false;
        return true;
      })
      .map((launch: any): Launch | null => {
        if (!launch.vehicle || launch.vehicle === 'Unknown') {
          const vehicleMatch = launch.name.match(/(Falcon 9|Falcon Heavy|Atlas 5|Atlas V|Delta IV|Electron|Vulcan|New Glenn|Starship|SLS|Artemis|Ariane|Soyuz|Antares|H3|Hanbit-Nano|Soyuz-2-1a)/i);
          if (vehicleMatch) {
            launch.vehicle = vehicleMatch[1];
          } else {
            launch.vehicle = 'Unknown';
          }
        }
        
        if (!launch.provider || launch.provider === 'Unknown') {
          if (launch.vehicle.match(/Falcon|Starlink/i)) {
            launch.provider = 'SpaceX';
          } else if (launch.vehicle.match(/Atlas|Vulcan|Delta/i)) {
            launch.provider = 'ULA';
          } else if (launch.vehicle.match(/New Glenn/i)) {
            launch.provider = 'Blue Origin';
          } else if (launch.vehicle.match(/Electron/i)) {
            launch.provider = 'Rocket Lab';
          } else if (launch.vehicle.match(/Soyuz/i)) {
            launch.provider = 'Roscosmos';
          } else if (launch.vehicle.match(/H3/i)) {
            launch.provider = 'JAXA';
          } else {
            launch.provider = 'Unknown';
          }
        }
        
        const cleanName = launch.name.trim();
        if (!cleanName || cleanName.length < 2) {
          return null;
        }
        
        const t0Value = launch.dateStr + (launch.launchTime ? ' ' + launch.launchTime : '');
        
        return {
          name: cleanName.substring(0, 100),
          provider: launch.provider || 'Unknown',
          vehicle: launch.vehicle || 'Unknown',
          pad: {
            name: launch.location || 'Unknown',
            location: {
              name: launch.location || 'Unknown',
              state: launch.state || ''
            }
          },
          launch_description: launch.description || `Launch of ${cleanName}`,
          formatted_date: formatDate(t0Value),
          t0: t0Value || null,
          date: launch.date.toString()
        };
      })
      .filter((launch): launch is Launch => launch !== null);
    
    const sorted = type === 'past' 
      ? processedLaunches.sort((a, b) => parseInt(b.date) - parseInt(a.date))
      : processedLaunches.sort((a, b) => parseInt(a.date) - parseInt(b.date));
    
    const uniqueLaunches: Launch[] = [];
    const seen = new Set<string>();
    
    for (const launch of sorted) {
      if (launch.name === 'Unknown' || launch.provider === 'Unknown' || launch.vehicle === 'Unknown') {
        continue;
      }
      const key = `${launch.date}-${launch.name}`;
      if (!seen.has(key)) {
        uniqueLaunches.push(launch);
        seen.add(key);
      }
    }
    
    return uniqueLaunches.slice(0, limit);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Spaceflight Now scraping timeout');
    } else {
      console.error('Spaceflight Now scraping error:', error.message);
    }
    return [];
  }
}

async function scrapeAlternativeSource(type: string, limit: number): Promise<Launch[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const url = 'https://www.space.com/launch-calendar';
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const launches: Launch[] = [];
    const now = Date.now() / 1000;
    
    $('article, .launch-calendar-item, .event-item, .card, [class*="launch"], [class*="event"]').each((idx, element) => {
      if (launches.length >= limit * 3) return false;
      
      const $el = $(element);
      const allText = $el.text().trim();
      
      if (allText.length < 30) return;
      
      const title = $el.find('h2, h3, h4, .title, a, strong').first().text().trim() ||
                   allText.split('\n')[0].trim() ||
                   allText.match(/^([A-Z][^•\n]{5,}?)(?:\s*•|\s*\n|$)/m)?.[1]?.trim();
      
      const datePatterns = [
        /([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/,
        /(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/,
        /(\d{1,2}\/\d{1,2}\/\d{4})/,
        /(\d{4}-\d{2}-\d{2})/
      ];
      
      let dateText = $el.find('.date, time, .launch-date, [datetime]').first().attr('datetime') ||
                     $el.find('.date, time, .launch-date').first().text().trim();
      
      if (!dateText) {
        for (const pattern of datePatterns) {
          const match = allText.match(pattern);
          if (match) {
            dateText = match[1];
            break;
          }
        }
      }
      
      if (!title || !dateText || title.length < 5) return;
      
      const launchDate = parseDate(dateText);
      if (isNaN(launchDate) || launchDate === 0) return;
      
      if (type === 'past' && launchDate >= now) return;
      if (type === 'next' && launchDate < now) return;
      
      launches.push({
        name: title.substring(0, 100),
        provider: 'Unknown',
        vehicle: 'Unknown',
        pad: {
          name: 'Unknown',
          location: {
            name: 'Unknown',
            state: ''
          }
        },
        launch_description: `Launch: ${title}`,
        formatted_date: formatDate(dateText),
        t0: dateText,
        date: launchDate.toString()
      });
    });
    
    return type === 'past' 
      ? launches.sort((a, b) => parseInt(b.date) - parseInt(a.date)).slice(0, limit)
      : launches.sort((a, b) => parseInt(a.date) - parseInt(b.date)).slice(0, limit);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Alternative scraping timeout');
    } else {
      console.error('Alternative scraping error:', error.message);
    }
    return [];
  }
}


