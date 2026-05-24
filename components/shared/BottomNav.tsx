'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import SettingsModal from './SettingsModal'

const primaryNavItems = [
  {
    name: 'Home',
    href: '/',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? 'text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
]

const moreMenuItems = [
  {
    name: 'Team',
    href: '/team',
    icon: (
      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    name: 'Quotes',
    href: '/quotes',
    icon: (
      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: (
      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: (
      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
]

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
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
      
      {/* More Menu Panel */}
      {isMoreMenuOpen && (
        <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 lg:hidden shadow-lg">
          <div className="p-2 space-y-1">
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
                      ? 'bg-slate-100 dark:bg-slate-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className={`text-sm font-medium ${
                    isActive 
                      ? 'text-slate-900 dark:text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.name}
                  </span>
                </button>
              )
            })}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1">
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden z-30 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 transition-colors"
              >
                {item.icon(isActive)}
                <span
                  className={`text-[10px] font-medium ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
          
          {/* More Button */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <svg
              className={`w-6 h-6 ${
                isMoreActive || isMoreMenuOpen
                  ? 'text-slate-900 dark:text-white' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span
              className={`text-[10px] font-medium ${
                isMoreActive || isMoreMenuOpen
                  ? 'text-slate-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}
