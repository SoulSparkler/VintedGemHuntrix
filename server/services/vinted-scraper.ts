import fetch from "node-fetch";
import axios from "axios";
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
  
  try {
    const headers = {
      "User-Agent": getRandomUserAgent(),
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    };

    const { data: html } = await axios.get(listingUrl, { headers, timeout: 15000 });
    
    const listingIdMatch = listingUrl.match(/\/items\/(\d+)/);
    if (!listingIdMatch) {
      throw new Error("Could not extract listing ID from URL");
    }
    const listingId = listingIdMatch[1];

    const jsonMatch = html.match(/window\.__INITIAL_DATA__\s*=\s*(\{.*?\});/s);
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

    // Fallback to cheerio if JSON parsing fails
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim() || 'Untitled';
    const price = $('.price-box__price').first().text().trim() || 'Price not available';
    let imageUrls: string[] = [];
    $("img").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && src.includes("vinted.net")) imageUrls.push(src);
    });
    imageUrls = [...new Set(imageUrls)];

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
  }
}