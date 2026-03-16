# FIELDKIT — Master Handoff Document
**Version:** 1.0  
**Status:** Ready for Implementation  
**Stack:** Next.js 14 · Cloudflare Workers + D1 + R2 · Tailwind CSS · Zustand · PWA  
**Deployment:** Vercel (frontend) · Cloudflare (backend + DB + storage)

---

## 1. Project Overview

FIELDKIT is a free, lightweight operations tool built for small service businesses that do physical work — laser engravers, print shops, trades, mobile crews, event services. It fills the gap between "too simple" (spreadsheets) and "too expensive" (Jobber, ServiceM8, full CRMs).

**Core philosophy:**
- Free forever. No paywalls, no upsells.
- Mobile-first PWA. Works on any device, installable from browser.
- No mandatory account to start — open and use immediately.
- Four focused modules. Nothing more, nothing less.
- A new user should be fully oriented within 2 minutes.

---

## 2. Modules

### 2.1 Jobs
Track work orders from creation to completion.

**Fields per job:**
- Job ID (auto-generated, e.g. `JOB-0042`)
- Client name
- Job title / description
- Status: `Quoted` · `Scheduled` · `In Progress` · `Completed` · `Cancelled`
- Assigned operator (free text or dropdown from team list)
- Due date
- Notes (freeform)
- Linked quote (optional reference to Quote module)

**Features:**
- Kanban-style status board (drag to update status)
- List view with filter by status, assignee, date range
- Tap any job to open detail drawer
- Mark complete with one tap
- No delete — archive only

---

### 2.2 Quote Builder
Create clean, shareable quotes without an account.

**Quote structure:**
- Client name + contact info (optional)
- Line items: description · quantity · unit price · line total
- Labor line (separate from materials)
- Notes / terms field
- Subtotal · Tax (optional %) · Total
- Quote number (auto-incremented)
- Expiry date (optional)

**Output options:**
- Generate shareable link (read-only view)
- Download as PDF
- Convert quote → job with one tap

**Constraints:**
- No e-signature in v1
- PDF generated client-side (no server rendering required in v1)

---

### 2.3 Schedule
Visual calendar of who is doing what and when.

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

---

### 2.4 Inventory
Track consumable materials and supplies. Lightweight — no barcodes, no warehouse complexity.

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
  client_name TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Quoted',
  assignee_id TEXT,
  due_date INTEGER,             -- Unix timestamp
  quote_id TEXT,
  notes TEXT,
  archived INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (assignee_id) REFERENCES team_members(id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

-- Quotes
CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  quote_number INTEGER UNIQUE,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  notes TEXT,
  tax_rate REAL DEFAULT 0,
  expiry_date INTEGER,
  status TEXT DEFAULT 'Draft',  -- Draft, Sent, Accepted, Declined
  created_at INTEGER,
  updated_at INTEGER
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
  unit TEXT,
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
GET    /api/jobs/:id          -- get single job
PATCH  /api/jobs/:id          -- update job (status, fields)
DELETE /api/jobs/:id          -- archive job (soft delete)

GET    /api/quotes            -- list quotes
POST   /api/quotes            -- create quote with line items
GET    /api/quotes/:id        -- get quote + line items
PATCH  /api/quotes/:id        -- update quote
POST   /api/quotes/:id/convert -- convert quote to job

GET    /api/team              -- list team members
POST   /api/team              -- add team member
PATCH  /api/team/:id          -- update team member
DELETE /api/team/:id          -- remove team member

GET    /api/inventory         -- list inventory items
POST   /api/inventory         -- create item
PATCH  /api/inventory/:id     -- update item
POST   /api/inventory/:id/adjust -- log stock adjustment

GET    /api/schedule          -- return jobs with due_date in range (query: from, to)
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
- **Loading states:** Skeleton loaders, not spinners.
- **Empty states:** Every module has a clear empty state with a prompt to create the first item.
- **Destructive actions:** Confirm before archive. No hard deletes exposed in UI.
- **Color coding for job status:**
  - `Quoted` — Gray
  - `Scheduled` — Blue
  - `In Progress` — Amber
  - `Completed` — Green
  - `Cancelled` — Red

---

## 5. File & Folder Structure

```
fieldkit/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  -- redirect to /jobs
│   ├── jobs/
│   │   ├── page.tsx              -- jobs board/list
│   │   └── [id]/page.tsx         -- job detail
│   ├── quotes/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
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
│   │   └── JobDrawer.tsx
│   ├── quotes/
│   │   ├── QuoteForm.tsx
│   │   ├── QuoteLineItems.tsx
│   │   └── QuotePreview.tsx
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
│   ├── jobStore.ts
│   ├── quoteStore.ts
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

### Phase 1 — Foundation (Frontend)
- Project scaffold: Next.js 14 + Tailwind + Zustand
- Bottom nav + sidebar shell
- Mock data stores (Zustand with localStorage persistence)
- Shared components (StatusBadge, EmptyState, SkeletonLoader)
- Basic layout and navigation working

### Phase 2 — Jobs Module
- Jobs list + kanban board (using mock data)
- Create / edit / archive job (local state only)
- Status drag-and-drop (or tap to change)
- Job detail drawer
- All UI working with Zustand + mock data

### Phase 3 — Quote Builder
- Quote form with dynamic line items (mock data)
- PDF preview + download (client-side generation)
- Shareable quote link (read-only route)
- Convert quote → job

### Phase 4 — Schedule
- Week view calendar
- Jobs plotted by due date + assignee (from mock job data)
- Drag to reschedule
- Day view

### Phase 5 — Inventory
- Inventory list with low stock badges
- Create / edit items (mock data)
- Quick stock adjust (+ / -)
- Adjustment log view

### Phase 6 — Polish + PWA
- Offline caching
- Empty states for all modules
- Dark mode pass
- Mobile UX review
- Performance audit
- PWA manifest + service worker

### Phase 7 — Backend Integration
- Cloudflare D1 setup + schema migration
- Cloudflare Workers API with all routes implemented
- Create wrangler.toml with D1 and R2 bindings
- Refactor Zustand stores to call real API endpoints
- Data migration from localStorage mock data to D1
- Test all CRUD operations end-to-end

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

---

## 8. Out of Scope (v1)

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

## 9. Future Considerations (v2+)

- Optional account creation for cloud sync across devices
- Team sharing via invite link
- Client-facing portal (job status + quote approval)
- Push notifications for low stock and upcoming jobs
- Integrations: Stripe for invoicing, Google Calendar sync
- White-label / cloneable version for other builders

---

## 10. Copilot Prompt

> You are helping build FIELDKIT — a free, lightweight operations PWA for small service businesses. The stack is Next.js 14 (App Router), Tailwind CSS, Zustand, Cloudflare Workers, Cloudflare D1, and Cloudflare R2. Frontend deploys to Vercel; backend runs on Cloudflare Workers.
>
> This document is the single source of truth. Follow the data model, API routes, file structure, and build phases exactly as specified. Do not add features beyond what is described in v1 scope. Do not use emojis anywhere in the UI — SVG icons only (Heroicons or Lucide). Mobile-first on every component. Ask before making architectural decisions not covered in this document.
>
> **Build approach:** Frontend-first with mock data. Start with Phase 1: scaffold the Next.js project, configure Tailwind, set up Zustand stores with mock data and localStorage persistence, build the navigation shell (bottom nav + sidebar), and create shared components. Get the UI working visually with local state before connecting to D1 and Cloudflare Workers (Phase 7). Confirm completion of each phase before moving to the next.