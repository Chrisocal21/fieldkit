'use client'

import { useSettingsStore } from '@/store/settingsStore'

export default function MainContent({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useSettingsStore(s => s.sidebarCollapsed)
  return (
    <main className={`transition-all duration-300 pb-16 lg:pb-0 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {children}
      </div>
    </main>
  )
}
