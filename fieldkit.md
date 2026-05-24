# FIELDKIT — Master Handoff Document
**Version:** 3.0 (Feature-Complete — Production Live)  
**Status:** ~98% Complete — Backend integrated, Clerk auth live, all modules shipping, zero native dialogs, public quote share working  
**Stack:** Next.js 14 · Cloudflare Workers + D1 · Tailwind CSS · Zustand · Clerk Auth · PWA  
**Deployment:** Vercel (frontend) · Cloudflare Workers + D1 (backend + DB)  
**Live Domain:** `get-fieldkit.com`  
**Latest Commit:** `bc6281d` on `main`  
**Roadmap:** See [ROADMAP.md](./ROADMAP.md) for all remaining bugs and planned features.
**Roadmap:** See [ROADMAP.md](./ROADMAP.md) for all remaining work, bugs, and planned features.

---

## 📊 Project Status

### Overall: ~98% Complete

| Area | Status | % |
|---|---|---|
| Jobs module (kanban, drawer, CRUD) | ✅ Complete | 100% |
| Quotes (nested in jobs, send/draft, share link, PDF) | ✅ Complete | 100% |
| Public quote share (cross-device, API-backed) | ✅ Complete | 100% |
| Quote line items (discount + deposit types, totals) | ✅ Complete | 100% |
| Invoicing (per-job, overdue filter, mark paid, PDF) | ✅ Complete | 100% |
| Materials tab (manual + auto-populated from quotes) | ✅ Complete | 100% |
| Inventory (personal stock, auto-deduct on job use) | ✅ Complete | 100% |
| Expenses tab | ✅ Complete | 100% |
| Time Log tab | ✅ Complete | 100% |
| Clients module (multi-property, create job from client) | ✅ Complete | 100% |
| Team module | ✅ Complete | 100% |
| Schedule (week/day/month views) | ✅ Complete | 100% |
| Branding Studio (identity, palette, asset generators) | ✅ Complete | 100% |
| Backend (Cloudflare Workers + D1) | ✅ Complete | 100% |
| Auth (Clerk — production keys, live domain) | ✅ Complete | 100% |
| PWA (service worker, installable) | ✅ Complete | 100% |
| Dashboard (metrics, quick actions, outstanding invoices) | ✅ Complete | 100% |
| UX polish (no native dialogs, double-tap confirm) | ✅ Complete | 100% |

---

## 🧠 One-Paragraph Description

FIELDKIT is a free, mobile-first operations platform built for solo tradespeople and small service crews — think plumbers, painters, electricians, flooring contractors, and HVAC techs. It replaces the patchwork of spreadsheets, text messages, and paper invoices with one tool that handles the full job lifecycle: create a job, build a quote with line items (including discounts and deposits), send a shareable quote link to the client, convert it to an invoice, track payments, log materials used and pull from personal inventory, record expenses and time, and schedule the work on a visual calendar — all from a phone. It's not a CRM, it's not a project manager, it's the bare minimum a field service business needs to look professional and stay organized without paying $80/month for software that's overkill.

---

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
- **Invoices tab** — generate and track invoices + payments per job
- **Materials tab** — log actual material costs per job (compare vs quoted)
- **Expenses tab** — record job-specific expenses (permits, subcontractors, disposal, etc.)
- **Time tab** — log time entries per team member per job
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

### 2.5 Clients
Dedicated client management module. Clients are extracted/migrated from existing job data and can be independently managed.

**Fields per client:**
- Client name
- Email
- Phone
- Address
- Notes (freeform)
- Tags (for categorization)

**Features:**
- Search clients by name, email, or phone
- View all jobs associated with a client
- Create/edit/delete clients
- Auto-migration from existing job data on first load
- Client drawer with full details and linked jobs

---

### 2.6 Team
Manage team members for scheduling, assignment, and labor cost calculations.

**Fields per team member:**
- Name
- Role (e.g., "Lead Plumber", "Electrician", "Helper")
- Hourly rate (for labor cost calculations in Time Log)
- Phone (optional)
- Email (optional)
- Color (for calendar/visual identification — auto-assigned from palette)
- Active / Inactive toggle

**Features:**
- Add, edit, deactivate, or remove team members
- Search members by name or role
- Filter active vs all members
- Hourly rate used by Time Log to calculate labor costs per job
- Color coding flows through to schedule calendar

