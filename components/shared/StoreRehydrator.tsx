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
  const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? ''
  if (!WORKER_URL) return // No worker configured yet — local-only mode

  try {
    // Pull from D1 and overwrite local stores
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

    if (jobs) useJobStore.setState({ jobs })
    if (clients) useClientStore.setState({ clients })
    if (team) useTeamStore.setState({ members: team })
    if (inventory) {
      useInventoryStore.setState({
        items: inventory.items,
        adjustments: inventory.adjustments,
      })
    }
    if (invoices) useInvoiceStore.setState({ invoices })
    if (expenses) useExpenseStore.setState({ expenses })
    if (materials) useMaterialCostStore.setState({ jobMaterials: materials })
    if (timeEntries) useTimeEntryStore.setState({ entries: timeEntries })

    // If D1 is empty (new account with existing localStorage data), push it up
    const cloudIsEmpty =
      !jobs?.length && !clients?.length && !team?.length && !inventory?.items?.length

    if (cloudIsEmpty) {
      const localJobs = useJobStore.getState().jobs
      const localClients = useClientStore.getState().clients
      const localTeam = useTeamStore.getState().members
      const localItems = useInventoryStore.getState().items
      const localInvoices = useInvoiceStore.getState().invoices
      const localExpenses = useExpenseStore.getState().expenses
      const localMaterials = useMaterialCostStore.getState().jobMaterials
      const localTimeEntries = useTimeEntryStore.getState().entries

      const hasLocalData =
        localJobs.length || localClients.length || localTeam.length ||
        localItems.length || localInvoices.length || localExpenses.length ||
        localMaterials.length || localTimeEntries.length

      if (hasLocalData) {
        await api.sync({
          jobs: localJobs,
          clients: localClients,
          team: localTeam,
          inventory: localItems,
          invoices: localInvoices,
          expenses: localExpenses,
          materials: localMaterials,
          timeEntries: localTimeEntries,
        })
      }
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
