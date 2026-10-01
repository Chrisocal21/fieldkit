/**
 * Routes that render without the app shell (sidebar, bottom nav, banners,
 * search, install prompt). Keep in sync with the public matcher in middleware.ts.
 */
export function isPublicPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return (
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/quotes/share/')
  )
}
