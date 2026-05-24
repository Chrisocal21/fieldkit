import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'
import MainContent from '@/components/shared/MainContent'
import ServiceWorkerRegistration from '@/components/shared/ServiceWorkerRegistration'
import InstallPrompt from '@/components/shared/InstallPrompt'
import GlobalSearch from '@/components/shared/GlobalSearch'
import StoreRehydrator from '@/components/shared/StoreRehydrator'

// All pages use Clerk auth — never statically prerender
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FIELDKIT',
  description: 'Lightweight operations tool for service businesses',
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
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Anti-flash: apply dark class before React hydrates */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var t = localStorage.getItem('fieldkit-theme');
                    var sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (t === 'dark' || (!t && sys) || (t === 'system' && sys)) {
                      document.documentElement.classList.add('dark');
                    }
                  } catch(e) {}
                })();
              `,
            }}
          />
        </head>
        <body>
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <GlobalSearch />
          <StoreRehydrator />
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <MainContent>{children}</MainContent>
            <BottomNav />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
