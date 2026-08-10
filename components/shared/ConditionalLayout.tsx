'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'
import MainContent from '@/components/shared/MainContent'
import TrialBanner from '@/components/shared/TrialBanner'
import DowngradedBanner from '@/components/shared/DowngradedBanner'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Public routes that don't need the app layout
  const isPublicRoute = pathname === '/' || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')

  if (isPublicRoute) {
    return <>{children}</>
  }

  return (
    <>
      <TrialBanner />
      <DowngradedBanner />
      <Sidebar />
      <MainContent>{children}</MainContent>
      <BottomNav />
    </>
  )
}
