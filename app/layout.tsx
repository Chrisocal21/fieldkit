import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'
import ServiceWorkerRegistration from '@/components/shared/ServiceWorkerRegistration'
import InstallPrompt from '@/components/shared/InstallPrompt'
import GlobalSearch from '@/components/shared/GlobalSearch'
import StoreRehydrator from '@/components/shared/StoreRehydrator'

// All pages use Clerk auth — never statically prerender
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FIELDKIT',
  description: 'Free, lightweight operations tool for service businesses',
  manifest: '/manifest.json',
  icons: { icon: '/logo.svg', apple: '/icon-192.png' },
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'FIELDKIT',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <GlobalSearch />
          <StoreRehydrator />
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <main className="lg:pl-64 pb-16 lg:pb-0">
              <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
                {children}
              </div>
            </main>
            <BottomNav />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
