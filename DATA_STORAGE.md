# FieldKit Data Storage Architecture

## Summary
**All FieldKit data is stored in the user's Cloudflare account**, not in browser localStorage. LocalStorage is only used as a client-side cache for offline access and fast loading.

## What This Means

### ✅ Your Data Lives in the Cloud
- Jobs, clients, invoices, team, inventory → **Cloudflare D1 (SQLite)**
- Settings, subscription, plan status → **Cloudflare D1**
- Branding presets → **Cloudflare KV** (optional)

### ✅ Multi-Device Sync
- Sign in on any device → See all your data
- Changes sync automatically across devices
- Trial status syncs (start trial on phone, see it on desktop)
- Plan upgrades sync instantly

### ✅ Offline Support
- View cached data when offline
- Create/edit items (stored in localStorage temporarily)
- When back online, changes auto-sync to cloud

### ✅ Privacy & Security
- Data stored in **your** Cloudflare account, not ours
- Isolated per user (no cross-user access)
- Clerk JWT authentication on every request
- HTTPS encrypted in transit

## Technical Architecture

```
┌─────────────────────────────────────────┐
│         User Device (Browser)           │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  localStorage (cache only)         │ │
│  │  - Jobs, clients, invoices         │ │
│  │  - Settings, subscription          │ │
│  │  - Used for offline access         │ │
│  └────────────────────────────────────┘ │
│              ↕ sync                      │
└─────────────────────────────────────────┘
                ↕ HTTPS + JWT
┌─────────────────────────────────────────┐
│    Cloudflare Worker (your account)     │
│  - Validates Clerk JWT tokens           │
│  - Routes API requests                  │
│  - Enforces user isolation              │
└─────────────────────────────────────────┘
                ↕
┌─────────────────────────────────────────┐
│     Cloudflare D1 Database (SQLite)     │
│  - user_subscription (plan, trial)      │
│  - user_settings (theme, defaults)      │
│  - jobs, clients, team, inventory       │
│  - invoices, payments, expenses         │
│  - time_entries, notes, materials       │
│  - All data isolated by user_id         │
└─────────────────────────────────────────┘
```

## How Sync Works

### On App Load
1. App loads cached data from localStorage (instant)
2. Background sync pulls latest from Cloudflare D1
3. Merges cloud + local data (cloud takes precedence)
4. Updates localStorage cache

### On Data Change
1. User creates/edits item (job, client, etc.)
2. Saved to localStorage immediately (offline-first)
3. Auto-syncs to cloud in background
4. Cloud becomes source of truth

### On Plan Change
1. User starts trial or upgrades plan
2. Subscription store auto-syncs to cloud via API
3. Other devices see change on next sync/load

## Database Tables

See [worker/schema.sql](worker/schema.sql) for full schema. Key tables:

- `user_subscription` - Plan tier, trial status, trial end date
- `user_settings` - Theme, tax rate, invoice prefix, notifications
- `jobs` - Job details, status, client info, dates
- `clients` - Client contact info, properties, tags
- `team_members` - Team roster, roles, hourly rates
- `inventory_items` - Stock levels, categories, units
- `invoices` + `payments` - Billing and payment tracking
- `time_entries` - Time logs per job/team member
- `notes` + `note_folders` - Internal notes and organization

## API Endpoints

All endpoints require Clerk JWT in `Authorization: Bearer <token>` header:

### Subscription
- `GET /api/subscription` - Get user's current plan and trial status
- `PUT /api/subscription` - Update plan (auto-called by subscription store)

### Settings
- `GET /api/settings` - Get user's settings
- `PUT /api/settings` - Update settings

### Data Resources
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- _(Similar for clients, team, inventory, invoices, etc.)_

### Bulk Sync
- `POST /api/sync` - Bulk upload data (used on first sign-in or manual sync)

## Setup Requirements

### 1. Cloudflare D1 Database
```bash
# Create database
npx wrangler d1 create fieldkit-db

# Run schema
npx wrangler d1 execute fieldkit-db --file=worker/schema.sql
```

### 2. Cloudflare Worker
```bash
# Deploy worker
cd worker
npx wrangler deploy
```

### 3. Environment Variables
```bash
# .env.local (Next.js)
NEXT_PUBLIC_WORKER_URL=https://fieldkit.<your-account>.workers.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# wrangler.toml (Worker)
CLERK_SECRET_KEY=sk_...
```

## Viewing Your Data

### Browser Console
```javascript
// Check local cache
localStorage.getItem('fieldkit-subscription')
localStorage.getItem('fieldkit-jobs')

// Force sync from cloud
await syncWithCloud()
```

### Cloudflare Dashboard
```bash
# Query D1 directly
npx wrangler d1 execute fieldkit-db \
  --command "SELECT * FROM user_subscription LIMIT 10"

# Check all tables
npx wrangler d1 execute fieldkit-db \
  --command "SELECT name FROM sqlite_master WHERE type='table'"
```

## Cost

Cloudflare Free Tier (as of 2026):
- **D1 Database**: 5 GB storage, 5 million reads/day (free)
- **Workers**: 100k requests/day (free)
- **KV**: 100k reads/day, 1k writes/day (free)

FieldKit is designed to stay within free tier limits for typical usage.

## Troubleshooting

### Subscription Not Syncing
1. Check `NEXT_PUBLIC_WORKER_URL` is set correctly
2. Verify user is signed in: `window.Clerk.user`
3. Force sync: Settings → Data → "Sync to Cloud"
4. Check console for errors

### Data Not Appearing
1. Sign in to Clerk account
2. Wait for auto-sync (happens on page load)
3. Check localStorage: `Object.keys(localStorage).filter(k => k.startsWith('fieldkit'))`
4. Check D1: `npx wrangler d1 execute fieldkit-db --command "SELECT COUNT(*) FROM jobs"`

### Lost Connection
- App works offline with cached data
- Changes saved to localStorage
- Syncs automatically when connection restored
- Manual sync available in Settings

## Further Reading

- [SUBSCRIPTION_SYSTEM.md](SUBSCRIPTION_SYSTEM.md) - Full subscription & trial docs
- [worker/schema.sql](worker/schema.sql) - Complete database schema
- [lib/sync.ts](lib/sync.ts) - Sync implementation
- [worker/index.ts](worker/index.ts) - API implementation
