'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'
import MainContent from '@/components/shared/MainContent'
import TrialBanner from '@/components/shared/TrialBanner'
import DowngradedBanner from '@/components/shared/DowngradedBanner'
import { isPublicPath } from '@/lib/routes'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Public routes (landing, auth, shared quotes) render without the app shell
  if (isPublicPath(pathname)) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <MainContent
        banners={
          <>
            <TrialBanner />
            <DowngradedBanner />
          </>
        }
      >
        {children}
      </MainContent>
      <BottomNav />
    </>
  )
}
