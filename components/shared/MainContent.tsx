'use client'

import { useSettingsStore } from '@/store/settingsStore'

interface MainContentProps {
  children: React.ReactNode
  /** Full-width notices that sit above the page, inside the sidebar offset */
  banners?: React.ReactNode
}

export default function MainContent({ children, banners }: MainContentProps) {
  const sidebarCollapsed = useSettingsStore(s => s.sidebarCollapsed)
  return (
    <main className={`transition-[padding] duration-300 pb-16 lg:pb-0 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
      {banners}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {children}
      </div>
    </main>
  )
}
