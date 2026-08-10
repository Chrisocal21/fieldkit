/**
 * Cloud sync logic — pulls from Cloudflare D1 and merges with localStorage data.
 *
 * Merge rules (per resource):
 *   - If D1 returned null (worker unreachable / not configured) → skip that resource.
 *   - If D1 returned [] (empty) → push all local items up.
 *   - If D1 returned items → merge: D1 takes precedence for matching IDs,
 *     and any local items not found in D1 are pushed up (new items created offline).
 */

import api, { diagnoseSyncIssue } from '@/lib/api'
import { useJobStore } from '@/store/jobStore'
import { useClientStore } from '@/store/clientStore'
import { useTeamStore } from '@/store/teamStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useMaterialCostStore } from '@/store/materialCostStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useTimeEntryStore } from '@/store/timeEntryStore'
import { useNoteStore } from '@/store/noteStore'
import { useBrandingStore } from '@/store/brandingStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useBoardSettingsStore } from '@/store/boardSettingsStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'

function isSameOriginWorker(): boolean {
  const raw = (process.env.NEXT_PUBLIC_WORKER_URL ?? '').trim()
  if (!raw) return true
  try {
    return new URL(raw).origin === window.location.origin
  } catch {
    return true
  }
}

/**
 * Merges a D1 response with local items.
 * Returns { merged, missing } where `missing` are local items not in D1.
 */
function mergeById<T extends { id: string }>(
  d1: T[] | null,
  local: T[]
): { merged: T[]; missing: T[] } | null {
  if (d1 === null) return null // D1 unreachable — leave store untouched
  const d1Ids = new Set(d1.map(i => i.id))
  const missing = local.filter(i => !d1Ids.has(i.id))
  return { merged: [...d1, ...missing], missing }
}

