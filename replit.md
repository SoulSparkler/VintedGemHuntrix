# Vinted Hidden Gems Finder

## Overview

An AI-powered web application that automatically monitors Vinted marketplace listings to identify valuable jewelry (gold, silver, pearls, precious stones) that sellers may have undervalued. The system uses GPT-4o-mini vision analysis to detect genuine materials through hallmarks and visual characteristics, sending instant Telegram notifications when high-confidence finds are discovered.

**Core Capabilities:**
- Automated search monitoring with configurable scan intervals
- AI vision analysis of jewelry photos for material authentication
- Real-time Telegram alerts for valuable discoveries
- Manual single-listing analysis tool
- Web dashboard for managing searches and viewing findings

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript, using Vite for build tooling and development

**UI Component System:** 
- Shadcn UI (New York variant) - utility-focused design system
- Radix UI primitives for accessible component foundation
- Tailwind CSS for styling with custom design tokens
- Design philosophy: Linear/Vercel-inspired minimal aesthetic prioritizing clarity and information hierarchy

**State Management:**
- TanStack Query (React Query) for server state management
- Query client configured with no automatic refetching (manual control)
- Local component state for UI interactions

**Routing:** Wouter for client-side routing (lightweight alternative to React Router)

**Key Pages:**
- Dashboard: Overview of active searches and recent findings
- Search Queries: CRUD interface for managing automated Vinted searches
- Findings: History of all 80%+ confidence discoveries
- Manual Scan: Single-listing analysis interface

### Backend Architecture

**Runtime:** Node.js with Express.js server

**API Design:** RESTful endpoints with JSON payloads
- `/api/searches` - Search query CRUD operations
- `/api/findings` - Findings management and retrieval
- `/api/manual-scans` - Manual analysis history
- `/api/analyze-listing` - Single listing analysis endpoint

**Core Services:**

1. **Vinted Scraper** (`server/services/vinted-scraper.ts`)
   - Extracts listing data from Vinted search URLs
   - Implements rate limiting and random user-agent rotation
   - Parses embedded JSON from script tags to extract structured data

2. **AI Vision Analyzer** (`server/services/openai-analyzer.ts`)
   - Uses OpenAI GPT-4o-mini for image analysis
   - Detects hallmarks (925, 585, 750, etc.) and visual material characteristics
   - Returns confidence scores and detailed reasoning
   - Threshold: 80%+ confidence required for valuable classification

3. **Scanner Service** (`server/services/scanner.ts`)
   - Orchestrates automated search monitoring
   - Tracks analyzed listings to prevent duplicates
   - Creates findings and triggers Telegram notifications
   - Implements search-level configuration (frequency, thresholds)

4. **Scheduler** (`server/scheduler.ts`)
   - Cron-based job scheduling (runs hourly)
   - Checks each active search against its scan frequency
   - Auto-deletes expired findings (15-day retention)

**Data Storage Strategy:**
- Abstracted storage interface (`IStorage`) for future database migration
- Current implementation: In-memory storage (`MemStorage`)
- Planned: PostgreSQL with Drizzle ORM (schema defined, migrations ready)

### Database Design (PostgreSQL + Drizzle)

**Schema Tables:**

1. **search_queries** - User-defined Vinted searches
   - Fields: vintedUrl, searchLabel, scanFrequencyHours, confidenceThreshold, isActive, lastScannedAt
   - Primary key: UUID

2. **analyzed_listings** - Deduplication tracking
   - Fields: listingId (unique), searchQueryId, confidenceScore, isValuable, analyzedAt
   - Prevents re-analyzing same listings

3. **findings** - High-confidence valuable items (80%+)
   - Fields: listingUrl, listingTitle, price, confidenceScore, aiReasoning, detectedMaterials (JSONB array)
   - Auto-expires after 15 days via expiresAt timestamp

4. **manual_scans** - History of user-initiated analyses
   - Separate from automated findings
   - No expiration, indefinite history

**ORM Configuration:**
- Drizzle Kit for migrations
- Schema-first approach with Zod validation integration
- Neon Serverless driver for PostgreSQL connection

### Authentication & Authorization

**Current State:** No authentication implemented
- Application designed for single-user/trusted environment use
- All API endpoints publicly accessible

**Security Considerations:**
- Telegram bot token and chat ID stored in environment variables
- OpenAI API key in environment configuration
- Database URL secured via environment variable

## External Dependencies

### Third-Party APIs

1. **OpenAI API** (GPT-4o-mini)
   - Purpose: Vision analysis of jewelry images
   - Configuration: API key via `OPENAI_API_KEY` environment variable
   - Fallback option mentioned: Claude 3.5 Haiku (not implemented)

2. **Telegram Bot API**
   - Purpose: Real-time notifications for valuable finds
   - Configuration: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` environment variables
   - Library: `node-telegram-bot-api`

3. **Vinted Marketplace**
   - Purpose: Source of listing data (web scraping)
   - Method: HTTP requests with Cheerio HTML parsing
   - Rate limiting: 2-5 second delays between requests
   - User-agent rotation to avoid detection

### Infrastructure Services

1. **Database: Neon Serverless PostgreSQL**
   - Configuration: `DATABASE_URL` environment variable
   - Driver: `@neondatabase/serverless`
   - Connection pooling handled by Neon

2. **Build & Development**
   - Vite for frontend bundling and dev server
   - esbuild for backend bundling in production
   - tsx for TypeScript execution in development

### Key Libraries

**Backend:**
- `axios` - HTTP client for Vinted scraping
- `cheerio` - HTML parsing for web scraping
- `node-cron` - Scheduled task execution
- `drizzle-orm` - Type-safe database ORM

**Frontend:**
- `@tanstack/react-query` - Server state management
- `react-hook-form` + `@hookform/resolvers` - Form handling with Zod validation
- `date-fns` - Date formatting utilities
- `class-variance-authority` + `clsx` - Conditional CSS class composition

**Design System:**
- Multiple `@radix-ui/*` packages for accessible primitives
- `tailwindcss` for utility-first styling
- Custom fonts: Inter (UI), JetBrains Mono (monospace)

### Environment Variables Required

```
DATABASE_URL - Neon PostgreSQL connection string
OPENAI_API_KEY - OpenAI API authentication
TELEGRAM_BOT_TOKEN - Telegram bot credentials
TELEGRAM_CHAT_ID - Target chat for notifications
NODE_ENV - Environment flag (development/production)
```