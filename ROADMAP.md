# FIELDKIT — Roadmap & Remaining Work
**Last Updated:** May 23, 2026  
**Current Commit:** `bc6281d` on `main`  
**Production:** `get-fieldkit.com`

This file tracks everything that still needs work — bugs, polish, and planned features — broken into priority tiers.

---

## 🔴 Bugs / Broken Things (Fix First)

### Branding Studio — AssetGeneratorPanel still uses emojis
`components/branding/AssetGeneratorPanel.tsx` — the generator grid cards still use emoji icons (`💼`, `📱`, `✉️`, `🎨`, `🧾`). Replace with SVGs to match the rest of the app.

### Branding Studio — "Invoice Header" generator stub
`components/branding/AssetGeneratorPanel.tsx` line ~68 — a generator card exists with `available: false, badge: 'Coming Soon'`. Either wire it up or remove it entirely.

### BrandingModal — "Export" tab is a stub
`components/branding/BrandingModal.tsx` — the "Export" tab renders `"Coming soon: Export design tokens"`. This modal is accessible from the Sidebar. Either build export tokens or remove the tab.

### Email Signature — social icon images use shields.io
`components/branding/generators/EmailSignatureGenerator.tsx` — LinkedIn/Twitter social icons use `https://img.shields.io/badge/...` image URLs. These are external, will break in email clients, and are unreliable. Replace with inline SVG data URIs embedded in the HTML output.

### Letterhead + Social generators — no "Download" button
Both canvas-based generators (`LetterheadGenerator.tsx`, `SocialMediaGenerator.tsx`) render a canvas preview but there's no "Download PNG" or "Print" button wired up. The canvas ref exists — just need to call `canvas.toDataURL()` and trigger a download.

---

## 🟡 High Priority — Complete Before Growth Push

### PDF uses hardcoded styles, not branding preset
**File:** `lib/pdf.ts`  
The quote and invoice PDF generator uses hardcoded colors, fonts, and layout. It ignores the user's branding preset entirely. Fix: read `brandingStore.getDefaultPreset()` in the PDF generator and apply:
- `colors.primary` → header/accent color
- `logoUrl` → insert logo image at top of document
- `businessName`, `businessEmail`, `businessPhone`, `businessAddress` → pre-fill header

### D1 schema missing `rounding_adjustment` column
**Table:** `quotes`  
The `rounding_adjustment` field on quotes is only in localStorage — not persisted to D1. When a user views their quote on another device or via the public share page, rounding adjustments are lost.

**Fix:**
```sql
ALTER TABLE quotes ADD COLUMN rounding_adjustment REAL NOT NULL DEFAULT 0;
```
Run via: `npx wrangler d1 execute fieldkit-db --remote --command="ALTER TABLE quotes ADD COLUMN rounding_adjustment REAL NOT NULL DEFAULT 0"`  
Then update the worker's quote insert + update queries to include this field.

### Service worker offline caching — untested
`public/sw.js` exists and is registered, but offline caching behavior hasn't been tested end-to-end. Verify:
- Static assets cached on install
- API responses cached stale-while-revalidate
- Offline fallback page renders when network is unavailable

### Dark mode — full pass needed
Tailwind `darkMode: 'class'` is configured and most components have `dark:` variants, but a full QA pass hasn't been done. Some modals and panels may have inconsistent backgrounds or unreadable text in dark mode.

---

## 🟢 Medium Priority — Polish & UX

### Branding preset applied to quote/invoice share page
The public quote share page (`app/quotes/share/[id]/page.tsx`) renders `QuotePreview` with hardcoded styling. It should read the `userId`'s branding preset from D1 and apply it — OR store the brand color/logo snapshot with the quote at send time.

### Dashboard — real revenue calculation from D1
`app/page.tsx` currently calculates revenue from localStorage (Zustand store). For users who sync data across devices, the dashboard stats should pull from D1 invoices/payments.

### Invoices standalone page
`app/invoices/page.tsx` exists but isn't linked from the Sidebar or Bottom Nav. Either:
1. Add "Invoices" to the sidebar navigation, or
2. Fold it into the dashboard outstanding panel (deep-link to jobs)

Currently it's only reachable if you know the URL.

### Global Search — inventory results
`components/shared/GlobalSearch.tsx` searches jobs, clients, and quotes but not inventory items. Add inventory items to the search index.

### Quote expiry — visual warning
Quotes with an `expiryDate` in the past should show a visible warning badge on `QuoteCard` and in the public share page. Currently `expiryDate` is stored but never displayed as expired.