---

### 2.7 Branding Studio
A full brand identity toolkit for generating professional business materials without a designer.

**Foundation tools:**
- **Brand Identity** — set business name, tagline, logo (upload), logo position, business contact info, and document footer text
- **Color Palette** — define primary, secondary, text, background, border, and accent colors with hex picker
- **Typography** — choose font family and set size scale (title, heading, body, small)
- **Layout** — choose document layout type: Classic · Modern · Minimal · Bold

**Asset generators:**
- **Email Signature** — branded HTML email signature using brand identity
- **Letterhead** — printable letterhead template using brand colors and logo
- **Social Media Graphics** — post/banner graphics pre-styled with brand
- **Business Card** — digital business card generator with theme options (light/dark/blue)
- **QR Code** — generate QR codes for quotes, job links, or custom URLs
- **Short URL** — create shortened URLs for sharing quotes and jobs

**Branding Presets:**
- Save named presets for different brands or clients
- Switch between presets without losing other settings
- Default preset applies to all PDF documents (quotes, invoices, letterhead)

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

-- Clients (managed independently; migrated from job data)
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  tags TEXT,                     -- JSON array
  created_at INTEGER,
  updated_at INTEGER
);

-- Invoices (generated from accepted quotes)
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  invoice_number INTEGER UNIQUE,
  job_id TEXT NOT NULL,
  quote_id TEXT,
  amount_due REAL NOT NULL,
  amount_paid REAL DEFAULT 0,
  status TEXT DEFAULT 'Unpaid',  -- Unpaid, Partial, Paid, Overdue
  due_date INTEGER,
  issued_at INTEGER,
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

-- Payments (linked to invoices)
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,           -- Cash, Check, Credit Card, Bank Transfer, Other
  payment_date INTEGER,
  notes TEXT,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Job materials (actual costs vs quoted)
CREATE TABLE job_materials (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  inventory_item_id TEXT,        -- optional link to inventory
  description TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_cost REAL NOT NULL,
  total_cost REAL NOT NULL,
  used_at INTEGER,
  notes TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);

