# FIELDKIT

A free, lightweight operations PWA for small service businesses.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Zustand
- **Backend:** Cloudflare Workers + D1 + R2 (Phase 7)
- **Deployment:** Vercel (frontend) · Cloudflare (backend)

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Project Status

**Phase 1 Complete ✅**
- Next.js 14 scaffolded with TypeScript
- Tailwind CSS configured with status colors
- Zustand stores with localStorage persistence
- Mock data for all modules
- Shared components (StatusBadge, EmptyState, SkeletonLoader)
- Navigation shell (BottomNav for mobile, Sidebar for desktop)
- All four module routes created and working

**Current Phase:** Ready for Phase 2 (Jobs Module)

## Modules

1. **Jobs** - Track work orders from creation to completion
2. **Quotes** - Create clean, shareable quotes
3. **Schedule** - Visual calendar of upcoming work
4. **Inventory** - Track consumable materials and supplies

## Documentation

See [fieldkit.md](./fieldkit.md) for complete project specifications and build phases.
