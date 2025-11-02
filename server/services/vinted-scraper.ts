import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

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

export async function scrapeVintedListing(listingUrl: string): Promise<VintedListing | null> {
  console.log(`Scraping single Vinted listing: ${listingUrl}`);
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      if (['image', 'media', 'font', 'stylesheet'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(listingUrl, { waitUntil: 'domcontentloaded' });

    const listingIdMatch = listingUrl.match(/\/items\/(\d+)/);
    if (!listingIdMatch) {
      throw new Error("Could not extract listing ID from URL");
    }
    const listingId = listingIdMatch[1];

    const initialData = await page.evaluate(() => {
      const script = Array.from(document.querySelectorAll('script')).find(s => s.textContent?.includes('window.__INITIAL_DATA__'));
      return script?.textContent;
    });

    if (initialData) {
      const jsonMatch = initialData.match(/window\.__INITIAL_DATA__\s*=\s*(\{.*?\});/s);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[1]);
          const item = jsonData.item.item;
          const imageUrls = item.photos.map((p: any) => p.url).filter(Boolean);
          return {
            listingId,
            title: item.title,
            price: `${item.price.amount} ${item.price.currency}`,
            imageUrls,
            listingUrl,
          };
        } catch (err: any) {
          console.warn("⚠️ JSON parsing failed:", err.message);
        }
      }
    }

    return null;

  } catch (error: any) {
    console.error(`❌ Error scraping ${listingUrl}:`, error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
    // Optional: force garbage collection
    if (global.gc) {
      global.gc();
    }
  }
}
