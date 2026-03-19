# FIELDKIT — Master Handoff Document
**Version:** 1.2 (Jobs-First Architecture Complete)  
**Status:** Frontend Complete — Ready for Backend Integration (Phase 7)  
**Stack:** Next.js 14 · Cloudflare Workers + D1 + R2 · Tailwind CSS · Zustand · PWA  
**Deployment:** Vercel (frontend) · Cloudflare (backend + DB + storage)

---

## 📊 Project Status

**✅ Phases 1-6.5 Complete (Frontend + PWA + Architecture Refactor)**  
All core UI modules are fully functional with the new Jobs-First architecture implemented. The app is a working PWA with localStorage persistence, ready for backend integration.

**✅ Jobs-First Architecture Implemented**  
Jobs are now the primary entity with quotes nested inside them. This matches real-world trades workflows where you create a job first, then generate quotes within that job context.

**⏳ Phase 7 Pending (Backend Integration)**  
Implement Cloudflare D1 database, API routes, and connect frontend stores to real backend endpoints.

---

## 1. Project Overview

FIELDKIT is a free, lightweight operations tool built for small service businesses that do physical work — construction trades (plumbers, painters, flooring installers, electricians, HVAC techs), mobile service providers, print shops, laser engravers, and event crews. It fills the gap between "too simple" (spreadsheets) and "too expensive" (Jobber, ServiceM8, full CRMs).

**Core philosophy:**
- Free forever. No paywalls, no upsells.
- Mobile-first PWA. Works on any device, installable from browser.
- No mandatory account to start — open and use immediately.
- Four focused modules. Nothing more, nothing less.
- A new user should be fully oriented within 2 minutes.
- Built for multi-day jobs, site-based work, and material-intensive projects.

**Typical users:**
- **Plumbers** tracking service calls, water heater installs, and multi-day bathroom renovations
- **Painters** managing interior/exterior jobs, tracking paint inventory, scheduling crews
- **Flooring contractors** quoting materials (sq ft), tracking installs across multiple rooms/days
- **Electricians** managing panel upgrades, rewires, and service calls
- **HVAC techs** scheduling installs, tracking refrigerant and parts inventory
- **General contractors** coordinating multi-trade jobs with clear timelines
- **Mobile mechanics** or any field service business with inventory and scheduling needs

---

## 2. Modules

### 2.1 Jobs (Primary Module)
The central hub for all work. Jobs are created FIRST — then quotes/work orders are generated within them. Designed for both quick service calls and multi-day projects.

**Core workflow:**
1. Client calls → Create Job
2. Generate quote(s) within the job (can have multiple revisions/options)
3. Client accepts quote → Status changes to Scheduled
4. Complete work → Mark job complete

**Fields per job:**
- Job ID (auto-generated, e.g. `JOB-0042`)
- Client name
- Client contact info (phone, email)
- Job title / description
- Site/job address (for field work)
- Status: `Draft` · `Quoted` · `Scheduled` · `In Progress` · `Completed` · `Cancelled`
- Assigned operator (free text or dropdown from team list)
- Start date (for multi-day jobs)
- Due/completion date
- Notes (freeform — use for site access codes, special instructions, material notes)
- **Attached quotes** (1 or more quotes live within the job)

**Features:**
- Kanban-style status board (drag to update status)
- List view with filter by status, assignee, date range
- Tap any job to open detail drawer
- **Quote management within job detail:**
  - View all quotes for this job
  - Create new quote/work order with one tap
  - Accept/decline quotes (status tracking)
  - Download quote PDFs
  - Share quote links
- Mark complete with one tap
- No delete — archive only
- Perfect for tracking multi-day projects (e.g., 3-day flooring install, week-long renovation)
- Site address visible on job card for quick navigation

**Trades use cases:**
- **Plumber:** Create job "Kitchen remodel plumbing" → Generate quote for rough-in → Generate separate quote for finish work → Client accepts → Schedule
- **Painter:** Create job "Exterior — 3-story home" → Generate quote with Option A (standard paint) and Option B (premium paint) → Client picks one → Schedule 5-day timeline
- **Flooring:** Create job "1,200 sq ft LVP install" → Generate quote with material calculations → Client approves → Start work
- **Electrician:** Create job "Panel upgrade + 6 circuits" → Generate quote with permit fees → Add inspector notes to job → Complete

---

### 2.2 Quotes (Nested within Jobs)
Quotes are no longer standalone — they belong to a job. Generate professional estimates directly from job details.