export async function syncWithCloud(): Promise<{ ok: boolean; pushed: Record<string, number>; reason?: string }> {
  if (typeof window === 'undefined') {
    return { ok: false, pushed: {} }
  }
  if (isSameOriginWorker()) {
    const reason = await diagnoseSyncIssue() ?? 'Cloud worker URL is not configured for this deployment'
    console.warn(`[fieldkit:sync] syncWithCloud() skipped: ${reason}`)
    return { ok: false, pushed: {}, reason }
  }

  // Snapshot local stores BEFORE any cloud overwrites
  const localJobs        = useJobStore.getState().jobs
  const localClients     = useClientStore.getState().clients
  const localTeam        = useTeamStore.getState().members
  const localItems       = useInventoryStore.getState().items
  const localAdjustments = useInventoryStore.getState().adjustments ?? []
  const localInvoices    = useInvoiceStore.getState().invoices
  const localExpenses    = useExpenseStore.getState().expenses
  const localMaterials   = useMaterialCostStore.getState().jobMaterials
  const localEntries     = useTimeEntryStore.getState().entries
  const localNoteFolders = useNoteStore.getState().folders
  const localNotes       = useNoteStore.getState().notes
  const localSettings    = useSettingsStore.getState()
  const localSubscription = useSubscriptionStore.getState()

  let ok = true
  let reason: string | undefined
  // Counts of local-only items found during merge — these are only "attempted"
  // pushes until api.sync() actually confirms the write; reporting these as
  // final `pushed` counts before that confirmation was the bug that made the
  // UI say "pushed 1 job" even when the upload had failed.
  const attemptedPush: Record<string, number> = {}

  try {
    const [jobs, clients, team, inventory, invoices, expenses, materials, timeEntries, noteFolders, notes, cloudSettings, cloudSubscription] =
      await Promise.all([
        api.jobs.list(),
        api.clients.list(),
        api.team.list(),
        api.inventory.list(),
        api.invoices.list(),
        api.expenses.list(),
        api.materials.list(),
        api.timeEntries.list(),
        api.noteFolders.list(),
        api.notes.list(),
        api.settings.get(),
        api.subscription.get(),
      ])

    // If every resource came back null, the worker call itself failed (network,
    // auth, or CORS) rather than the account simply having no data yet — don't
    // report success in that case, or devices will look "synced" while nothing
    // actually moved.
    if ([jobs, clients, team, inventory, invoices, expenses, materials, timeEntries, noteFolders, notes, cloudSettings, cloudSubscription].every(r => r === null)) {
      reason = await diagnoseSyncIssue() ?? 'Cloud requests all failed (network or authorization error) — see console for details'
      console.error(`[fieldkit:sync] syncWithCloud() aborted: ${reason}`)
      return { ok: false, pushed: {}, reason }
    }

    const syncPayload: Parameters<typeof api.sync>[0] = {}

    // ── Jobs ────────────────────────────────────────────────────────────────
    const jobResult = mergeById(jobs, localJobs)
    if (jobResult) {
      if (jobResult.merged.length) useJobStore.setState({ jobs: jobResult.merged })
      if (jobResult.missing.length) { syncPayload.jobs = jobResult.missing; attemptedPush.jobs = jobResult.missing.length }
    }

    // ── Clients ─────────────────────────────────────────────────────────────
    const clientResult = mergeById(clients, localClients)
    if (clientResult) {
      if (clientResult.merged.length) useClientStore.setState({ clients: clientResult.merged })
      if (clientResult.missing.length) { syncPayload.clients = clientResult.missing; attemptedPush.clients = clientResult.missing.length }
    }

    // ── Team ────────────────────────────────────────────────────────────────
    const teamResult = mergeById(team, localTeam)
    if (teamResult) {
      if (teamResult.merged.length) useTeamStore.setState({ members: teamResult.merged })
      if (teamResult.missing.length) { syncPayload.team = teamResult.missing; attemptedPush.team = teamResult.missing.length }
    }

    // ── Inventory ────────────────────────────────────────────────────────────
    if (inventory !== null) {
      const d1Items = inventory.items ?? []
      const d1Adjs  = inventory.adjustments ?? []
      const itemResult = mergeById(d1Items, localItems)
      const adjResult  = mergeById(d1Adjs, localAdjustments)
      const mergedItems = itemResult?.merged ?? d1Items
      const mergedAdjs  = adjResult?.merged  ?? d1Adjs
      useInventoryStore.setState({ items: mergedItems, adjustments: mergedAdjs })
      if (itemResult?.missing.length) { syncPayload.inventory = itemResult.missing; attemptedPush.inventory = itemResult.missing.length }
    }

    // ── Invoices ─────────────────────────────────────────────────────────────
    const invResult = mergeById(invoices, localInvoices)
    if (invResult) {
      if (invResult.merged.length) useInvoiceStore.setState({ invoices: invResult.merged })
      if (invResult.missing.length) { syncPayload.invoices = invResult.missing; attemptedPush.invoices = invResult.missing.length }
    }

    // ── Expenses ─────────────────────────────────────────────────────────────
    const expResult = mergeById(expenses, localExpenses)
    if (expResult) {
      if (expResult.merged.length) useExpenseStore.setState({ expenses: expResult.merged })
      if (expResult.missing.length) { syncPayload.expenses = expResult.missing; attemptedPush.expenses = expResult.missing.length }
    }

    // ── Materials ────────────────────────────────────────────────────────────
    const matResult = mergeById(materials, localMaterials)
    if (matResult) {
      if (matResult.merged.length) useMaterialCostStore.setState({ jobMaterials: matResult.merged })
      if (matResult.missing.length) { syncPayload.materials = matResult.missing; attemptedPush.materials = matResult.missing.length }
    }

    // ── Time entries ─────────────────────────────────────────────────────────
    const teResult = mergeById(timeEntries, localEntries)
    if (teResult) {
      if (teResult.merged.length) useTimeEntryStore.setState({ entries: teResult.merged })
      if (teResult.missing.length) { syncPayload.timeEntries = teResult.missing; attemptedPush.timeEntries = teResult.missing.length }
    }

    // ── Note folders ─────────────────────────────────────────────────────────
    const noteFolderResult = mergeById(noteFolders, localNoteFolders)
    if (noteFolderResult) {
      if (noteFolderResult.merged.length) useNoteStore.setState({ folders: noteFolderResult.merged })
      if (noteFolderResult.missing.length) { syncPayload.noteFolders = noteFolderResult.missing; attemptedPush.noteFolders = noteFolderResult.missing.length }
    }

    // ── Notes ────────────────────────────────────────────────────────────────
    const noteResult = mergeById(notes, localNotes)
    if (noteResult) {
      if (noteResult.merged.length) useNoteStore.setState({ notes: noteResult.merged })
      if (noteResult.missing.length) { syncPayload.notes = noteResult.missing; attemptedPush.notes = noteResult.missing.length }
    }

    // ── Settings ──────────────────────────────────────────────────────────────
    // Settings are a single object per user, not an array
    if (cloudSettings) {
      // Cloud has settings - merge with local (cloud takes precedence)
      useSettingsStore.setState({
        theme: cloudSettings.theme ?? localSettings.theme,
        defaultTaxRate: cloudSettings.defaultTaxRate ?? localSettings.defaultTaxRate,
        defaultPaymentTerms: cloudSettings.defaultPaymentTerms ?? localSettings.defaultPaymentTerms,
        defaultQuoteExpiry: cloudSettings.defaultQuoteExpiry ?? localSettings.defaultQuoteExpiry,
        invoicePrefix: cloudSettings.invoicePrefix ?? localSettings.invoicePrefix,
        quotePrefix: cloudSettings.quotePrefix ?? localSettings.quotePrefix,
        currency: cloudSettings.currency ?? localSettings.currency,
        notifications: cloudSettings.notifications ?? localSettings.notifications,
      })
    } else {
      // No cloud settings - push local
      syncPayload.settings = {
        theme: localSettings.theme,
        defaultTaxRate: localSettings.defaultTaxRate,
        defaultPaymentTerms: localSettings.defaultPaymentTerms,
        defaultQuoteExpiry: localSettings.defaultQuoteExpiry,
        invoicePrefix: localSettings.invoicePrefix,
        quotePrefix: localSettings.quotePrefix,
        currency: localSettings.currency,
        notifications: localSettings.notifications,
      }
      attemptedPush.settings = 1
    }

    // ── Subscription ──────────────────────────────────────────────────────────
    // Subscription is a single object per user, not an array
    if (cloudSubscription) {
      // Cloud has subscription - use it (cloud is source of truth)
      useSubscriptionStore.setState({
        currentPlan: cloudSubscription.currentPlan ?? localSubscription.currentPlan,
        trialEndsAt: cloudSubscription.trialEndsAt ?? localSubscription.trialEndsAt,
        isTrialActive: cloudSubscription.isTrialActive ?? localSubscription.isTrialActive,
        isLifetime: cloudSubscription.isLifetime ?? localSubscription.isLifetime,
      })
    } else {
      // No cloud subscription - push local
      syncPayload.subscription = {
        currentPlan: localSubscription.currentPlan,
        trialEndsAt: localSubscription.trialEndsAt,
        isTrialActive: localSubscription.isTrialActive,
        isLifetime: localSubscription.isLifetime,
      }
      attemptedPush.subscription = 1
    }

    // 

    // Push all missing local items in one batch — only report them as pushed
    // once the server actually confirms the write.
    let pushed: Record<string, number> = {}
    if (Object.keys(syncPayload).length > 0) {
      const syncResult = await api.sync(syncPayload)
      if (syncResult?.ok) {
        pushed = attemptedPush
      } else {
        ok = false
        reason = 'Cloud rejected the push — see console for details'
        console.error('[fieldkit:sync] api.sync() did not confirm the push', syncResult)
      }
    }

    // ── Branding presets ──────────────────────────────────────────────────────
    // Always push local presets to cloud; restore from cloud if local is empty.
    const localPresets = useBrandingStore.getState().presets
    const cloudBranding = await api.userBlobs.get('branding-presets')
    if (cloudBranding?.value?.presets?.length && localPresets.length === 0) {
      useBrandingStore.setState({ presets: cloudBranding.value.presets })
    } else {
      await api.userBlobs.set('branding-presets', { presets: localPresets })
    }

    // ── Board settings ────────────────────────────────────────────────────────
    const localColumns = useBoardSettingsStore.getState().columns
    const cloudBoard = await api.userBlobs.get('board-settings')
    if (cloudBoard?.value?.columns?.length && localColumns.length === 0) {
      useBoardSettingsStore.setState({ columns: cloudBoard.value.columns })
    } else {
      await api.userBlobs.set('board-settings', { columns: localColumns })
    }

    return { ok, pushed, reason }
  } catch (e) {
    console.error('[fieldkit:sync] syncWithCloud() threw', e)
    return {
      ok: false,
      pushed: {},
      reason: e instanceof Error ? e.message : 'Unknown sync error — see console for details',
    }
  }
}
