import {
  type SearchQuery,
  type InsertSearchQuery,
  type AnalyzedListing,
  type InsertAnalyzedListing,
  type Finding,
  type InsertFinding,
  type ManualScan,
  type InsertManualScan,
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private searchQueries: Map<string, SearchQuery>;
  private analyzedListings: Map<string, AnalyzedListing>;
  private findings: Map<string, Finding>;
  private manualScans: Map<string, ManualScan>;

  constructor() {
    this.searchQueries = new Map();
    this.analyzedListings = new Map();
    this.findings = new Map();
    this.manualScans = new Map();
  }

  async getSearchQueries(): Promise<SearchQuery[]> {
    return Array.from(this.searchQueries.values());
  }

  async getSearchQuery(id: string): Promise<SearchQuery | undefined> {
    return this.searchQueries.get(id);
  }

  async createSearchQuery(insertQuery: InsertSearchQuery): Promise<SearchQuery> {
    const id = randomUUID();
    const query: SearchQuery = {
      vintedUrl: insertQuery.vintedUrl,
      searchLabel: insertQuery.searchLabel,
      scanFrequencyHours: insertQuery.scanFrequencyHours ?? 3,
      confidenceThreshold: insertQuery.confidenceThreshold ?? 80,
      isActive: insertQuery.isActive ?? true,
      id,
      createdAt: new Date(),
      lastScannedAt: null,
    };
    this.searchQueries.set(id, query);
    return query;
  }

  async updateSearchQuery(id: string, updates: Partial<InsertSearchQuery>): Promise<SearchQuery | undefined> {
    const existing = this.searchQueries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.searchQueries.set(id, updated);
    return updated;
  }

  async deleteSearchQuery(id: string): Promise<boolean> {
    return this.searchQueries.delete(id);
  }

  async updateLastScanned(id: string): Promise<void> {
    const query = this.searchQueries.get(id);
    if (query) {
      query.lastScannedAt = new Date();
      this.searchQueries.set(id, query);
    }
  }

  async getAnalyzedListing(listingId: string): Promise<AnalyzedListing | undefined> {
    return Array.from(this.analyzedListings.values()).find(
      (listing) => listing.listingId === listingId
    );
  }

  async createAnalyzedListing(insertListing: InsertAnalyzedListing): Promise<AnalyzedListing> {
    const id = randomUUID();
    const listing: AnalyzedListing = {
      listingId: insertListing.listingId,
      searchQueryId: insertListing.searchQueryId ?? null,
      confidenceScore: insertListing.confidenceScore,
      isValuable: insertListing.isValuable,
      id,
      analyzedAt: new Date(),
    };
    this.analyzedListings.set(id, listing);
    return listing;
  }

  async getFindings(): Promise<Finding[]> {
    return Array.from(this.findings.values())
      .filter(f => f.expiresAt > new Date())
      .sort((a, b) => b.foundAt.getTime() - a.foundAt.getTime());
  }

  async getFinding(id: string): Promise<Finding | undefined> {
    return this.findings.get(id);
  }

  async createFinding(insertFinding: InsertFinding): Promise<Finding> {
    const id = randomUUID();
    const finding: Finding = {
      listingId: insertFinding.listingId,
      listingUrl: insertFinding.listingUrl,
      listingTitle: insertFinding.listingTitle,
      price: insertFinding.price,
      confidenceScore: insertFinding.confidenceScore,
      aiReasoning: insertFinding.aiReasoning,
      detectedMaterials: Array.from(insertFinding.detectedMaterials, String),
      searchQueryId: insertFinding.searchQueryId ?? null,
      telegramSent: insertFinding.telegramSent ?? false,
      expiresAt: insertFinding.expiresAt,
      id,
      foundAt: new Date(),
    };
    this.findings.set(id, finding);
    return finding;
  }

  async deleteFinding(id: string): Promise<boolean> {
    return this.findings.delete(id);
  }

  async deleteExpiredFindings(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.findings.entries());
    for (const [id, finding] of entries) {
      if (finding.expiresAt <= now) {
        this.findings.delete(id);
      }
    }
  }

  async getManualScans(): Promise<ManualScan[]> {
    return Array.from(this.manualScans.values())
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }

  async createManualScan(insertScan: InsertManualScan): Promise<ManualScan> {
    const id = randomUUID();
    const scan: ManualScan = {
      listingUrl: insertScan.listingUrl,
      listingTitle: insertScan.listingTitle,
      confidenceScore: insertScan.confidenceScore,
      aiReasoning: insertScan.aiReasoning,
      detectedMaterials: Array.from(insertScan.detectedMaterials, String),
      price: insertScan.price ?? null,
      id,
      scannedAt: new Date(),
    };
    this.manualScans.set(id, scan);
    return scan;
  }

  async deleteManualScan(id: string): Promise<boolean> {
    return this.manualScans.delete(id);
  }
}

export const storage = new MemStorage();
