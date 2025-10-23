import * as cron from "node-cron";
import { storage } from "./storage";
import { scanSearchQuery } from "./services/scanner";

let isRunning = false;

async function runScheduledScans() {
  if (isRunning) {
    console.log("⏸ Scan already running, skipping new cycle.");
    return;
  }

  isRunning = true;
  console.log("\n🔍 Running scheduled scans...");

  try {
    const searches = await storage.getSearchQueries();
    const activeSearches = searches.filter((s) => s.isActive);

    for (const search of activeSearches) {
      const now = new Date();
      const hoursSinceLastScan = search.lastScannedAt
        ? (now.getTime() - search.lastScannedAt.getTime()) / (1000 * 60 * 60)
        : Infinity;

      if (hoursSinceLastScan >= search.scanFrequencyHours) {
        console.log(`Scanning: ${search.searchLabel}`);
        await scanSearchQuery(search);

        if (global.gc) global.gc();
        await new Promise(res => setTimeout(res, 2000));
      } else {
        console.log(`Skipping ${search.searchLabel} - scanned ${Math.floor(hoursSinceLastScan)}h ago`);
      }
    }

    await storage.deleteExpiredFindings();
    console.log("✅ Scheduled scans complete\n");
  } catch (error: any) {
    console.error("Error in scheduled scans:", error);
  } finally {
    isRunning = false;
  }
}

export function startScheduler() {
  cron.schedule("0 * * * *", () => {
    runScheduledScans().catch((err) => {
      console.error("Scheduler error:", err);
    });
  });

  console.log("📅 Scheduler started - running every hour");
}