**Quote structure:**
- Quote number (auto-incremented, e.g. QUOTE-0042)
- Linked to parent Job ID
- Client info (inherited from job by default, editable)
- Line items: description · quantity · unit price · line total
- Labor line (separate from materials)
- Notes / terms field (payment terms, timeline, warranty info)
- Subtotal · Tax (optional %) · Total
- Quote status: `Draft` · `Sent` · `Accepted` · `Declined` · `Revised`
- Expiry date (optional)
- Created date

**Output options:**
- Generate shareable link (read-only view at `/quotes/share/:id`)
- Download as PDF
- Mark as accepted (updates parent job status to Scheduled)

**Constraints:**
- No e-signature in v1
- PDF generated client-side (no server rendering required in v1)
- A job can have multiple quotes (revisions, options, change orders)
- Only one quote per job can be marked "Accepted"

**Trades use cases:**
- **Flooring:** Line items for sq ft of material, underlayment, baseboards + labor by sq ft
- **Plumber:** Water heater unit + labor + disposal fee + permit as separate lines
- **Painter:** Gallons of paint (itemized by room/color) + primer + labor by sq ft or flat rate
- **HVAC:** Equipment (furnace, AC unit) + ductwork materials + labor + haul-away
- **Electrician:** Panel, breakers, wire, conduit + labor + permit fees

**Quote navigation:**
- Primary access: Through job detail drawer → "Quotes" tab
- Secondary access: Quotes module shows ALL quotes across all jobs (searchable/filterable by job, client, status)

---

### 2.3 Schedule
Visual calendar of who is doing what and when. Essential for coordinating crews, multi-day jobs, and site visits.

**Views:**
- Week view (default)
- Day view
- List view (upcoming jobs in chronological order)

**Features:**
- Drag job cards to reschedule
- Color-coded by status
- Filter by assignee
- Tap event to open job detail
- No external calendar sync in v1
- Multi-day jobs span across calendar (e.g., Mon-Fri for a 5-day flooring job)
- See crew availability at a glance

**Trades use cases:**
- **Painter crew:** See which jobs are in progress, coordinate helpers across multiple sites
- **Plumber:** Balance emergency calls with scheduled rough-ins and finish work
- **Flooring installer:** Plan material delivery around start dates, avoid double-booking crew
- **Electrician:** Schedule permit inspections and coordinate with general contractor timelines

---

### 2.4 Inventory
Track consumable materials and supplies. Lightweight — no barcodes, no warehouse complexity. Perfect for tracking paint, wire, pipe, flooring stock, fasteners, and other materials used across jobs.

**Fields per item:**
- Item name
- Category (free text or tag)
- Current stock (numeric)
- Unit (e.g. sheets, rolls, oz, units)
- Low stock threshold
- Notes

**Features:**
- Low stock alert badge (visual only, no push notifications in v1)
- Quick-adjust stock: tap + or - to update quantity
- Filter by category
- Log stock adjustments with timestamp (basic audit trail)

**Trades use cases:**
- **Painter:** Track gallons of paint by color/brand, primer, brushes, rollers, drop cloths
- **Plumber:** Track PVC pipe (by size), copper fittings, solder, flux, SharkBite fittings
- **Flooring:** Track boxes of LVP/laminate, underlayment rolls, transition strips, adhesive
- **Electrician:** Rolls of 12/2 and 14/2 wire, wire nuts, receptacles, switches, breakers
- **HVAC:** Refrigerant (by type), filters (by size), condensate pumps, line sets

---

## 3. Technical Architecture

### 3.1 Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State management | Zustand |
| Backend / API | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| File storage | Cloudflare R2 (PDF exports, future attachments) |
| Deployment | Vercel (frontend) |
| PWA | next-pwa or custom service worker |
| PDF generation | react-pdf or jsPDF (client-side, v1) |

### 3.2 Data Model (D1 / SQLite)

