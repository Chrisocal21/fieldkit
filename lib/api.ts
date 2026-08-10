/**
 * Thin API client for the FieldKit Cloudflare Worker.
 * All methods silently return null/false when the worker URL is not configured,
 * so the app falls back to localStorage-only mode during local dev.
 */

// .trim() guards against a stray trailing newline in the Vercel env var value
// (seen in production — copy/paste artifact), which otherwise silently rides
// along inside BASE_URL.
const _rawWorkerUrl = (process.env.NEXT_PUBLIC_WORKER_URL ?? '').trim()
// Treat the URL as unconfigured if it points to the same origin as the Next.js
// app (i.e. the env var was accidentally set to the Vercel deployment URL).
function resolvedBaseUrl(): string {
  if (!_rawWorkerUrl) {
    console.warn('[fieldkit:sync] NEXT_PUBLIC_WORKER_URL is not set — cloud sync is disabled')
    return ''
  }
  if (typeof window !== 'undefined') {
    try {
      const workerOrigin = new URL(_rawWorkerUrl).origin
      if (workerOrigin === window.location.origin) {
        console.warn(
          `[fieldkit:sync] NEXT_PUBLIC_WORKER_URL ("${_rawWorkerUrl}") resolves to this app's own origin — treating cloud sync as unconfigured`
        )
        return ''
      }
    } catch {
      console.warn(`[fieldkit:sync] NEXT_PUBLIC_WORKER_URL ("${_rawWorkerUrl}") is not a valid URL — cloud sync is disabled`)
      return ''
    }
  }
  return _rawWorkerUrl
}
const BASE_URL = resolvedBaseUrl()

/** Returns a human-readable reason cloud sync can't run right now, or null if it should work. */
export async function diagnoseSyncIssue(): Promise<string | null> {
  if (!BASE_URL) return 'Cloud worker URL is not configured for this deployment'
  if (typeof window === 'undefined') return null
  const clerk = (window as any).Clerk
  if (!clerk) return 'Clerk has not loaded yet'
  const token = await clerk.session?.getToken().catch(() => null)
  if (!token) return 'No active Clerk session token — user may not be signed in'
  return null
}

