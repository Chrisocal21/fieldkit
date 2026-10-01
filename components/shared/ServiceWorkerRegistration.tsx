'use client'

import { useEffect } from 'react'
import { syncWithCloud } from '@/lib/sync'
import { getCurrentUserId } from '@/lib/userStorage'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // A first-ever install also fires controllerchange (the SW claims the page).
    // Nothing is stale at that point, so don't reload a brand-new visitor.
    let hadController = !!navigator.serviceWorker.controller

    // Sync then reload when a new SW takes control (skipWaiting fires on install).
    const onControllerChange = () => {
      if (!hadController) {
        hadController = true
        return
      }
      // Signed-out visitors have nothing to sync; skip the round of 401s.
      const sync = getCurrentUserId() ? syncWithCloud() : Promise.resolve()
      sync
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
