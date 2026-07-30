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
import { useBoardSettingsStore } from '@/store/boardSettingsStore'
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
  useBoardSettingsStore.persist.rehydrate()
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

  return null
}