async function getToken(): Promise<string | null> {
  try {
    // Clerk exposes the session token on the window via the Clerk JS SDK.
    // __clerk_db_jwt is available after ClerkProvider mounts.
    if (typeof window === 'undefined') return null
    const clerk = (window as any).Clerk
    if (!clerk) {
      console.warn('[fieldkit:sync] window.Clerk is not available — cannot attach auth token to cloud request')
      return null
    }
    const token = await clerk.session?.getToken()
    if (!token) console.warn('[fieldkit:sync] Clerk session has no token — request will go out unauthenticated')
    return token ?? null
  } catch (e) {
    console.error('[fieldkit:sync] Failed to get Clerk token', e)
    return null
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T | null> {
  if (!BASE_URL) return null
  try {
    const token = await getToken()
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    if (!res.ok) {
      console.error(`[fieldkit:sync] ${method} ${path} failed: HTTP ${res.status}`)
      return null
    }
    return res.json() as Promise<T>
  } catch (e) {
    console.error(`[fieldkit:sync] ${method} ${path} threw`, e)
    return null
  }
}

const api = {
  // ── Jobs ────────────────────────────────────────────────────────────────────
  jobs: {
    list: () => request<any[]>('GET', '/api/jobs'),
    create: (data: any) => request<{ id: string }>('POST', '/api/jobs', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/jobs/${id}`, data),
    archive: (id: string) => request<{ ok: boolean }>('PATCH', `/api/jobs/${id}`, { archived: true }),
    addQuote: (jobId: string, data: any) =>
      request<{ id: string; quoteNumber: number }>('POST', `/api/jobs/${jobId}/quotes`, data),
  },

  // ── Quotes ──────────────────────────────────────────────────────────────────
  quotes: {
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/quotes/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/quotes/${id}`),
  },

  // ── Clients ─────────────────────────────────────────────────────────────────
  clients: {
    list: () => request<any[]>('GET', '/api/clients'),
    create: (data: any) => request<{ id: string }>('POST', '/api/clients', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/clients/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/clients/${id}`),
  },

  // ── Team ────────────────────────────────────────────────────────────────────
  team: {
    list: () => request<any[]>('GET', '/api/team'),
    create: (data: any) => request<{ id: string }>('POST', '/api/team', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/team/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/team/${id}`),
  },

  // ── Inventory ────────────────────────────────────────────────────────────────
  inventory: {
    list: () => request<{ items: any[]; adjustments: any[] }>('GET', '/api/inventory'),
    create: (data: any) => request<{ id: string }>('POST', '/api/inventory', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/inventory/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/inventory/${id}`),
    adjust: (id: string, delta: number, reason: string) =>
      request<{ id: string }>('POST', `/api/inventory/${id}/adjust`, { delta, reason }),
  },

  // ── Invoices ─────────────────────────────────────────────────────────────────
  invoices: {
    list: () => request<any[]>('GET', '/api/invoices'),
    create: (data: any) => request<{ id: string }>('POST', '/api/invoices', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/invoices/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/invoices/${id}`),
    addPayment: (invoiceId: string, data: any) =>
      request<{ id: string }>('POST', `/api/invoices/${invoiceId}/payments`, data),
    deletePayment: (paymentId: string) =>
      request<{ ok: boolean }>('DELETE', `/api/payments/${paymentId}`),
  },

  // ── Expenses ──────────────────────────────────────────────────────────────────
  expenses: {
    list: () => request<any[]>('GET', '/api/expenses'),
    create: (data: any) => request<{ id: string }>('POST', '/api/expenses', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/expenses/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/expenses/${id}`),
  },

  // ── Materials ─────────────────────────────────────────────────────────────────
  materials: {
    list: () => request<any[]>('GET', '/api/materials'),
    create: (data: any) => request<{ id: string }>('POST', '/api/materials', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/materials/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/materials/${id}`),
  },

  // ── Time entries ───────────────────────────────────────────────────────────────
  timeEntries: {
    list: () => request<any[]>('GET', '/api/time-entries'),
    create: (data: any) => request<{ id: string }>('POST', '/api/time-entries', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/time-entries/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/time-entries/${id}`),
  },

  // ── Note folders ────────────────────────────────────────────────────────────
  noteFolders: {
    list: () => request<any[]>('GET', '/api/note-folders'),
    create: (data: any) => request<{ id: string }>('POST', '/api/note-folders', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/note-folders/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/note-folders/${id}`),
  },

  // ── Notes ───────────────────────────────────────────────────────────────────
  notes: {
    list: () => request<any[]>('GET', '/api/notes'),
    create: (data: any) => request<{ id: string }>('POST', '/api/notes', data),
    update: (id: string, data: any) => request<{ ok: boolean }>('PATCH', `/api/notes/${id}`, data),
    delete: (id: string) => request<{ ok: boolean }>('DELETE', `/api/notes/${id}`),
  },

  // ── User blobs (branding presets, settings, board layout) ─────────────────
  userBlobs: {
    get: (key: string) =>
      request<{ value: any; updatedAt: number } | null>('GET', `/api/user-blobs/${encodeURIComponent(key)}`),
    set: (key: string, value: any) =>
      request<{ ok: boolean }>('PUT', `/api/user-blobs/${encodeURIComponent(key)}`, { value }),
  },

  // ── Bulk sync (push localStorage data to D1 on first sign-in) ─────────────────
  sync: (payload: {
    jobs?: any[]
    clients?: any[]
    team?: any[]
    inventory?: any[]
    invoices?: any[]
    expenses?: any[]
    materials?: any[]
    timeEntries?: any[]
    noteFolders?: any[]
    notes?: any[]
  }) => request<{ ok: boolean; synced: Record<string, number> }>('POST', '/api/sync', payload),
}

export default api