### Time log — running timer persistence
If a user starts a timer and refreshes the page (or switches devices), the running timer state is lost. The `start_time` is in D1 but there's no "resume timer" logic on mount.

---

## 🔵 Planned Features (Phase 9+)

### Job Templates
Save common job types as templates with pre-filled quote line items.
- "Standard Room Paint", "Water Heater Swap", "Panel Upgrade"
- Cloning a template creates a new job with pre-filled quote
- Store in `jobTemplateStore.ts` + D1 `job_templates` table

### Photo & File Attachments
Before/after photos and documents per job.
- Upload to Cloudflare R2
- Gallery view per job tab
- Max 5MB per image, 10MB per document
- New "Photos" tab in the job drawer (8th tab)

### Reports & Analytics Page
New route: `app/reports/page.tsx`
- Revenue by month/quarter (bar chart)
- Jobs completed vs in-progress trend
- Top clients by revenue
- Expense breakdown (pie chart by category)
- Labor efficiency: hours logged vs billed
- Export to CSV

### Email Sending (Quote Delivery)
Send quotes directly from FIELDKIT without leaving the app.
- "Send via Email" button on QuoteCard → opens compose modal
- Uses Cloudflare Email Workers or Resend API
- Template: branded HTML with quote summary + "View Full Quote" button linking to share URL
- Track `sentAt` timestamp on quote

### Recurring Jobs
For maintenance contracts and repeat service work.
- Define recurrence on a job: weekly/monthly/quarterly
- Auto-create child jobs on schedule (Cloudflare Cron Trigger)
- Recurring invoice generation per cycle

### Notifications & Reminders
Browser-based push notifications (PWA).
- Upcoming job due date (1 day before)
- Quote follow-up: quote has been "Sent" for 3+ days with no response
- Invoice overdue alert
- Low inventory threshold crossed
- Requires: service worker push subscription + Cloudflare Worker push sender

### Activity Log / Audit Trail
Track all changes on jobs for accountability.
- New D1 table: `activity_log (id, job_id, user_id, action, detail, created_at)`
- Show in job drawer: "Status changed to In Progress by Chris — May 20"
- Filter by date or team member

### Client Portal (Long Term)
Separate login for clients to view job status and approve quotes.
- Client receives a link to `app/portal/[token]`
- Reads job status, quote, and invoice — read only
- "Approve Quote" button (no e-signature in v1 — just a click confirmation)
- Requires a separate auth flow (not Clerk — token-based)

### Team Sharing / Multi-User
Allow a business owner to invite employees to the same FIELDKIT account.
- Owner sends invite link → invited user joins and sees shared jobs
- Role system: Owner · Admin · Field Tech (read-only jobs)
- Requires: `organizations` table in D1 + Clerk Organizations

### Mobile App Wrapper
Capacitor or React Native wrapper around the existing PWA for App Store distribution.
- Push notifications via native APIs
- Camera access for photo attachments
- Better offline handling

---

## ⚙️ Technical Debt

| Item | File | Notes |
|---|---|---|
| `shields.io` social icons in email sig HTML | `EmailSignatureGenerator.tsx` | Replace with inline SVG data URIs |
| `AssetGeneratorPanel` uses emoji icons | `AssetGeneratorPanel.tsx` | Replace with SVGs |
| `BrandingModal` Export tab stub | `BrandingModal.tsx` | Build or remove |
| `rounding_adjustment` not in D1 | `worker/schema.sql` + `worker/index.ts` | ALTER TABLE + update routes |
| PDF ignores branding preset | `lib/pdf.ts` | Wire `brandingStore` into PDF gen |
| Large bundles on /jobs, /invoices, /quotes | build output | jsPDF loaded on all 3 routes (~234kB each). Could be lazy-loaded. |
| Dashboard stats from localStorage | `app/page.tsx` | Should pull from D1 for multi-device accuracy |
| Invoices page not in nav | `app/invoices/page.tsx` | Add sidebar link |

---

## ✅ Recently Completed (Reference)

| Feature | Commit |
|---|---|
| Public quote share — API + cross-device | `4d977c4` |
| Create Job from client drawer (pre-selected client) | `c82d2b9` |
| fieldkit.md updated to v3.0 | `592ae6e` |
| Branding Studio — fix embedded generators, wire Business Card + QR Code, SVG icons | `bc6281d` |
| All native alert()/confirm() replaced — double-tap confirm pattern | `3ac8053` |
| Invoices Overdue filter tab | `0cd4d64` |
| Dashboard Create Job opens modal directly | `ead5ae0` |
