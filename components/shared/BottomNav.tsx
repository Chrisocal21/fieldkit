'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import SettingsModal from './SettingsModal'
import { LogoMark } from './Logo'

const primaryNavItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
]

const moreMenuItems = [
  {
    name: 'Plans',
    href: '/plans',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
  {
    name: 'Team',
    href: '/team',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    name: 'Quotes',
    href: '/quotes',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
]

const SETTINGS_ICON = [
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
]

function NavIcon({ d, className = '' }: { d: string | string[]; className?: string }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {paths.map((p) => (
        <path key={p} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={p} />
      ))}
    </svg>
  )
}

const tabIconClass = (active: boolean) =>
  `w-6 h-6 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`

const tabLabelClass = (active: boolean) =>
  `text-[10px] font-medium ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const isMoreActive = moreMenuItems.some(item => pathname === item.href)

  return (
    <>
      {/* More Menu Overlay */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}

      {/* More Menu Panel */}
      {isMoreMenuOpen && (
        <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl z-50 lg:hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg font-bold tracking-[0.04em] text-gray-900 dark:text-white">FIELDKIT</span>
          </div>
          <div className="p-2 space-y-0.5">
            {moreMenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setIsMoreMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <NavIcon
                    d={item.icon}
                    className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
                  />
                  <span className={`text-sm font-medium ${
                    isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.name}
                  </span>
                </button>
              )
            })}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-0.5">
              {/* Profile / Account */}
              <div className="flex items-center gap-3 px-4 py-3">
                <UserButton afterSignOutUrl="/sign-in" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</span>
              </div>
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false)
                  setIsSettingsOpen(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <NavIcon d={SETTINGS_ICON} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav aria-label="Main" className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 lg:hidden z-30 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <NavIcon d={item.icon} className={tabIconClass(isActive)} />
                <span className={tabLabelClass(isActive)}>{item.name}</span>
              </Link>
            )
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            aria-expanded={isMoreMenuOpen}
            className="flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <NavIcon d="M4 6h16M4 12h16M4 18h16" className={tabIconClass(isMoreActive || isMoreMenuOpen)} />
            <span className={tabLabelClass(isMoreActive || isMoreMenuOpen)}>More</span>
          </button>
        </div>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}
