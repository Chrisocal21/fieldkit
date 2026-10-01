import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { fontVariables } from './fonts'
import ServiceWorkerRegistration from '@/components/shared/ServiceWorkerRegistration'
import InstallPrompt from '@/components/shared/InstallPrompt'
import GlobalSearch from '@/components/shared/GlobalSearch'
import StoreRehydrator from '@/components/shared/StoreRehydrator'
import ConditionalLayout from '@/components/shared/ConditionalLayout'

// All pages use Clerk auth — never statically prerender
export const dynamic = 'force-dynamic'

const description =
  'Jobs, quotes, invoices, and scheduling in one lightweight app built for crews in the field.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.get-fieldkit.com'),
  title: {
    default: 'FieldKit',
    template: '%s · FieldKit',
  },
  description,
  applicationName: 'FieldKit',
  // ?v= busts the copy browsers cached under the old year-long immutable header
  manifest: '/manifest.json?v=2',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    statusBarStyle: 'default',
    title: 'FIELDKIT',
  },
  openGraph: {
    type: 'website',
    siteName: 'FieldKit',
    title: 'FieldKit: run your service business without the chaos',
    description,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'FieldKit job board' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FieldKit: run your service business without the chaos',
    description,
    images: ['/og.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={fontVariables} suppressHydrationWarning>
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
            <ConditionalLayout>{children}</ConditionalLayout>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