-- Expenses (job-specific or overhead)
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  job_id TEXT,                   -- NULL for general overhead
  category TEXT NOT NULL,        -- Permits, Subcontractor, Equipment Rental, Disposal, Tools, Vehicle, Insurance, Utilities, Other
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  expense_date INTEGER,
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Time entries (per job, per team member)
CREATE TABLE time_entries (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  team_member_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,              -- NULL if still running
  duration INTEGER,              -- minutes
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (team_member_id) REFERENCES team_members(id)
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

GET    /api/public/quotes/:id -- PUBLIC (no auth) -- get quote + line items by ID for share page

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

GET    /api/clients            -- list clients
POST   /api/clients            -- create client
GET    /api/clients/:id        -- get single client
PATCH  /api/clients/:id        -- update client
DELETE /api/clients/:id        -- delete client
GET    /api/clients/:id/jobs   -- list jobs for a client

GET    /api/invoices           -- list all invoices (filter: status, job_id)
POST   /api/invoices           -- create invoice
GET    /api/invoices/:id       -- get invoice with payments
PATCH  /api/invoices/:id       -- update invoice
DELETE /api/invoices/:id       -- delete invoice
POST   /api/invoices/:id/payments     -- record payment
DELETE /api/invoices/:id/payments/:paymentId  -- remove payment

GET    /api/jobs/:id/materials        -- list material costs for job
POST   /api/jobs/:id/materials        -- add material cost
PATCH  /api/jobs/:id/materials/:matId -- update material cost
DELETE /api/jobs/:id/materials/:matId -- remove material cost

GET    /api/expenses           -- list expenses (filter: job_id, category)
POST   /api/expenses           -- create expense
PATCH  /api/expenses/:id       -- update expense
DELETE /api/expenses/:id       -- delete expense

GET    /api/time-entries       -- list time entries (filter: job_id, member_id)
POST   /api/time-entries       -- create time entry
PATCH  /api/time-entries/:id   -- update time entry (stop timer, edit)
DELETE /api/time-entries/:id   -- delete time entry
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
- **Navigation:** Bottom tab bar on mobile (Jobs · Quotes · Schedule · Inventory). Sidebar on desktop includes all modules.
  - **Sidebar (desktop):** Dashboard · Jobs · Clients · Team · Quotes · Schedule · Inventory · Branding Studio
  - **Bottom nav (mobile):** Jobs · Quotes · Schedule · Inventory (primary 4)
  - **Jobs:** Primary module — create jobs, manage quotes within job detail
  - **Clients:** Dedicated client management and history
  - **Team:** Team member management for scheduling and labor tracking
  - **Quotes:** Overview of all quotes across all jobs (quick search/filter)
  - **Schedule:** Calendar view of scheduled jobs (Week / Day / Month views)
  - **Inventory:** Material/supplies tracking
  - **Branding Studio:** Brand identity toolkit and asset generators
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
│   │   └── page.tsx              -- jobs board/list (kanban + list view)
│   ├── quotes/
│   │   ├── page.tsx              -- all quotes overview (cross-job view)
│   │   └── share/
│   │       └── [id]/page.tsx     -- public shareable quote link
│   ├── clients/
│   │   └── page.tsx              -- client list + client drawer
│   ├── team/
│   │   └── page.tsx              -- team member management
│   ├── schedule/
│   │   └── page.tsx              -- week/day/month calendar
│   ├── inventory/
│   │   └── page.tsx              -- inventory list + adjustment log
│   └── branding/
│       └── page.tsx              -- branding studio (identity, colors, typography, generators)
├── components/
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobBoard.tsx          -- kanban
│   │   ├── JobList.tsx
│   │   ├── JobDrawer.tsx         -- 7-tab drawer: Details | Quotes | Invoices | Materials | Expenses | Time | Notes
│   │   ├── JobQuotesTab.tsx      -- quotes management within job
│   │   ├── InvoicesTab.tsx       -- invoice + payment tracking within job
│   │   ├── MaterialsTab.tsx      -- actual material costs within job
│   │   ├── ExpensesTab.tsx       -- expense tracking within job
│   │   ├── TimeLog.tsx           -- time entry log within job
│   │   ├── CreateJobModal.tsx
│   │   └── BoardSettingsModal.tsx
│   ├── quotes/
│   │   ├── QuoteForm.tsx         -- create/edit quote (requires jobId)
│   │   ├── QuoteLineItems.tsx
│   │   ├── QuotePreview.tsx
│   │   └── QuoteCard.tsx         -- compact quote card for list view
│   ├── clients/
│   │   └── ClientDrawer.tsx      -- client detail + linked jobs
│   ├── schedule/
│   │   ├── WeekView.tsx
│   │   ├── DayView.tsx
│   │   └── MonthView.tsx
│   ├── inventory/
│   │   ├── ItemFormModal.tsx
│   │   ├── QuickAdjustModal.tsx
│   │   └── AdjustmentLog.tsx
│   ├── branding/
│   │   ├── BrandingModal.tsx
│   │   ├── BrandIdentityEditor.tsx
│   │   ├── ColorPaletteEditor.tsx
│   │   ├── TypographyEditor.tsx
│   │   ├── AssetGeneratorPanel.tsx
│   │   └── generators/
│   │       ├── EmailSignatureGenerator.tsx
│   │       ├── LetterheadGenerator.tsx
│   │       └── SocialMediaGenerator.tsx
│   └── shared/
│       ├── BottomNav.tsx
│       ├── Sidebar.tsx
│       ├── StatusBadge.tsx
│       ├── EmptyState.tsx
│       ├── SkeletonLoader.tsx
│       ├── GlobalSearch.tsx
│       ├── SettingsModal.tsx
│       ├── InstallPrompt.tsx
│       ├── ServiceWorkerRegistration.tsx
│       ├── CollapsibleSection.tsx
│       ├── ClientSelector.tsx
│       ├── BrandingPresetsModal.tsx
│       ├── BusinessCardGeneratorModal.tsx
│       ├── QRCodeGeneratorModal.tsx
│       └── ShortURLGeneratorModal.tsx
├── store/
│   ├── jobStore.ts               -- jobs with embedded quotes array
│   ├── quoteStore.ts             -- cross-job quote queries
│   ├── clientStore.ts            -- client management + migration
│   ├── teamStore.ts              -- team members + hourly rates
│   ├── invoiceStore.ts           -- invoices + payments
│   ├── materialCostStore.ts      -- actual material costs per job
│   ├── expenseStore.ts           -- job and overhead expenses
│   ├── timeEntryStore.ts         -- time logging per job/member
│   ├── inventoryStore.ts         -- inventory items + adjustments
│   ├── brandingStore.ts          -- brand identity + presets
│   ├── businessCardStore.ts      -- business card profiles
│   ├── settingsStore.ts          -- app settings + business profile
│   └── boardSettingsStore.ts     -- kanban column configuration
├── lib/
│   ├── pdf.ts                    -- quote PDF generation (client-side)
│   └── validation.ts             -- shared form validation helpers
├── public/
│   ├── manifest.json
│   ├── sw.js                     -- service worker
│   └── logo.svg
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
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

### Phase 6.6 — Clients Module ✅ COMPLETE
- [x] `store/clientStore.ts` — Client type, CRUD actions, search, `migrateFromJobs()` helper
- [x] `app/clients/page.tsx` — Client list with search, create/edit modal, EmptyState
- [x] `components/clients/ClientDrawer.tsx` — Client detail drawer with linked jobs
- [x] Auto-migration: on first load with no clients, extract unique client records from existing job data
- [x] `ClientSelector.tsx` shared component for use in job/quote forms

### Phase 6.7 — Team Module ✅ COMPLETE
- [x] `store/teamStore.ts` — TeamMember type with hourly rates and color coding, CRUD + toggle active
- [x] `app/team/page.tsx` — Team list with search, create/edit modal, active/inactive filter, EmptyState
- [x] Auto-assigns color from predefined palette when adding a new member
- [x] Hourly rates feed into Time Log labor cost calculations

### Phase 6.8 — Job Financial Tracking Tabs ✅ COMPLETE
**Goal:** Add Invoices, Materials, Expenses, and Time Log tabs to the Job Drawer

- [x] `store/invoiceStore.ts` — Invoice + Payment types, CRUD, payment operations, status auto-update, `getOverdueInvoices()`, `getTotalOutstanding()`
- [x] `store/materialCostStore.ts` — JobMaterial type, CRUD, `calculateJobMaterialCost()`, inventory item linking
- [x] `store/expenseStore.ts` — Expense type with categories, CRUD, job vs overhead split, `calculateJobExpenses()`
- [x] `store/timeEntryStore.ts` — TimeEntry type, start/stop timer, `calculateJobTotalHours()`, `calculateJobLaborCost()`
- [x] `components/jobs/InvoicesTab.tsx` — Invoice list + create invoice, payment recording, status badges
- [x] `components/jobs/MaterialsTab.tsx` — Material cost log for job, add/edit/delete entries
- [x] `components/jobs/ExpensesTab.tsx` — Expense log for job, categorized, add/edit/delete
- [x] `components/jobs/TimeLog.tsx` — Time entry log, start/stop timer, team member assignment, hours summary
- [x] JobDrawer updated to 7-tab layout: Details | Quotes | Invoices | Materials | Expenses | Time | Notes

### Phase 6.9 — Branding Studio ✅ COMPLETE
**Goal:** Build a comprehensive brand identity toolkit with asset generators

- [x] `store/brandingStore.ts` — BrandingPreset type (logo, colors, typography, layout, business info, payment info), CRUD presets, default preset logic
- [x] `store/businessCardStore.ts` — BusinessCardProfile type, CRUD profiles, theme options (light/dark/blue)
- [x] `app/branding/page.tsx` — Branding Studio shell with sidebar navigation and tool panel
- [x] `components/branding/BrandIdentityEditor.tsx` — Business info, logo upload, logo position, footer text
- [x] `components/branding/ColorPaletteEditor.tsx` — Define primary, secondary, text, background, border, accent colors
- [x] `components/branding/TypographyEditor.tsx` — Font family and size scale editor
- [x] `components/branding/AssetGeneratorPanel.tsx` — Wrapper for all asset generators
- [x] `components/branding/generators/EmailSignatureGenerator.tsx` — Branded email signature
- [x] `components/branding/generators/LetterheadGenerator.tsx` — Printable letterhead template
- [x] `components/branding/generators/SocialMediaGenerator.tsx` — Social media post/banner graphics
- [x] `components/shared/BrandingPresetsModal.tsx` — Manage named brand presets
- [x] `components/shared/BusinessCardGeneratorModal.tsx` — Digital business card generator
- [x] `components/shared/QRCodeGeneratorModal.tsx` — QR code generator
- [x] `components/shared/ShortURLGeneratorModal.tsx` — Short URL generator
- [x] `components/shared/GlobalSearch.tsx` — Search across all modules (Cmd/Ctrl+K)
- [x] Schedule MonthView added (`components/schedule/MonthView.tsx`)

### Phase 7 — Backend Integration ✅ COMPLETE
- [x] Cloudflare D1 setup + schema migration (clients, invoices, payments, job_materials, expenses, time_entries, quote_line_items)
- [x] Cloudflare Workers API with all CRUD routes implemented and deployed at `https://fieldkit-api.recipeer-cbv.workers.dev`
- [x] `wrangler.toml` with D1 binding (`fieldkit-db`, ID: `476cb614-63c0-44b3-968c-f45f73ff58d0`)
- [x] All Zustand stores call real API endpoints; JWT auth via Clerk token in `Authorization` header
- [x] Clerk production instance live at `get-fieldkit.com` — prod keys active
- [x] `userScopedStorage` — localStorage namespaced by Clerk `userId` for isolation
- [x] `GET /api/public/quotes/:id` — public endpoint (no auth), enables cross-device quote sharing
- [x] All routes require valid Clerk JWT except the public quote endpoint

### Phase 8 — Production Polish ✅ COMPLETE
**Goal:** Eliminate all UX rough edges, complete dashboard, and finalize public sharing

#### 8.1 — Dashboard Improvements ✅
- [x] **Dashboard** (`app/page.tsx`) — revenue metrics, upcoming jobs panel (This Week), outstanding invoices panel with deep-links to `/jobs?id=`
- [x] **Quick Actions** — "Create Job" button opens `CreateJobModal` directly (mobile + desktop), no page navigation required
- [x] **Outstanding Invoices** — each invoice row deep-links directly to the job drawer (`/jobs?id=${invoice.jobId}`)
- [x] Wrapped dashboard return in `<>...</>` fragment (fixed JSX parent element error)

#### 8.2 — Eliminate All Native Dialogs ✅
Replaced every `alert()`, `window.confirm()`, and `confirm()` call across the codebase with inline state feedback. Standard pattern adopted:
- **Double-tap confirm** — first click sets `deleteConfirmId` / `archiveConfirm` state for 3000ms; second click executes; button shows "Confirm?" in red
- **Clipboard feedback** — `copied` state shows "Copied!" for 2s, then reverts
- **Inline errors** — invalid input shows red error text below the field instead of an alert

Files updated:
- [x] `app/team/page.tsx` — delete member
- [x] `app/clients/page.tsx` — delete client (removed job-count warning entirely)
- [x] `components/jobs/TimeLog.tsx` — invalid duration → inline error; delete entry → no confirm
- [x] `components/jobs/JobDrawer.tsx` — archive job
- [x] `components/jobs/JobQuotesTab.tsx` — delete quote
- [x] `components/quotes/QuoteCard.tsx` — delete quote (accepts `deleteConfirm` prop)
- [x] `components/jobs/ExpensesTab.tsx` — delete expense
- [x] `components/jobs/MaterialsTab.tsx` — delete material
- [x] `components/jobs/BoardSettingsModal.tsx` — delete column
- [x] `components/shared/BrandingPresetsModal.tsx` — delete preset
- [x] `components/shared/BusinessCardGeneratorModal.tsx` — delete profile + clipboard copy + profile name validation + save success
- [x] `components/shared/QRCodeGeneratorModal.tsx` — clipboard copy feedback
- [x] `components/shared/ShortURLGeneratorModal.tsx` — clipboard copy feedback
- [x] `components/branding/BrandIdentityEditor.tsx` — silent ignore on non-image upload

#### 8.3 — Invoices Page Improvements ✅
- [x] **Overdue filter tab** added to `app/invoices/page.tsx` — rose badge with count, filters to overdue-only rows
- [x] `FilterTab` type extended: `'all' | 'unpaid' | 'overdue' | 'paid'`

#### 8.4 — Public Quote Share ✅
- [x] `GET /api/public/quotes/:id` added to `worker/index.ts` — placed **before** the `getUserId()` auth check; returns quote + line items as JSON; no user_id filter (share by UUID)
- [x] `app/quotes/share/[id]/page.tsx` rewritten — on mount, tries localStorage first (same-device), then fetches from public API (cross-device); shows spinner during fetch; shows "Quote Not Found" only if both fail

#### 8.5 — Create Job from Client Drawer ✅
- [x] `CreateJobModal` accepts new `initialClientId?: string` prop — pre-selects client in the form
- [x] `ClientDrawer.onCreateJob` signature updated to `(clientId: string) => void`
- [x] `app/clients/page.tsx` — "Create Job" button in client drawer opens `CreateJobModal` with client pre-selected
- [x] Resolved the last remaining `// TODO` comment in the codebase

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

## 9. Extended Features Implemented

Beyond the original four-module v1 scope, the following features have been fully built and are part of the current frontend:

### Clients Module ✅
- Component: `app/clients/page.tsx` + `components/clients/ClientDrawer.tsx`
- Store: `clientStore.ts`
- Dedicated client list with search, create/edit, and drawer view
- Auto-migration from existing job data

### Team Module ✅
- Component: `app/team/page.tsx`
- Store: `teamStore.ts`
- Team member management with roles, hourly rates, color coding, and active/inactive toggle
- Powers assignee dropdowns in jobs and schedule

### Invoicing & Payment Tracking ✅
- Component: `components/jobs/InvoicesTab.tsx` (within Job Drawer)
- Store: `invoiceStore.ts`
- Create invoices from accepted quotes, record payments, track status (Unpaid/Partial/Paid/Overdue)
- Payment methods: Cash, Check, Credit Card, Bank Transfer, Other

### Material Cost Tracking ✅
- Component: `components/jobs/MaterialsTab.tsx` (within Job Drawer)
- Store: `materialCostStore.ts`
- Log actual material costs per job, optionally linked to inventory items
- Compare actual vs quoted material costs for profitability analysis

### Expense Tracking ✅
- Component: `components/jobs/ExpensesTab.tsx` (within Job Drawer)
- Store: `expenseStore.ts`
- Track job-specific expenses (permits, subcontractors, equipment rental, disposal, etc.)
- Also tracks general overhead expenses not tied to a specific job
- Categories: Permits · Subcontractor · Equipment Rental · Disposal · Tools · Vehicle · Insurance · Utilities · Other

### Time Log ✅
- Component: `components/jobs/TimeLog.tsx` (within Job Drawer)
- Store: `timeEntryStore.ts`
- Start/stop timer per team member per job
- Manual time entry with notes
- Calculates total hours and labor cost (using team member's hourly rate)

### Branding Studio ✅
- Module: `app/branding/page.tsx`
- Store: `brandingStore.ts`
- Full brand identity editor (logo, colors, typography, layout, business info)
- Asset generators: Email Signature · Letterhead · Social Media Graphics
- Brand presets (save/switch between multiple brands)

### Business Card Generator ✅
- Component: `components/shared/BusinessCardGeneratorModal.tsx`
- Store: `businessCardStore.ts`
- Digital business card profiles with theme options (light/dark/blue)
- Multiple saved profiles

### QR Code Generator ✅
- Component: `components/shared/QRCodeGeneratorModal.tsx`
- Generate QR codes for quotes, job links, or custom URLs

### Short URL Generator ✅
- Component: `components/shared/ShortURLGeneratorModal.tsx`
- Create shortened URLs for sharing quotes and jobs via SMS or print

### Global Search ✅
- Component: `components/shared/GlobalSearch.tsx`
- Search across jobs, clients, quotes, and inventory

### Schedule Month View ✅
- Component: `components/schedule/MonthView.tsx`
- Month view added alongside existing Week and Day views

---

## 9.5 Remaining Work & Future Enhancements

All remaining bugs, polish items, and planned features are tracked in **[ROADMAP.md](./ROADMAP.md)**.

**Summary of open items:**

| Priority | Item |
|---|---|
| 🔴 Bug | Branding Studio — AssetGeneratorPanel still uses emoji icons |
| 🔴 Bug | BrandingModal — "Export" tab is a Coming Soon stub |
| 🔴 Bug | Email Signature — social icons use shields.io (fragile external URLs) |
| 🔴 Bug | Letterhead + Social generators — no Download/Print button wired |
| 🟡 High | PDF generator ignores branding preset (hardcoded colors/logo/fonts) |
| 🟡 High | D1 schema missing `rounding_adjustment` column on quotes table |
| 🟡 High | Service worker offline caching — untested |
| 🟡 High | Dark mode — full QA pass needed |
| 🟢 Medium | Invoices page not in sidebar nav |
| 🟢 Medium | Quote expiry date never shown as expired/warning |
| 🟢 Medium | Global Search doesn't include inventory items |
| 🔵 Planned | Job Templates |
| 🔵 Planned | Photo & File Attachments (Cloudflare R2) |
| 🔵 Planned | Reports & Analytics page |
| 🔵 Planned | Email sending (Resend / Cloudflare Email Workers) |
| 🔵 Planned | Recurring Jobs |
| 🔵 Planned | Push Notifications |
| 🔵 Planned | Team Sharing / Multi-User (Clerk Organizations) |
| 🔵 Planned | Client Portal (token-based read-only access) |
| 🔵 Planned | Mobile App Wrapper (Capacitor) |

---

## 10. Out of Scope (v1) — Status

| Feature | Status |
|---|---|
| User authentication / accounts | ✅ DONE — Clerk production |
| Push notifications | ❌ Out of scope |
| Email sending (outbound SMTP) | ❌ Out of scope |
| External calendar sync (Google Calendar) | ❌ Out of scope |
| Client portal / client-facing login | ❌ Out of scope |
| Payment processing (Stripe/gateway) | ❌ Out of scope — manual tracking only |
| Multi-tenant team sharing via invite | ❌ Out of scope |
| Barcode / QR scanning for inventory | ❌ Out of scope |
| Photo attachments on jobs | ❌ Out of scope |

---

## 11. Future Considerations (v2+)

- ~~Optional account creation for cloud sync across devices~~ — **Done** (Clerk + D1)
- Team sharing via invite link (multiple users under one business account)
- Client-facing portal (job status + quote approval with e-signature)
- Push notifications for low stock and upcoming jobs
- Integrations: Stripe for invoicing, Google Calendar sync, Resend/SendGrid for email
- Mobile app (React Native or Capacitor wrapper over the existing PWA)
- White-label / cloneable version for other builders

---

## 12. Copilot Prompt

> You are helping build FIELDKIT — a free, lightweight operations PWA for small service businesses, with a focus on construction trades (plumbers, painters, flooring installers, electricians, HVAC techs) and other physical/field work providers. The stack is Next.js 14 (App Router), Tailwind CSS, Zustand, Cloudflare Workers, Cloudflare D1, and Cloudflare R2. Frontend deploys to Vercel; backend runs on Cloudflare Workers.
>
> This document is the single source of truth. Follow the data model, API routes, file structure, and build phases exactly as specified. Do not add features beyond what is described. Do not use emojis anywhere in the UI — SVG icons only (Heroicons or Lucide). Mobile-first on every component. Ask before making architectural decisions not covered in this document.
>
> **Current state (v3.0 — feature-complete):** All frontend modules complete. Backend (Cloudflare Workers + D1) live at `https://fieldkit-api.recipeer-cbv.workers.dev`. Clerk production auth live at `get-fieldkit.com`. All stores use `userScopedStorage` (localStorage namespaced by Clerk `userId`). Public quote share endpoint live. Zero native `alert()`/`confirm()` calls — all destructive actions use double-tap confirm pattern. Zero TypeScript errors. Latest commit: `bc6281d`. See [ROADMAP.md](./ROADMAP.md) for remaining work.
>
> **Standard patterns in use:**
> - **Double-tap confirm:** `const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)`. First click sets state + 3s timeout; second click executes. Button shows "Confirm?" in `bg-red-500 text-white` on first click.
> - **Clipboard feedback:** `const [copied, setCopied] = useState(false)`, set to true then clear after 2s.
> - **Inline errors:** Form validation errors shown as `<p className="text-sm text-rose-600">` below the relevant field.
> - **Public routes:** Any route added before the `getUserId()` check in `worker/index.ts` is unauthenticated.
>
> **Target users:** Construction trades workflows — multi-day jobs, site addresses, material tracking (paint, wire, pipe, flooring), crew scheduling, and quick itemized quotes (materials + labor). Every feature should work equally well for a one-person plumber or a three-person painting crew.
>
> **Build approach:** Phases 1–8 complete. The app is in production and receiving real users. Future work is additive enhancements only.