```sql
-- Users (optional auth, v2)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at INTEGER
);

-- Team members
CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  created_at INTEGER
);

-- Jobs
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,          -- e.g. JOB-0042
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  site_address TEXT,            -- Job site/location for field work
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',  -- Draft, Quoted, Scheduled, In Progress, Completed, Cancelled
  assignee_id TEXT,
  start_date INTEGER,           -- Unix timestamp (for multi-day jobs)
  due_date INTEGER,             -- Unix timestamp (completion/end date)
  notes TEXT,
  archived INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (assignee_id) REFERENCES team_members(id)
);

-- Quotes (belongs to a job)
CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  quote_number INTEGER UNIQUE,
  job_id TEXT NOT NULL,         -- Parent job (quotes live within jobs)
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  notes TEXT,
  tax_rate REAL DEFAULT 0,
  expiry_date INTEGER,
  status TEXT DEFAULT 'Draft',  -- Draft, Sent, Accepted, Declined, Revised
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Quote line items
CREATE TABLE quote_line_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  type TEXT DEFAULT 'material',  -- material, labor, other
  sort_order INTEGER,
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

-- Schedule events (jobs shown on calendar)
-- Schedule is derived from jobs.due_date + assignee
-- No separate table needed in v1

-- Inventory
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT,                     -- e.g. gallons, rolls, boxes, sq ft, linear ft, pieces, lbs
  current_stock REAL DEFAULT 0,
  low_stock_threshold REAL DEFAULT 0,
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Inventory adjustments log
CREATE TABLE inventory_adjustments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  delta REAL NOT NULL,           -- positive = added, negative = removed
  reason TEXT,
  adjusted_at INTEGER,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id)
);
```

### 3.3 API Routes (Cloudflare Workers)

All routes prefixed with `/api/`

```
GET    /api/jobs              -- list jobs (filter: status, assignee, archived)
POST   /api/jobs              -- create job
GET    /api/jobs/:id          -- get single job with all quotes
PATCH  /api/jobs/:id          -- update job (status, fields)
DELETE /api/jobs/:id          -- archive job (soft delete)

GET    /api/jobs/:id/quotes   -- list all quotes for a specific job
POST   /api/jobs/:id/quotes   -- create quote for a job (inherits client info from job)
PATCH  /api/jobs/:id/quotes/:quoteId           -- update quote
PATCH  /api/jobs/:id/quotes/:quoteId/accept    -- accept quote (updates job status to Scheduled)
PATCH  /api/jobs/:id/quotes/:quoteId/decline   -- decline quote
DELETE /api/jobs/:id/quotes/:quoteId           -- delete quote

GET    /api/quotes            -- list ALL quotes across all jobs (for Quotes module view)
GET    /api/quotes/:id        -- get single quote + line items (for shareable link)

GET    /api/team              -- list team members
POST   /api/team              -- add team member
PATCH  /api/team/:id          -- update team member
DELETE /api/team/:id          -- remove team member

GET    /api/inventory         -- list inventory items
POST   /api/inventory         -- create item
PATCH  /api/inventory/:id     -- update item
POST   /api/inventory/:id/adjust -- log stock adjustment

GET    /api/schedule          -- return jobs with due_date in range (query: from, to)
                               -- includes start_date and due_date for multi-day job rendering
```

### 3.4 PWA Configuration

- Installable on iOS and Android via "Add to Home Screen"
- Offline support: cache static assets + last-loaded data via service worker
- Manifest: name "FIELDKIT", short_name "FIELDKIT", theme color TBD
- No push notifications in v1

---

## 4. UI / UX Principles

- **Mobile-first.** Every screen designed for 390px width first, then scaled up.
- **No emojis.** SVG icons only (Heroicons or Lucide).
- **Dark mode ready.** Use CSS variables / Tailwind dark: classes from the start.
- **Navigation:** Bottom tab bar on mobile (Jobs · Quotes · Schedule · Inventory). Sidebar on desktop.
  - **Jobs:** Primary module — create jobs, manage quotes within job detail
  - **Quotes:** Overview of all quotes across all jobs (quick search/filter)
  - **Schedule:** Calendar view of scheduled jobs
  - **Inventory:** Material/supplies tracking
- **Loading states:** Skeleton loaders, not spinners.
- **Empty states:** Every module has a clear empty state with a prompt to create the first item.
- **Destructive actions:** Confirm before archive. No hard deletes exposed in UI.
- **Color coding for job status:**
  - `Draft` — Light Gray
  - `Quoted` — Gray
  - `Scheduled` — Blue
  - `In Progress` — Amber
  - `Completed` — Green
  - `Cancelled` — Red
- **Quote status badges:**
  - `Draft` — Gray
  - `Sent` — Blue
  - `Accepted` — Green
  - `Declined` — Red
  - `Revised` — Orange

---

## 5. File & Folder Structure

