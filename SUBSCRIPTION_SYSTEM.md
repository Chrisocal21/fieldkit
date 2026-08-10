# Subscription & Trial System

## ⚠️ Data Storage Note
**All subscription data (plan, trial status) is stored in your Cloudflare D1 database**, not just in localStorage. LocalStorage is only used as a cache for offline access. See [CLOUD_STORAGE.md](CLOUD_STORAGE.md) for full details on cloud storage architecture.

## Overview
FieldKit uses a **freemium model** with 4 pricing tiers: Free, Starter, Professional, and Enterprise. Users can start a **14-day free trial** of any paid plan without entering credit card information.

## Quick Test (Browser Console)

Open the browser console and run these commands to test the trial system:

```javascript
// 1. Start a Professional trial (14 days)
useSubscriptionStore.getState().startTrial('professional', 14)

// 2. Check current status
useSubscriptionStore.getState()
// Shows: { currentPlan: 'professional', isTrialActive: true, trialEndsAt: <timestamp> }

// 3. Simulate trial ending (set to 1 second from now)
useSubscriptionStore.getState().startTrial('professional', 0.00001)
// Wait 1 second, then reload page — you'll be downgraded to Free

// 4. Manually downgrade to Free
useSubscriptionStore.getState().endTrial()

// 5. Upgrade to paid plan
useSubscriptionStore.getState().setPlan('professional')
```

## How It Works

### 1. User Signs Up
- New users start on the **Free plan** by default
- Free plan includes: 5 jobs, 10 clients, basic quotes only

### 2. Starting a Trial
To start a trial (for testing), open browser console and run:
```javascript
// Start a 14-day Professional trial
useSubscriptionStore.getState().startTrial('professional', 14)

// Or Starter trial
useSubscriptionStore.getState().startTrial('starter', 14)

// Or Enterprise trial
useSubscriptionStore.getState().startTrial('enterprise', 14)
```

### 3. During Trial
- User has **full access** to all features of their trial plan
- **TrialBanner** shows at top of app with countdown
- Banner turns amber when **3 days or less** remaining
- User can create unlimited jobs, invoices, team members, inventory (depending on plan)

### 4. Trial Expiration
When trial ends (14 days or custom duration):
- **Automatic downgrade** to Free plan via `endTrial()` method
- Runs hourly check in TrialBanner component
- **All data is preserved** in Zustand stores:
  - Jobs beyond limit (5) remain in database
  - Invoices remain but are locked behind paywall
  - Team members remain but page is locked
  - Inventory items remain but page is locked

### 5. Post-Trial Experience
- **DowngradedBanner** appears once after downgrade (dismissible)
- User can access first 5 jobs only
- Quotes page still accessible (Free plan feature)
- Invoices, Team, Inventory show **UpgradeModal** on access
- Job creation blocked when limit reached (5/5 used)

### 6. Upgrade Path
- User clicks "Upgrade Now" on any banner/modal
- Redirected to sign-up page
- After payment, plan is upgraded via `setPlan('starter')`
- **All locked data becomes accessible again**

## Data Preservation

| Feature | Free Tier | Data After Trial Ends |
|---------|-----------|----------------------|
| **Jobs** | 5 active | ✅ All jobs saved, limited access |
| **Clients** | 10 | ✅ All clients saved, limited access |
| **Invoices** | ❌ No access | ✅ All invoices saved, locked behind paywall |
| **Team** | ❌ No access | ✅ All team members saved, locked |
| **Inventory** | ❌ No access | ✅ All items saved, locked |
| **Time Tracking** | ❌ No access | ✅ All entries saved, locked |

## Testing Scenarios

### Scenario 1: Free User Trying Premium Features
1. User on Free plan
2. Tries to create 6th job → UpgradeModal appears
3. Tries to access Invoices → UpgradeModal appears
4. Tries to access Team → UpgradeModal appears

### Scenario 2: Trial User Creates Data
1. User starts Professional trial (14 days)
2. Creates 20 jobs, 5 invoices, adds 3 team members
3. Trial expires → Auto-downgraded to Free
4. Can see first 5 jobs only
5. Invoices/Team pages locked
6. Data remains in stores, ready to unlock on upgrade

### Scenario 3: Trial User Upgrades Before Expiration
1. User on day 10 of trial
2. Sees TrialBanner: "4 days left"
3. Clicks "Upgrade Now"
4. Completes payment
5. Plan changes from trial to paid subscription
6. `isTrialActive` becomes false
7. No more trial countdown, full access continues

## Store State Example

```typescript
{
  currentPlan: 'professional',  // or 'free', 'starter', 'enterprise'
  trialEndsAt: 1723276800000,   // Unix timestamp (null if not on trial)
  isTrialActive: true,          // false after trial ends or on paid plan
}
```

## Feature Gates

Feature gates check limits via subscription store:

```typescript
// Jobs page
const canCreate = useSubscriptionStore(s => s.canAddJob(currentJobCount))
if (!canCreate) {
  setIsUpgradeModalOpen(true) // Show upgrade modal
}

// Invoices page
const hasFeature = useSubscriptionStore(s => s.hasFeature('hasInvoices'))
if (!hasFeature) {
  setIsUpgradeModalOpen(true) // Lock entire page
}
```

## Implementation Files

- **Store**: `store/subscriptionStore.ts` - Plan management & limits (auto-syncs to cloud on changes)
- **Cloud Sync**: `lib/sync.ts` - Syncs subscription with D1 database
- **Worker API**: `worker/index.ts` - `/api/subscription` GET/PUT endpoints
- **Database**: `worker/schema.sql` - `user_subscription` table
- **Modals**: `components/shared/UpgradeModal.tsx` - Upgrade prompts
- **Banners**: 
  - `components/shared/TrialBanner.tsx` - Trial countdown
  - `components/shared/DowngradedBanner.tsx` - Post-trial notification
- **Feature Gates**:
  - `app/jobs/page.tsx` - Job creation limits
  - `app/invoices/page.tsx` - Invoice feature lock
  - `app/team/page.tsx` - Team feature lock
  - `app/inventory/page.tsx` - Inventory feature lock

## Multi-Device Sync

Because subscription data is stored in Cloudflare D1:
- **User starts trial on Device A** → Synced to cloud
- **User opens app on Device B** → Pulls trial status from cloud
- **Trial expires** → Both devices see downgrade to Free on next sync/load
- **User upgrades on Device C** → All devices see paid plan immediately

This works because:
1. Every plan change auto-syncs to cloud (see `syncToCloud()` in `subscriptionStore.ts`)
2. App pulls latest subscription on sign-in and manual sync
3. Cloud is the source of truth, not localStorage

## Payment Integration (TODO)

When ready to accept payments:
1. Integrate Stripe/Paddle for subscription billing
2. Update `setPlan()` to sync with payment provider
3. Add webhook handler for subscription events
4. Implement grace period for failed payments
5. Add billing page to manage subscription/card
