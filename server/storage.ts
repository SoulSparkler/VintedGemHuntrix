import {
  type SearchQuery,
  type InsertSearchQuery,
  type AnalyzedListing,
  type InsertAnalyzedListing,
  type Finding,
  type InsertFinding,
  type ManualScan,
  type InsertManualScan,
  searchQueries,
  analyzedListings,
  findings,
  manualScans
} from "@shared/schema";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, gte, lte } from "drizzle-orm";

// Check for DATABASE_URL. If it's not set, the application will not start.
// This is a safeguard to ensure that the database is properly configured.
if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

// Setup Drizzle client
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema: { searchQueries, analyzedListings, findings, manualScans } });

export interface IStorage {
  // Search Queries
  getSearchQueries(): Promise<SearchQuery[]>;
  getSearchQuery(id: string): Promise<SearchQuery | undefined>;
  createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery>;
  updateSearchQuery(id: string, query: Partial<InsertSearchQuery>): Promise<SearchQuery | undefined>;
  deleteSearchQuery(id: string): Promise<boolean>;
  updateLastScanned(id: string): Promise<void>;

  // Analyzed Listings
  getAnalyzedListing(listingId: string): Promise<AnalyzedListing | undefined>;
  createAnalyzedListing(listing: InsertAnalyzedListing): Promise<AnalyzedListing>;

  // Findings
  getFindings(): Promise<Finding[]>;
  getFinding(id: string): Promise<Finding | undefined>;
  createFinding(finding: InsertFinding): Promise<Finding>;
  deleteFinding(id: string): Promise<boolean>;
  deleteExpiredFindings(): Promise<void>;

  // Manual Scans
  getManualScans(): Promise<ManualScan[]>;
  createManualScan(scan: InsertManualScan): Promise<ManualScan>;
  deleteManualScan(id: string): Promise<boolean>;
}

export class DrizzleStorage implements IStorage {
  async getSearchQueries(): Promise<SearchQuery[]> {
    return await db.select().from(searchQueries).orderBy(desc(searchQueries.createdAt));
  }

  async getSearchQuery(id: string): Promise<SearchQuery | undefined> {
    const result = await db.select().from(searchQueries).where(eq(searchQueries.id, id)).limit(1);
    return result[0];
  }

  async createSearchQuery(insertQuery: InsertSearchQuery): Promise<SearchQuery> {
    const result = await db.insert(searchQueries).values(insertQuery).returning();
    return result[0];
  }

  async updateSearchQuery(id: string, updates: Partial<InsertSearchQuery>): Promise<SearchQuery | undefined> {
    const result = await db.update(searchQueries).set(updates).where(eq(searchQueries.id, id)).returning();
    return result[0];
  }

  async deleteSearchQuery(id: string): Promise<boolean> {
    const result = await db.delete(searchQueries).where(eq(searchQueries.id, id)).returning({ id: searchQueries.id });
    return result.length > 0;
  }

  async updateLastScanned(id: string): Promise<void> {
    await db.update(searchQueries).set({ lastScannedAt: new Date() }).where(eq(searchQueries.id, id));
  }

  async getAnalyzedListing(listingId: string): Promise<AnalyzedListing | undefined> {
    const result = await db.select().from(analyzedListings).where(eq(analyzedListings.listingId, listingId)).limit(1);
    return result[0];
  }

  async createAnalyzedListing(insertListing: InsertAnalyzedListing): Promise<AnalyzedListing> {
    const result = await db.insert(analyzedListings).values(insertListing).returning();
    return result[0];
  }

  async getFindings(): Promise<Finding[]> {
    return await db.select().from(findings).where(gte(findings.expiresAt, new Date())).orderBy(desc(findings.foundAt));
  }

  async getFinding(id: string): Promise<Finding | undefined> {
    const result = await db.select().from(findings).where(eq(findings.id, id)).limit(1);
    return result[0];
  }

  async createFinding(insertFinding: InsertFinding): Promise<Finding> {
    const result = await db.insert(findings).values(insertFinding).returning();
    return result[0];
  }

  async deleteFinding(id: string): Promise<boolean> {
    const result = await db.delete(findings).where(eq(findings.id, id)).returning({ id: findings.id });
    return result.length > 0;
  }

  async deleteExpiredFindings(): Promise<void> {
    await db.delete(findings).where(lte(findings.expiresAt, new Date()));
  }

  async getManualScans(): Promise<ManualScan[]> {
    return await db.select().from(manualScans).orderBy(desc(manualScans.scannedAt));
  }

  async createManualScan(insertScan: InsertManualScan): Promise<ManualScan> {
    const result = await db.insert(manualScans).values(insertScan).returning();
    return result[0];
  }

  async deleteManualScan(id: string): Promise<boolean> {
    const result = await db.delete(manualScans).where(eq(manualScans.id, id)).returning({ id: manualScans.id });
    return result.length > 0;
  }
}

// Export the DrizzleStorage instance, which will be used by the rest of the application.
export const storage = new DrizzleStorage();