import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export interface VintedListing {
  listingId: string;
  title: string;
  price: string;
  imageUrls: string[];
  listingUrl: string;
}

export async function scrapeVintedSearch(searchUrl: string): Promise<VintedListing[]> {
  console.log(`Scraping Vinted search with Puppeteer: ${searchUrl}`);
  const browser = await puppeteer.launch({ headless: true, args: ["--disable-dev-shm-usage"] });
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());

  try {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const t = req.resourceType();
      if (t === 'image' || t === 'font' || t === 'stylesheet' || t === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    const content = await page.content();
    const $ = cheerio.load(content);
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
  } finally {
    await page.close();
    await browser.close();
    global.gc?.();
  }
}

export async function scrapeVintedListing(listingUrl: string): Promise<VintedListing | null> {
  console.log(`Scraping single Vinted listing with Puppeteer: ${listingUrl}`);
  const browser = await puppeteer.launch({ headless: true, args: ["--disable-dev-shm-usage"] });
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());

  try {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const t = req.resourceType();
      if (t === 'image' || t === 'font' || t === 'stylesheet' || t === 'media') {
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

    const imageUrls = await page.$$eval("img", imgs => imgs.map(i => i.src).slice(0, 4));

    const content = await page.content();
    const $ = cheerio.load(content);
    const title = $('h1').first().text().trim() || 'Untitled';
    const price = $('.price-box__price').first().text().trim() || 'Price not available';

    return {
      listingId,
      title,
      price,
      imageUrls,
      listingUrl,
    };
  } catch (error: any) {
    console.error(`❌ Error scraping ${listingUrl}:`, error.message);
    return null;
  } finally {
    await page.close();
    await browser.close();
    global.gc?.();
  }
}
