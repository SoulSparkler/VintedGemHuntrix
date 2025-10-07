# Vinted Hidden Gems Finder - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Modern Utility-Focused Pattern  
**Reference:** Linear, Vercel, and Shadcn UI design patterns  
**Justification:** This is a data-monitoring and productivity tool where clarity, efficiency, and information hierarchy are paramount. The spec explicitly requests "clean, minimal UI - focus on functionality over aesthetics."

**Key Design Principles:**
- **Clarity First:** Every element serves a functional purpose
- **Information Hierarchy:** Clear visual distinction between primary actions and supporting content
- **Scannable Layouts:** Users should quickly locate search queries, findings, and alerts
- **Reliable Consistency:** Predictable patterns across all interfaces

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: `222 5% 11%` (deep charcoal)
- Surface: `222 5% 15%` (elevated panels)
- Border: `222 5% 25%` (subtle dividers)
- Text Primary: `0 0% 95%` (high contrast)
- Text Secondary: `0 0% 65%` (muted)
- Primary: `142 76% 45%` (vibrant green for success/found items)
- Accent: `47 96% 53%` (amber for alerts/warnings)
- Destructive: `0 72% 51%` (red for delete actions)

**Light Mode:**
- Background: `0 0% 100%` (pure white)
- Surface: `0 0% 98%` (subtle gray)
- Border: `0 0% 90%` (light dividers)
- Text Primary: `0 0% 10%`
- Text Secondary: `0 0% 45%`
- Primary: `142 76% 35%` (darker green)
- Accent: `38 92% 50%` (amber)
- Destructive: `0 72% 51%` (red)

**Status Colors:**
- Success/Valuable Find: Green (`142 76% 45%`)
- Pending/Scanning: Amber (`47 96% 53%`)
- Low Confidence: Gray (`0 0% 50%`)

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - for body text and UI elements
- Monospace: 'JetBrains Mono' (Google Fonts) - for listing IDs, confidence scores, URLs

**Type Scale:**
- Headings H1: 2.25rem (36px), font-semibold
- Headings H2: 1.5rem (24px), font-semibold  
- Headings H3: 1.25rem (20px), font-medium
- Body Large: 1rem (16px), font-normal
- Body: 0.875rem (14px), font-normal
- Caption: 0.75rem (12px), font-normal
- Monospace elements: 0.8125rem (13px), font-mono

### C. Layout System

**Spacing Primitives (Tailwind units):**
- Core spacing set: 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4 or p-6
- Section gaps: gap-6 or gap-8
- Page margins: px-6 lg:px-8
- Vertical rhythm: space-y-6 or space-y-8

**Grid Structure:**
- Container: max-w-7xl mx-auto
- Dashboard layout: 2-column on lg+ (sidebar + main content)
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Table views: full-width with horizontal scroll on mobile

### D. Component Library

**Navigation & Layout:**
- Top bar: Fixed header with app title, Telegram connection status indicator, theme toggle
- Sidebar (desktop): Search query management, quick stats, navigation menu
- Mobile: Bottom sheet navigation or collapsible hamburger menu

**Search Query Management:**
- Add Query Form: Single-column form with labeled inputs, primary action button, secondary "Cancel" option
- Query Cards: Display URL, scan frequency, confidence threshold, enable/disable toggle, last scanned timestamp, edit/delete actions
- Status Indicators: Pill badges showing "Active", "Paused", "Scanning Now" with color coding

**Findings Display:**
- Findings Table: Responsive table with columns: Thumbnail, Title, Price, Confidence Score, Detected Materials, Actions
- Confidence Score: Progress bar visual (0-100%) with color gradient (red → amber → green)
- AI Reasoning: Expandable accordion or modal on row click
- Material Tags: Pill badges for detected materials (e.g., "14K Gold", "925 Silver", "Real Pearl")

**Manual Scan Interface:**
- Input Section: Large URL input field with "Analyze Now" prominent button
- Results Card: Immediate display below input with confidence score meter, detected materials, AI reasoning in expandable section
- History List: Compact cards showing past manual scans (scanned_at timestamp, quick view)

**Form Elements:**
- Input Fields: Consistent border, focus ring, clear labels above fields
- Dropdowns: Native select styled with consistent appearance
- Toggles: Switch component for enable/disable states
- Buttons: Primary (filled), Secondary (outline), Ghost (text-only), Destructive (red)

**Data Displays:**
- Empty States: Centered icon + message (e.g., "No findings yet. Add a search query to get started.")
- Loading States: Skeleton loaders for tables/cards, spinner for actions
- Error States: Alert banner with icon and dismissible close button

**Overlays:**
- Modals: For confirmations (delete query, clear history), centered with backdrop blur
- Toast Notifications: Bottom-right corner for action confirmations ("Search query added", "Scan triggered")
- Tooltips: Minimal, small font, appearing on hover for helper text

### E. Animations

**Use sparingly:**
- Skeleton loading: Subtle shimmer effect during data fetch
- Toggle switches: Smooth transition between states
- Table row hover: Gentle background color shift
- NO scroll animations, parallax, or decorative motion
- Focus on instant feedback for user actions

---

## Page-Specific Layouts

### Dashboard Home
- Hero section: NOT applicable (utility tool)
- 2-column grid: Active Queries (left 60%) + Quick Stats sidebar (right 40%)
- Below: Recent Findings table (full-width)
- Mobile: Stack to single column

### Search Queries Page
- Page header with "Add New Query" primary button (top-right)
- Grid of query cards (3 columns on desktop, stack on mobile)
- Each card: compact, scannable, actions visible on hover/focus

### Findings History Page
- Filters bar: Date range, confidence threshold slider, material type multi-select
- Sortable table: sticky header, pagination at bottom
- Row click: Opens detailed modal with all listing info and AI analysis

### Manual Scan Page
- Centered layout (max-w-3xl)
- Prominent URL input at top
- Results appear directly below input (no page navigation)
- Scan history list: chronological, most recent first

---

## Images

**No hero images required** - This is a utility dashboard, not a marketing site. Use iconography and data visualizations instead:
- Empty state illustrations: Simple line-art SVG icons (from Heroicons or Lucide)
- Listing thumbnails: Fetched from Vinted (small, square, consistent sizing)
- No decorative imagery needed

---

**Implementation Priority:** Build components in this order:
1. Layout shell (header, sidebar, main content area)
2. Search query management (add/edit/delete forms and cards)
3. Findings table with expandable details
4. Manual scan interface
5. Empty/loading/error states for all sections