```
fieldkit/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  -- redirect to /jobs
│   ├── jobs/
│   │   ├── page.tsx              -- jobs board/list
│   │   └── [id]/page.tsx         -- job detail with quotes tab
│   ├── quotes/
│   │   ├── page.tsx              -- all quotes overview (cross-job view)
│   │   └── share/
│   │       └── [id]/page.tsx     -- public shareable quote link
│   ├── schedule/
│   │   └── page.tsx
│   ├── inventory/
│   │   └── page.tsx
│   └── api/                      -- Next.js API routes (proxy to CF Workers or direct)
├── components/
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobBoard.tsx          -- kanban
│   │   ├── JobList.tsx
│   │   ├── JobDrawer.tsx         -- with tabs: Details, Quotes, Notes
│   │   └── JobQuotesTab.tsx      -- manage quotes within job
│   ├── quotes/
│   │   ├── QuoteForm.tsx         -- create/edit quote (requires jobId)
│   │   ├── QuoteLineItems.tsx
│   │   ├── QuotePreview.tsx
│   │   └── QuoteCard.tsx         -- for quotes list view
│   ├── schedule/
│   │   ├── WeekView.tsx
│   │   └── DayView.tsx
│   ├── inventory/
│   │   ├── InventoryList.tsx
│   │   └── AdjustStock.tsx
│   └── shared/
│       ├── BottomNav.tsx
│       ├── Sidebar.tsx
│       ├── StatusBadge.tsx
│       ├── EmptyState.tsx
│       └── SkeletonLoader.tsx
├── store/
│   ├── jobStore.ts            -- includes quotes array in job object
│   ├── quoteStore.ts          -- for cross-job quote queries
│   ├── inventoryStore.ts
│   └── scheduleStore.ts
├── lib/
│   ├── api.ts                    -- fetch wrapper
│   ├── db.ts                     -- D1 client (CF Workers)
│   └── pdf.ts                    -- quote PDF generation
├── workers/
│   └── index.ts                  -- Cloudflare Worker entrypoint
├── public/
│   ├── manifest.json
│   └── icons/
├── tailwind.config.ts
├── next.config.ts
└── wrangler.toml
```

---

## 6. Build Phases

### Phase 1 — Foundation (Frontend) ✅ COMPLETE
- [x] Project scaffold: Next.js 14 + Tailwind + Zustand
- [x] Bottom nav + sidebar shell
- [x] Mock data stores (Zustand with localStorage persistence)
- [x] Shared components (StatusBadge, EmptyState, SkeletonLoader, and more)
- [x] Basic layout and navigation working

### Phase 2 — Jobs Module (Initial Build) ✅ COMPLETE
- [x] Jobs list + kanban board (using mock data)
- [x] Create / edit / archive job (local state only)
- [x] Status drag-and-drop (or tap to change)
- [x] Job detail drawer
- [x] All UI working with Zustand + mock data
- [x] Board settings modal
- [x] Create job modal

### Phase 3 — Quote Builder (Initial Build) ✅ COMPLETE
- [x] Quote form with dynamic line items (mock data)
- [x] PDF preview + download (client-side generation with jsPDF)
- [x] Shareable quote link (read-only route at /quotes/share/[id])
- [x] Convert quote → job feature (will be removed in refactor)

### Phase 4 — Schedule ✅ COMPLETE
- [x] Week view calendar
- [x] Jobs plotted by due date + assignee (from mock job data)
- [x] Drag to reschedule
- [x] Day view

### Phase 5 — Inventory ✅ COMPLETE
- [x] Inventory list with low stock badges
- [x] Create / edit items (mock data)
- [x] Quick stock adjust (+ / -)
- [x] Adjustment log view
- [x] Item form modal
- [x] Quick adjust modal

### Phase 6 — Polish + PWA ✅ COMPLETE
- [x] PWA manifest + service worker (sw.js)
- [x] App icons (192px, 512px, SVG variants)
- [x] Install prompt component
- [x] Service worker registration
- [x] Empty states for all modules
- [x] Mobile UX optimized
- [ ] Offline caching (service worker exists but needs testing)
- [ ] Dark mode pass (prepared but needs full implementation)
- [ ] Performance audit

### Phase 6.5 — Jobs-Quotes Architecture Refactor ✅ COMPLETE
**Goal:** Restructure Jobs and Quotes to implement parent-child relationship (Jobs → Quotes)

#### 6.5.1 — Data Model Updates ✅
- [x] Update Job type in jobStore.ts:
  - Add `clientEmail?: string`
  - Add `clientPhone?: string`
  - Add `siteAddress?: string`
  - Add `startDate?: number`
  - Add `quotes: Quote[]` array
  - Add `Draft` to status enum
  - Remove `quoteId` field
- [x] Update Quote type in quoteStore.ts:
  - Add `jobId: string` (required)
  - Add `status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Revised'`
  - Keep existing fields (clientName, clientEmail, clientPhone can override job defaults)

