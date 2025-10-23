// src/lib/vinted-scraper.ts
import axios from "axios";

export interface VintedListing {
  listingId: string;
  title: string;
  price: string;
  imageUrls: string[];
  listingUrl: string;
}

/**
 * Gebruik de interne Vinted JSON API i.p.v. HTML scraping.
 */
export async function scrapeVintedSearch(searchUrl: string): Promise<VintedListing[]> {
  console.log(`Scraping Vinted API from: ${searchUrl}`);

  try {
    // ⛔️ Strip alles tot de echte API-URL
    const apiUrl = searchUrl
      .replace("vinted.nl/catalog?", "vinted.nl/api/v2/catalog/items?")
      .replace("vinted.com/catalog?", "vinted.com/api/v2/catalog/items?")
      .replace("vinted.fr/catalog?", "vinted.fr/api/v2/catalog/items?")
      .replace("vinted.be/catalog?", "vinted.be/api/v2/catalog/items?")
      .replace("?", "?per_page=20&");

    const response = await axios.get(`https://${apiUrl}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HiddenGemBot/1.0)",
        "Accept": "application/json",
      },
      timeout: 10000,
    });

    const items = response.data?.items ?? [];

    const listings: VintedListing[] = items.map((item: any) => ({
      listingId: item.id.toString(),
      title: item.title,
      price: item.price?.string || `${item.price?.amount} ${item.price?.currency}`,
      imageUrls: item.photos?.map((p: any) => p.url).filter(Boolean) || [],
      listingUrl: `https://www.vinted.nl/items/${item.id}`,
    }));

    console.log(`✅ Found ${listings.length} listings`);
    return listings;
  } catch (error: any) {
    console.error("❌ Error scraping Vinted:", error.message);
    return [];
  }
}

export async function scrapeVintedListing(listingUrl: string): Promise<VintedListing | null> {
  try {
    const itemIdMatch = listingUrl.match(/\/items\/(\d+)/);
    if (!itemIdMatch) {
      throw new Error("Invalid Vinted listing URL");
    }
    const itemId = itemIdMatch[1];
    const apiUrl = `https://www.vinted.nl/api/v2/items/${itemId}`;

    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HiddenGemBot/1.0)",
        "Accept": "application/json",
      },
      timeout: 10000,
    });

    const item = response.data?.item;
    if (!item) {
      return null;
    }

    return {
      listingId: item.id.toString(),
      title: item.title,
      price: item.price?.string || `${item.price?.amount} ${item.price?.currency}`,
      imageUrls: item.photos?.map((p: any) => p.url).filter(Boolean) || [],
      listingUrl: `https://www.vinted.nl/items/${item.id}`,
    };
  } catch (error: any) {
    console.error("❌ Error scraping Vinted listing:", error.message);
    return null;
  }
}
