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
import { db } from './db';
import { eq, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';

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
    return db.select().from(searchQueries);
  }

  async getSearchQuery(id: string): Promise<SearchQuery | undefined> {
    const result = await db.select().from(searchQueries).where(eq(searchQueries.id, id));
    return result[0];
  }

  async createSearchQuery(insertQuery: InsertSearchQuery): Promise<SearchQuery> {
    const id = randomUUID();
    const result = await db.insert(searchQueries).values({ ...insertQuery, id }).returning();
    return result[0];
  }

  async updateSearchQuery(id: string, updates: Partial<InsertSearchQuery>): Promise<SearchQuery | undefined> {
    const result = await db.update(searchQueries).set(updates).where(eq(searchQueries.id, id)).returning();
    return result[0];
  }

  async deleteSearchQuery(id: string): Promise<boolean> {
    const result = await db.delete(searchQueries).where(eq(searchQueries.id, id));
    return result.rowCount > 0;
  }

  async updateLastScanned(id: string): Promise<void> {
    await db.update(searchQueries).set({ lastScannedAt: new Date() }).where(eq(searchQueries.id, id));
  }

  async getAnalyzedListing(listingId: string): Promise<AnalyzedListing | undefined> {
    const result = await db.select().from(analyzedListings).where(eq(analyzedListings.listingId, listingId));
    return result[0];
  }

  async createAnalyzedListing(insertListing: InsertAnalyzedListing): Promise<AnalyzedListing> {
    const id = randomUUID();
    const result = await db.insert(analyzedListings).values({ ...insertListing, id }).returning();
    return result[0];
  }

  async getFindings(): Promise<Finding[]> {
    return db.select().from(findings).where(gt(findings.expiresAt, new Date()));
  }

  async getFinding(id: string): Promise<Finding | undefined> {
    const result = await db.select().from(findings).where(eq(findings.id, id));
    return result[0];
  }

  async createFinding(insertFinding: InsertFinding): Promise<Finding> {
    const id = randomUUID();
    const result = await db.insert(findings).values({ ...insertFinding, id }).returning();
    return result[0];
  }

  async deleteFinding(id: string): Promise<boolean> {
    const result = await db.delete(findings).where(eq(findings.id, id));
    return result.rowCount > 0;
  }

  async deleteExpiredFindings(): Promise<void> {
    await db.delete(findings).where(gt(new Date(), findings.expiresAt));
  }

  async getManualScans(): Promise<ManualScan[]> {
    return db.select().from(manualScans);
  }

  async createManualScan(insertScan: InsertManualScan): Promise<ManualScan> {
    const id = randomUUID();
    const result = await db.insert(manualScans).values({ ...insertScan, id }).returning();
    return result[0];
  }

  async deleteManualScan(id: string): Promise<boolean> {
    const result = await db.delete(manualScans).where(eq(manualScans.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DrizzleStorage();
