import fetch from "node-fetch";
import axios from "axios"; // Keep for scrapeVintedSearch
import * as cheerio from "cheerio";

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface VintedListing {
  listingId: string;
  title: string;
  price: string;
  imageUrls: string[];
  listingUrl: string;
}

// This function remains unchanged.
export async function scrapeVintedSearch(searchUrl: string): Promise<VintedListing[]> {
  console.log(`Scraping Vinted search: ${searchUrl}`);
  
  try {
    await delay(2000 + Math.random() * 3000);
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const listings: VintedListing[] = [];

    const scriptTags = $('script').toArray();
    for (const script of scriptTags) {
      const scriptContent = $(script).html();
      if (scriptContent && scriptContent.includes('catalog_items')) {
        try {
          const jsonMatch = scriptContent.match(/"catalog_items"\s*:\s*(\[[\s\S]*?\])/);
          if (jsonMatch) {
            const items = JSON.parse(jsonMatch[1]);
            for (const item of items) {
              if (item.id && item.title) {
                listings.push({
                  listingId: item.id.toString(),
                  title: item.title,
                  price: item.price ? `€${item.price}` : 'Price not available',
                  imageUrls: item.photos?.map((p: any) => p.url || p.full_size_url).filter(Boolean) || [],
                  listingUrl: item.url || `https://www.vinted.com/items/${item.id}`,
                });
              }
            }
          }
        } catch (e) {
          console.error('Error parsing JSON from script tag:', e);
        }
      }
    }

    console.log(`Found ${listings.length} listings from Vinted`);
    return listings;
  } catch (error: any) {
    console.error('Error scraping Vinted:', error.message);
    return [];
  }
}

// This function is now correctly implemented.
export async function scrapeVintedListing(listingUrl: string): Promise<VintedListing | null> {
  console.log(`Scraping single Vinted listing: ${listingUrl}`);
  
  try {
    await delay(2000 + Math.random() * 3000);
    
    // Step 1: Fetch the page content ONCE using node-fetch
    const res = await fetch(listingUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9,nl;q=0.8",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch Vinted page: ${res.status}`);
    const html = await res.text();

    // Step 2: Extract images from the fetched HTML using the new logic
    let images: string[] = [];
    const imgMatches = [...html.matchAll(/<img[^>]+src="(https:[^"]+)"/g)];
    if (imgMatches.length > 0) {
      images = imgMatches.map((m) => m[1]);
    }
    if (images.length === 0) {
      const jsonMatches = [
        ...html.matchAll(/"url":"(https:[^"]+?(?:jpg|jpeg|png|webp))"/g),
      ];
      images = jsonMatches.map((m) => m[1].replace(/\\u002F/g, "/"));
    }
    images = Array.from(new Set(images));
    console.log(`🖼️ Found ${images.length} image(s) for ${listingUrl}`);
    console.log(images.slice(0, 3));

    // Step 3: Use the SAME HTML to extract title, price, and other details
    const $ = cheerio.load(html);
    const listingIdMatch = listingUrl.match(/\/items\/(\d+)/);
    
    if (!listingIdMatch) {
      console.error('Could not extract listing ID from URL');
      return null;
    }

    // Try to get details from the JSON blob in the same HTML
    const scriptTags = $('script').toArray();
    for (const script of scriptTags) {
      const scriptContent = $(script).html();
      if (scriptContent && scriptContent.includes('"item"')) {
        try {
          const jsonMatch = scriptContent.match(/"item"\s*:\s*(\{[\s\S]*?\})/);
          if (jsonMatch) {
            const item = JSON.parse(jsonMatch[1]);
            return {
              listingId: listingIdMatch[1],
              title: item.title || 'Untitled',
              price: item.price ? `€${item.price}` : 'Price not available',
              imageUrls: images, // Use the extracted images
              listingUrl,
            };
          }
        } catch (e) {
          console.error('Error parsing JSON from script tag:', e);
        }
      }
    }

    // Fallback to scraping from HTML if JSON fails
    return {
      listingId: listingIdMatch[1],
      title: $('h1').first().text().trim() || 'Untitled',
      price: $('.price').first().text().trim() || 'Price not available',
      imageUrls: images, // Use the extracted images
      listingUrl,
    };
  } catch (error: any) {
    console.error('Error scraping Vinted listing:', error.message);
    return null;
  }
}