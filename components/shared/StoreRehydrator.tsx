'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { setCurrentUserId } from '@/lib/userStorage'
import { useJobStore } from '@/store/jobStore'
import { useQuoteStore } from '@/store/quoteStore'
import { useClientStore } from '@/store/clientStore'
import { useTeamStore } from '@/store/teamStore'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useMaterialCostStore } from '@/store/materialCostStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useTimeEntryStore } from '@/store/timeEntryStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { useBrandingStore } from '@/store/brandingStore'
import { useBusinessCardStore } from '@/store/businessCardStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useBoardSettingsStore } from '@/store/boardSettingsStore'
import { useNoteStore } from '@/store/noteStore'
import { syncWithCloud } from '@/lib/sync'

function rehydrateAll() {
  useJobStore.persist.rehydrate()
  useQuoteStore.persist.rehydrate()
  useClientStore.persist.rehydrate()
  useTeamStore.persist.rehydrate()
  useInvoiceStore.persist.rehydrate()
  useMaterialCostStore.persist.rehydrate()
  useExpenseStore.persist.rehydrate()
  useTimeEntryStore.persist.rehydrate()
  useInventoryStore.persist.rehydrate()
  useBrandingStore.persist.rehydrate()
  useBusinessCardStore.persist.rehydrate()
  useSettingsStore.persist.rehydrate()
  useSubscriptionStore.persist.rehydrate()
  useBoardSettingsStore.persist.rehydrate()
  useNoteStore.persist.rehydrate()
}

/**
 * Watches Clerk auth state. When the user changes (sign-in, sign-out,
 * or switch), updates the global userId used by userScopedStorage and
 * rehydrates all Zustand stores so they load from the correct
 * user-namespaced localStorage keys.
 */
export default function StoreRehydrator() {
  const { userId, isLoaded } = useAuth()
  const prevUserId = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (!isLoaded) return
    if (prevUserId.current === userId) return

    prevUserId.current = userId
    setCurrentUserId(userId ?? null)
    rehydrateAll()

    if (userId) {
      // Sync with Cloudflare D1 after local rehydration
      syncWithCloud().then((result) => {
        if (!result.ok) console.warn(`[fieldkit:sync] Post-login sync failed: ${result.reason ?? 'unknown reason'}`)
      })
    }
  }, [userId, isLoaded])

  // Keep devices converged without requiring a manual "Sync to Cloud" tap:
  // re-sync whenever the app regains focus/visibility (switching back from
  // another app/tab, waking the laptop, reopening the PWA) and on a background
  // interval while it stays open and signed in.
  useEffect(() => {
    if (!userId) return

    let syncing = false
    const runSync = () => {
      if (syncing) return
      syncing = true
      syncWithCloud()
        .then((result) => {
          if (!result.ok) console.warn(`[fieldkit:sync] Background sync failed: ${result.reason ?? 'unknown reason'}`)
        })
        .finally(() => { syncing = false })
    }

    // Debounced mutation sync — fires 1 s after any store change so every
    // user edit reaches the cloud without hammering the API on every keystroke.
    let mutationTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleSync = () => {
      if (mutationTimer) clearTimeout(mutationTimer)
      mutationTimer = setTimeout(runSync, 1_000)
    }

    const unsubs = [
      useJobStore.subscribe(scheduleSync),
      useClientStore.subscribe(scheduleSync),
      useInvoiceStore.subscribe(scheduleSync),
      useInventoryStore.subscribe(scheduleSync),
      useExpenseStore.subscribe(scheduleSync),
      useMaterialCostStore.subscribe(scheduleSync),
      useTimeEntryStore.subscribe(scheduleSync),
      useNoteStore.subscribe(scheduleSync),
      useTeamStore.subscribe(scheduleSync),
      useSettingsStore.subscribe(scheduleSync),
      useSubscriptionStore.subscribe(scheduleSync),
    ]

    const onVisible = () => {
      if (document.visibilityState === 'visible') runSync()
    }

    // pagehide fires when the PWA is backgrounded or the tab is closed — the
    // last reliable opportunity to flush before the process is suspended/killed.
    const onPageHide = () => { runSync() }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', runSync)
    window.addEventListener('pagehide', onPageHide)
    const interval = setInterval(runSync, 30_000) // Sync every 30 seconds for faster cross-device updates

    return () => {
      unsubs.forEach(u => u())
      if (mutationTimer) clearTimeout(mutationTimer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', runSync)
      window.removeEventListener('pagehide', onPageHide)
      clearInterval(interval)
    }
  }, [userId])

  return null
}
