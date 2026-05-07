/**
 * Thin API client for the FieldKit Cloudflare Worker.
 * All methods silently return null/false when the worker URL is not configured,
 * so the app falls back to localStorage-only mode during local dev.
 */

const BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL ?? ''

async function getToken(): Promise<string | null> {
  try {
    // Clerk exposes the session token on the window via the Clerk JS SDK.
    // __clerk_db_jwt is available after ClerkProvider mounts.
    if (typeof window === 'undefined') return null
    const clerk = (window as any).Clerk
    if (!clerk) return null
    const token = await clerk.session?.getToken()
    return token ?? null
  } catch {
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
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
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
  }) => request<{ ok: boolean; synced: Record<string, number> }>('POST', '/api/sync', payload),
}

export default api
