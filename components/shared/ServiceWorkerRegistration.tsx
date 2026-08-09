'use client'

import { useEffect } from 'react'
import { syncWithCloud } from '@/lib/sync'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Sync then reload when a new SW takes control (skipWaiting fires on install).
    const onControllerChange = () => {
      syncWithCloud()
        .catch(() => {})
        .finally(() => window.location.reload())
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration)
        setInterval(() => registration.update(), 60_000)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