#### 6.5.2 — Job Components Refactor ✅
- [x] Update CreateJobModal.tsx:
  - Add client email input field
  - Add client phone input field
  - Add site address input field
  - Add start date field (for multi-day jobs)
  - Remove quote selection/linking
- [x] Update JobDrawer.tsx:
  - Convert to tabbed interface: Details | Quotes | Notes
  - Details tab: existing job info
  - Quotes tab: new component (see 6.5.3)
  - Notes tab: job notes field
- [x] Update JobCard.tsx:
  - Show site address if present
  - Update status options to include `Draft`
- [x] Update jobStore.ts actions:
  - `addQuoteToJob(jobId, quoteData)` — add quote to job's quotes array
  - `updateJobQuote(jobId, quoteId, data)` — update specific quote
  - `acceptJobQuote(jobId, quoteId)` — mark quote as accepted, update job status to Scheduled
  - `deleteJobQuote(jobId, quoteId)` — remove quote from job

#### 6.5.3 — New Components to Create ✅
- [x] Create `JobQuotesTab.tsx`:
  - Display all quotes for the current job
  - Show quote cards with: quote #, status, total, created date
  - "Create New Quote" button
  - Quote actions: View, Edit, Download PDF, Share, Accept, Decline
  - Only one quote can be "Accepted" at a time
- [x] Create `QuoteCard.tsx`:
  - Compact quote display for list views
  - Shows: quote number, status badge, total, line item count
  - Action buttons: View, Edit, PDF, Share

#### 6.5.4 — Quote Components Refactor ✅
- [x] Update QuoteForm.tsx:
  - Add required `jobId` prop
  - On mount, fetch job data and pre-fill client info
  - Allow overriding client info if needed
  - Add quote status selector (Draft, Sent, Accepted, Declined, Revised)
  - Remove standalone creation mode
- [x] Update app/quotes/page.tsx:
  - Remove "Create New Quote" button (quotes only created from jobs)
  - Update quote list to show job context:
    - Display: "Quote #42 — Job #15: John Smith Kitchen Remodel"
    - Show both quote status AND parent job status
  - Remove standalone quote creation
  - Remove "Convert to Job" button/feature
  - Filter/search by job ID, client name, quote status
- [x] Update quote actions:
  - "Accept Quote" button → calls `acceptJobQuote()` → updates job status to Scheduled
  - "Decline Quote" button → sets quote status to Declined
  - "Revise Quote" → duplicate quote, set status to Revised

#### 6.5.5 — Store Logic Updates ✅
- [x] Update quoteStore.ts:
  - Remove `addQuote()` — quotes now added via jobStore
  - Add `getAllQuotes()` — returns all quotes from all jobs (for /quotes page)
  - Add `getQuotesByJobId(jobId)` — filter quotes by job
  - Update persistence to sync with jobStore (quotes live within jobs)

#### 6.5.6 — Testing & Validation ✅
- [x] Test creating a job with full client info
- [x] Test creating multiple quotes for one job
- [x] Test accepting a quote updates job status
- [x] Test quote PDF generation still works
- [x] Test shareable quote links still work
- [x] Test quotes page shows all quotes with job context
- [x] Test no orphaned quotes can be created
- [x] Verify localStorage persistence works with new structure
- [x] All TypeScript compilation checks pass
- [x] StatusBadge updated to support both JobStatus and QuoteStatus

### Phase 7 — Backend Integration ⏳ NOT STARTED
- [ ] Cloudflare D1 setup + schema migration (use updated schema from section 3.2)
- [ ] Cloudflare Workers API with all routes implemented (use routes from section 3.3)
- [ ] Create wrangler.toml with D1 and R2 bindings
- [ ] Refactor Zustand stores to call real API endpoints
- [ ] Data migration from localStorage mock data to D1
- [ ] Test all CRUD operations end-to-end

---

## 7. Copilot Implementation Notes

- Use `nanoid` for all ID generation (short, URL-safe)
- All timestamps stored as Unix integers (seconds)
- Zustand stores should mirror the API response shape — no transformation layer needed
- Cloudflare Workers use `env.DB` for D1 access via `env.DB.prepare(...).all()`
- Use `wrangler.toml` to bind D1 database and R2 bucket
- PDF generation happens entirely client-side in v1 — no server-side rendering of PDFs
- Quote shareable links: `/quotes/share/:id` — public route, no auth required, read-only
- All list endpoints support optional query params: `status`, `assignee_id`, `from`, `to`, `archived`
- Return paginated results with `limit` + `offset` from the start — default limit 50
- **Multi-day jobs:** Use `start_date` and `due_date` fields. Schedule view should render jobs as spans (not just single-day dots) when start_date differs from due_date
- **Site addresses:** Always display `site_address` on job cards/list items when populated — critical for field crews navigating to job sites
- **Inventory units:** Support flexible units (gallons, rolls, boxes, sq ft, linear ft, pieces, lbs) — no hardcoded dropdown, allow free text input

