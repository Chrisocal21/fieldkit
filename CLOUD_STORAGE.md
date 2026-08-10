# Cloud Storage Implementation

## Overview
All FieldKit data is stored in the user's **Cloudflare D1 database** (SQLite), not in localStorage. LocalStorage is only used as a client-side cache for offline access and fast loading.

## Architecture

### Data Flow
```
User Device (localStorage cache)
    ↕ sync (automatic background + manual)
Cloudflare Worker (authentication & routing)
    ↕
Cloudflare D1 Database (user's cloud storage)
```

### What's Stored in the Cloud

| Data Type | Table | Synced |
|-----------|-------|--------|
| **Jobs** | `jobs`, `quotes`, `quote_line_items` | ✅ Automatic |
| **Clients** | `clients` | ✅ Automatic |
| **Team Members** | `team_members` | ✅ Automatic |
| **Inventory** | `inventory_items`, `inventory_adjustments` | ✅ Automatic |
| **Invoices** | `invoices`, `payments` | ✅ Automatic |
| **Expenses** | `expenses` | ✅ Automatic |
| **Materials** | `job_materials` | ✅ Automatic |
| **Time Entries** | `time_entries` | ✅ Automatic |
| **Notes** | `notes`, `note_folders` | ✅ Automatic |
| **Settings** | `user_settings` | ✅ Automatic |
| **Subscription** | `user_subscription` | ✅ Automatic |
| **Branding** | User blobs (KV) | ✅ On change |

## Authentication

- **Clerk** provides JWT tokens for authentication
- Every API request includes `Authorization: Bearer <token>`
- Cloudflare Worker validates tokens and extracts `userId`
- All queries filter by `user_id` (multi-tenant isolation)

## Sync Behavior

### Automatic Sync
- Runs in background via `StoreRehydrator` component on app load
- Syncs when user signs in
- Can be triggered manually from Settings → Data → "Sync to Cloud"

### Merge Strategy
1. **Pull from cloud** - Get latest data from D1
2. **Merge with local** - Cloud data takes precedence for matching IDs
3. **Push new items** - Upload local items not found in cloud (offline edits)
4. **Update localStorage** - Cache merged result for offline access

### Conflict Resolution
- **Cloud wins** - For existing items, cloud data overwrites local
- **Local additions** - New items created offline are pushed to cloud
- **No deletion** - Items deleted locally remain in cloud (soft delete via `archived` flag)

## Subscription Storage

### Where It's Stored
- **Cloud**: `user_subscription` table in D1
- **Local**: `localStorage` key `fieldkit-subscription` (cache only)

### When It Syncs
- **On change**: Every time plan/trial changes (auto-sync to cloud)
- **On sign-in**: Pull latest subscription from cloud
- **On manual sync**: Settings → Data → "Sync to Cloud"

### Multi-Device Support
User starts trial on Device A, switches to Device B:
1. Device B pulls subscription from cloud
2. Sees trial status and days remaining
3. Trial expires → Both devices downgrade to Free
4. User upgrades on Device B → Device A sees paid plan on next sync

## Cloudflare Setup

### Required Resources
1. **D1 Database**: `fieldkit-db` (SQLite in the cloud)
2. **Worker**: Handles API requests, validates auth, queries D1
3. **KV Namespace**: (optional) For branding assets/blobs

### Environment Variables
```bash
# Next.js app
NEXT_PUBLIC_WORKER_URL=https://fieldkit-worker.<your-account>.workers.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Cloudflare Worker (wrangler.toml)
CLERK_SECRET_KEY=sk_...
```

### Deploy Commands
```bash
# Create D1 database
npx wrangler d1 create fieldkit-db

# Run schema migration
npx wrangler d1 execute fieldkit-db --file=worker/schema.sql

# Deploy worker
cd worker
npx wrangler deploy
```

## Offline Support

### What Works Offline
- View all cached data (jobs, clients, invoices, etc.)
- Create/edit items (stored in localStorage)
- Change settings (stored in localStorage)

### What Doesn't Work Offline
- Sync button (requires network)
- Pulling latest from other devices
- Pushing new items to cloud

### After Coming Back Online
- App auto-syncs on load
- All offline edits are pushed to cloud
- Cloud data merges with local cache

## Privacy & Security

- **User isolation**: All queries filter by `user_id` from JWT
- **No cross-user access**: Cannot query other users' data
- **Token validation**: Worker validates Clerk JWT on every request
- **HTTPS only**: All communication encrypted in transit
- **No third-party**: Data stays in user's Cloudflare account

## Testing Cloud Sync

### Check Current Sync Status
```javascript
// Open browser console
const syncResult = await syncWithCloud()
console.log(syncResult)
// { ok: true, pushed: { jobs: 2, clients: 1 } }
```

### Force Pull from Cloud
```javascript
// Clear local cache
localStorage.clear()
// Reload page - will pull everything from cloud
location.reload()
```

### Verify Cloud Storage
```bash
# Query D1 directly (shows what's in cloud)
npx wrangler d1 execute fieldkit-db --command "SELECT * FROM user_subscription WHERE user_id = 'user_xxx'"
```

## Migration Notes

### Existing Users (Pre-Cloud)
If user has data in localStorage but nothing in cloud:
1. First sync pushes all local data to cloud
2. Cloud becomes source of truth
3. Future syncs pull from cloud

### Clearing Data
- **Clear Local Only**: Settings → Data → "Clear Local Data"
  - Wipes localStorage cache
  - Cloud data preserved
  - Next load pulls from cloud
  
- **Clear Everything**: Not implemented (by design)
  - Use Cloudflare dashboard to delete D1 records
  - Or user can delete their account (Clerk + D1 cascade)

## Troubleshooting

### "Sync failed" in UI
1. Check browser console for error details
2. Verify `NEXT_PUBLIC_WORKER_URL` is set correctly
3. Test worker directly: `curl https://your-worker.workers.dev/api/jobs`
4. Check Clerk session token: `await window.Clerk.session.getToken()`

### Data Not Appearing
1. Check if logged in: `window.Clerk.user`
2. Force manual sync: Settings → Data → "Sync to Cloud"
3. Check D1 database: `npx wrangler d1 execute fieldkit-db --command "SELECT COUNT(*) FROM jobs"`

### Subscription Not Syncing
1. Check localStorage: `localStorage.getItem('fieldkit-subscription')`
2. Check cloud: Settings → Plan tab (shows source of truth)
3. Force sync: Console → `syncWithCloud()`
