'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/shared/Logo'
import { isPublicPath } from '@/lib/routes'

export default function InstallPrompt() {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show prompt after a delay (don't be too pushy)
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed')
        if (!hasSeenPrompt) {
          setShowPrompt(true)
        }
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-prompt-dismissed', 'true')
  }

  // Only offer the install inside the app, never on the landing page or a
  // client-facing quote link.
  if (!showPrompt || isPublicPath(pathname)) return null

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:max-w-sm z-40">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <LogoMark className="w-10 h-10" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Install FieldKit
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Add it to your home screen. It opens faster and keeps working offline.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