### Jobs-Quotes Relationship (Architecture v1.1)
- **Jobs are created FIRST, then quotes are generated within them**
- Quote form REQUIRES a `jobId` — quotes cannot exist without a parent job
- When creating a quote, inherit `clientName`, `clientEmail`, `clientPhone` from parent job (pre-fill form, allow editing)
- A job can have multiple quotes (e.g., "Option A" and "Option B", or revisions over time)
- Only one quote per job can have status "Accepted"
- When a quote is accepted, the parent job status should automatically update to "Scheduled"
- Job object in store includes `quotes: Quote[]` array
- Quote object in store includes `jobId: string` reference
- Job drawer has tabs: Details, Quotes, Notes
- Quotes tab shows all quotes for that job + "Create New Quote" button
- Quotes module (`/quotes`) shows ALL quotes across ALL jobs with job context displayed (e.g., "Quote #42 - Job #15 - John Smith Kitchen Remodel")

---

## 8. Phase 6.5 Refactor Game Plan

This section provides a tactical, step-by-step guide to efficiently refactor the Jobs-Quotes architecture.

### 🎯 Refactor Strategy

**Approach:** Bottom-up (data model → components → UI)  
**Estimated Time:** 4-6 hours of focused work  
**Order of Operations:** Stores → Job components → New components → Quote components → Testing

---

### 📋 Step-by-Step Refactor Plan

#### **STEP 1: Update Data Models (Stores)**
**Time: 30-45 minutes**  
**Goal:** Update type definitions and store logic without breaking existing functionality

**1.1 Update `store/jobStore.ts`**
- Add new fields to Job type:
  ```typescript
  clientEmail?: string
  clientPhone?: string
  siteAddress?: string
  startDate?: number
  quotes: Quote[]  // Array of quotes belonging to this job
  ```
- Add `'Draft'` to JobStatus type
- Remove `quoteId?: string` field (quotes now live in array)
- Add new actions:
  - `addQuoteToJob(jobId: string, quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>)`
  - `updateJobQuote(jobId: string, quoteId: string, data: Partial<Quote>)`
  - `acceptJobQuote(jobId: string, quoteId: string)` — sets quote status to Accepted, updates job status to Scheduled
  - `deleteJobQuote(jobId: string, quoteId: string)`
  - `getJobQuotes(jobId: string): Quote[]`

**1.2 Update `store/quoteStore.ts`**
- Add `jobId: string` to Quote type (required field)
- Update QuoteStatus type: `'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Revised'`
- Modify existing actions to work with jobStore:
  - `getAllQuotes()` — iterate through all jobs, collect all quotes
  - `getQuoteById(quoteId: string)` — search through all jobs' quotes
  - Keep `updateQuote()` but have it also update in parent job
- Note: Most quote operations will now be done through jobStore actions

**Why this order:** Start with the data layer to establish the new structure. This lets us gradually migrate components.

---

#### **STEP 2: Update Job Creation Flow**
**Time: 30-45 minutes**  
**Goal:** Add new fields to job creation without breaking existing jobs

**2.1 Update `components/jobs/CreateJobModal.tsx`**
- Add input fields:
  - Client Email (optional)
  - Client Phone (optional)
  - Site Address (optional)
  - Start Date (optional, for multi-day jobs)
- Remove any quote linking/selection UI
- Update form submission to include new fields
- Initialize `quotes: []` (empty array) when creating new job

**2.2 Update `components/jobs/JobCard.tsx`**
- Display site address if present (small text below client name)
- Update status rendering to include `Draft` status (light gray)

**Why this order:** Get the job creation working first so you can create test jobs with the new structure.

---

#### **STEP 3: Refactor Job Drawer to Tabbed Interface**
**Time: 1-1.5 hours**  
**Goal:** Convert single-panel drawer to tabbed interface

