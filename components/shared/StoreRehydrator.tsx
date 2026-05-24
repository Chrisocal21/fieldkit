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
import api from '@/lib/api'

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
 * On sign-in:
 * 1. Namespace localStorage to the user.
 * 2. Rehydrate all stores from localStorage.
 * 3. Pull latest data from D1 and merge into stores.
 * 4. Push any localStorage data that isn't in D1 yet (first-time sync).
 */
async function syncWithCloud() {
  const _raw = process.env.NEXT_PUBLIC_WORKER_URL ?? ''
  let WORKER_URL = _raw
  if (_raw) {
    try {
      if (new URL(_raw).origin === window.location.origin) WORKER_URL = ''
    } catch { WORKER_URL = '' }
  }
  if (!WORKER_URL) return // No worker configured yet — local-only mode

  try {
    // Capture local (localStorage-rehydrated) data BEFORE any cloud overwrites.
    // This is critical: if a resource is missing from D1, we can push local up.
    const localJobs = useJobStore.getState().jobs
    const localClients = useClientStore.getState().clients
    const localTeam = useTeamStore.getState().members
    const localItems = useInventoryStore.getState().items
    const localInvoices = useInvoiceStore.getState().invoices
    const localExpenses = useExpenseStore.getState().expenses
    const localMaterials = useMaterialCostStore.getState().jobMaterials
    const localTimeEntries = useTimeEntryStore.getState().entries

    // Pull all data from D1
    const [jobs, clients, team, inventory, invoices, expenses, materials, timeEntries] =
      await Promise.all([
        api.jobs.list(),
        api.clients.list(),
        api.team.list(),
        api.inventory.list(),
        api.invoices.list(),
        api.expenses.list(),
        api.materials.list(),
        api.timeEntries.list(),
      ])

    // Only overwrite local store if D1 actually returned data for that resource.
    // An empty array from D1 must NOT wipe data that exists only in localStorage.
    if (jobs?.length) useJobStore.setState({ jobs })
    if (clients?.length) useClientStore.setState({ clients })
    if (team?.length) useTeamStore.setState({ members: team })
    if (inventory?.items?.length || inventory?.adjustments?.length) {
      useInventoryStore.setState({
        items: inventory!.items,
        adjustments: inventory!.adjustments,
      })
    }
    if (invoices?.length) useInvoiceStore.setState({ invoices })
    if (expenses?.length) useExpenseStore.setState({ expenses })
    if (materials?.length) useMaterialCostStore.setState({ jobMaterials: materials })
    if (timeEntries?.length) useTimeEntryStore.setState({ entries: timeEntries })

    // Per-resource: if D1 has nothing for a resource but localStorage does,
    // push that resource up so it's saved to the cloud.
    const syncPayload: Parameters<typeof api.sync>[0] = {}
    if (!jobs?.length && localJobs.length) syncPayload.jobs = localJobs
    if (!clients?.length && localClients.length) syncPayload.clients = localClients
    if (!team?.length && localTeam.length) syncPayload.team = localTeam
    if (!inventory?.items?.length && localItems.length) syncPayload.inventory = localItems
    if (!invoices?.length && localInvoices.length) syncPayload.invoices = localInvoices
    if (!expenses?.length && localExpenses.length) syncPayload.expenses = localExpenses
    if (!materials?.length && localMaterials.length) syncPayload.materials = localMaterials
    if (!timeEntries?.length && localTimeEntries.length) syncPayload.timeEntries = localTimeEntries

    if (Object.keys(syncPayload).length > 0) {
      await api.sync(syncPayload)
    }
  } catch {
    // Cloud sync failed — continue with local data, no disruption to UX
  }
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
      syncWithCloud()
    }
  }, [userId, isLoaded])

  return null
}