**3.1 Update `components/jobs/JobDrawer.tsx`**
- Install or use existing tab component (or build simple tab UI with Tailwind)
- Create three tabs: Details | Quotes | Notes
- **Details Tab:** Move existing job info display here (title, client, status, assignee, dates, description)
- **Notes Tab:** Move notes field here (simple textarea for job notes)
- **Quotes Tab:** Placeholder div for now (we'll build this next)
- Keep edit/delete buttons in the drawer header (applies to job, not tabs)

**Why this order:** Set up the tab structure before building the complex Quotes tab content.

---

#### **STEP 4: Create New Quote Components**
**Time: 1.5-2 hours**  
**Goal:** Build components for displaying and managing quotes within jobs

**4.1 Create `components/quotes/QuoteCard.tsx`**
- Compact card component for displaying a single quote
- Shows:
  - Quote number (e.g., "Quote #0042")
  - Status badge (Draft/Sent/Accepted/Declined/Revised)
  - Total amount ($X,XXX.XX)
  - Line item count
  - Created date
- Action buttons (icon-only):
  - View (eye icon) → opens quote preview
  - Edit (pencil icon) → opens quote form
  - Download PDF (download icon)
  - Share (link icon)
  - Accept (check icon, green) — only show if status is Draft or Sent
  - Decline (X icon, red) — only show if status is Draft or Sent

**4.2 Create `components/jobs/JobQuotesTab.tsx`**
- Display all quotes for the current job using QuoteCard components
- Empty state: "No quotes yet. Create your first quote to send to the client."
- "Create New Quote" button (prominent)
- If job has accepted quote, show notice: "✓ Quote #XX accepted" (with green badge)
- If multiple quotes exist, show them in reverse chronological order (newest first)
- Pass job data to this component so it can:
  - Display quotes from `job.quotes` array
  - Pass `jobId` to quote form when creating new quote
  - Pass client info to pre-fill quote form

**Why this order:** Build the display components before wiring up the form logic.

---

#### **STEP 5: Refactor Quote Form**
**Time: 1-1.5 hours**  
**Goal:** Make quote form require a parent job and inherit client data

**5.1 Update `components/quotes/QuoteForm.tsx`**
- Add required prop: `jobId: string`
- On component mount:
  - Fetch job data from jobStore: `const job = useJobStore(state => state.jobs.find(j => j.id === jobId))`
  - Pre-fill client fields: `clientName: job.clientName`, `clientEmail: job.clientEmail`, `clientPhone: job.clientPhone`
  - Allow user to override any pre-filled field if needed
- Add quote status selector dropdown:
  - Draft (default)
  - Sent
  - (Accepted and Declined should only be set via dedicated buttons, not the form)
- Update form submission:
  - Call `jobStore.addQuoteToJob(jobId, quoteData)` instead of `quoteStore.addQuote()`
  - For edits: call `jobStore.updateJobQuote(jobId, quoteId, data)`
- Remove any standalone quote creation logic

**5.2 Wire up Quote Form in JobQuotesTab**
- "Create New Quote" button opens QuoteForm modal
- Pass `jobId` prop to QuoteForm
- When editing a quote, pass both `jobId` and `quote` props

**Why this order:** Update the form after the display is built so you can immediately test creating quotes from jobs.

---

#### **STEP 6: Update Quotes Module (Overview Page)**
**Time: 45-60 minutes**  
**Goal:** Transform quotes page into cross-job overview

**6.1 Update `app/quotes/page.tsx`**
- Remove "Create New Quote" button from page header
- Update quote list to fetch all quotes: `quoteStore.getAllQuotes()`
- For each quote, display:
  - Quote number and status
  - **Job context:** "Job #XX: Client Name - Job Title"
  - Total amount
  - Created date
- Add job status indicator (secondary badge): "Job Status: Scheduled"
- Click on quote → opens read-only quote preview (or modal)
- Remove "Convert to Job" button/feature from all quote views
- Add filters:
  - Filter by quote status
  - Filter by job (dropdown or search)
  - Search by client name
- Empty state: "No quotes yet. Create a job and add a quote to get started."

**6.2 Update `app/quotes/share/[id]/page.tsx`**
- This page should still work (public shareable quote link)
- Update to fetch quote using `quoteStore.getQuoteById(id)`
- This page is read-only, no changes to quote logic needed

**Why this order:** Do this after the main job-quote flow works so you can see quotes appearing in the overview.

---

#### **STEP 7: Testing & Bug Fixes**
**Time: 1-1.5 hours**  
**Goal:** Verify entire workflow and fix edge cases

**Test Scenarios:**
1. ✅ Create new job with full client info (email, phone, site address)
2. ✅ Open job drawer → Quotes tab → Create new quote
3. ✅ Verify client info is pre-filled in quote form
4. ✅ Add line items and save quote
5. ✅ Verify quote appears in job's Quotes tab
6. ✅ Create second quote for same job
7. ✅ Accept one quote → verify job status changes to Scheduled
8. ✅ Try to accept second quote → should warn "only one quote can be accepted"
9. ✅ Generate PDF for quote → verify it works
10. ✅ Generate shareable link → verify public page loads
11. ✅ Go to Quotes module → verify all quotes shown with job context
12. ✅ Edit a quote from job drawer → verify changes persist
13. ✅ Delete a quote → verify it's removed from job
14. ✅ Refresh page → verify localStorage persistence works

**Common Issues to Watch For:**
- Quote IDs must be globally unique (not just unique per job)
- Accepting a quote should disable accept buttons on other quotes for that job
- Client info overrides in quote form should be allowed but clearly marked
- localStorage sync between jobStore and quoteStore — ensure no duplicate data

---

### ⚡ Efficiency Tips

1. **Work in branches:** Create a feature branch `refactor/jobs-quotes-architecture` to avoid breaking main
2. **Test incrementally:** After each step, run the app and verify that step works before moving on
3. **Keep mock data:** Add a few test jobs with multiple quotes each to quickly test scenarios
4. **Document breaking changes:** Note any localStorage structure changes so users know data might need migration
5. **TypeScript first:** Let TypeScript errors guide you to all the places that need updating

---

### 🔄 Migration Notes

**For Existing Users (when implementing):**
- Existing quotes in localStorage will need migration script
- Convert standalone quotes to jobs with embedded quotes
- For quotes without a job, create a "draft job" as parent
- Alternatively: show migration prompt to user and let them assign quotes to jobs manually

---

## 9. Bonus Features Implemented

Beyond the core v1 scope, the following utility features have been added:

### Business Card Generator
- Component: `BusinessCardGeneratorModal.tsx`
- Store: `businessCardStore.ts`
- Generate digital business cards with QR codes
- Export as image for sharing

### QR Code Generator
- Component: `QRCodeGeneratorModal.tsx`
- Generate QR codes for quotes, job links, or custom URLs
- Quick-access utility in settings or tools menu

### Short URL Generator
- Component: `ShortURLGeneratorModal.tsx`
- Create shortened URLs for sharing quotes and jobs
- Useful for SMS and printed materials

### Settings Modal
- Component: `SettingsModal.tsx`
- Store: `settingsStore.ts`
- Centralized app configuration
- Business profile settings
- Theme preferences

These features enhance the shareability and professional presentation of quotes and business information without adding complexity to the core workflows.

---

## 10. Out of Scope (v1)

- User authentication / accounts
- Push notifications
- Email sending
- External calendar sync (Google Calendar, etc.)
- Client portal
- Payment processing
- Multi-tenant / team sharing via invite
- Barcode / QR scanning for inventory
- Photo attachments on jobs

---

## 11. Future Considerations (v2+)

- Optional account creation for cloud sync across devices
- Team sharing via invite link
- Client-facing portal (job status + quote approval)
- Push notifications for low stock and upcoming jobs
- Integrations: Stripe for invoicing, Google Calendar sync
- White-label / cloneable version for other builders

---

## 12. Copilot Prompt

> You are helping build FIELDKIT — a free, lightweight operations PWA for small service businesses, with a focus on construction trades (plumbers, painters, flooring installers, electricians, HVAC techs) and other physical/field work providers. The stack is Next.js 14 (App Router), Tailwind CSS, Zustand, Cloudflare Workers, Cloudflare D1, and Cloudflare R2. Frontend deploys to Vercel; backend runs on Cloudflare Workers.
>
> This document is the single source of truth. Follow the data model, API routes, file structure, and build phases exactly as specified. Do not add features beyond what is described in v1 scope. Do not use emojis anywhere in the UI — SVG icons only (Heroicons or Lucide). Mobile-first on every component. Ask before making architectural decisions not covered in this document.
>
> **Target users:** Think construction trades workflows — multi-day jobs, site addresses, material tracking (paint, wire, pipe, flooring), crew scheduling, and quick itemized quotes (materials + labor). Every feature should work equally well for a one-person plumber or a three-person painting crew.
>
> **Build approach:** Frontend-first with mock data. Start with Phase 1: scaffold the Next.js project, configure Tailwind, set up Zustand stores with mock data and localStorage persistence, build the navigation shell (bottom nav + sidebar), and create shared components. Get the UI working visually with local state before connecting to D1 and Cloudflare Workers (Phase 7). Confirm completion of each phase before moving to the next.