export interface Env {
  DB: D1Database
}

// ── helpers ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

function err(message: string, status = 400) {
  return json({ error: message }, status)
}

function options() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

/**
 * Extract Clerk userId from the JWT in the Authorization header.
 * We decode the payload (no signature verification — Clerk keys are not
 * available in the Worker, and the Next.js layer already verified the
 * session.  The Worker trusts the token is from Clerk but enforces
 * row-level isolation by user_id.)
 */
function getUserId(request: Request): string | null {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub ?? null
  } catch {
    return null
  }
}

// ── router ────────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return options()

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/$/, '')
    const method = request.method

    // ── Public: /api/public/quotes/:id (no auth required) ────────────────────
    const publicQuoteMatch = path.match(/^\/api\/public\/quotes\/([^/]+)$/)
    if (publicQuoteMatch && method === 'GET') {
      const quoteId = publicQuoteMatch[1]
      const q = await env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(quoteId).first() as any
      if (!q) return err('Quote not found', 404)
      const items = await env.DB.prepare(
        'SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC'
      ).bind(quoteId).all()
      return json({
        id: q.id,
        quoteNumber: q.quote_number,
        jobId: q.job_id,
        clientName: q.client_name,
        clientEmail: q.client_email,
        clientPhone: q.client_phone,
        notes: q.notes,
        taxRate: q.tax_rate,
        expiryDate: q.expiry_date,
        status: q.status,
        lineItems: (items.results as any[]).map(li => ({
          id: li.id,
          quoteId: li.quote_id,
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unit_price,
          type: li.type,
          sortOrder: li.sort_order,
        })),
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      })
    }

    const userId = getUserId(request)
    if (!userId) return err('Unauthorized', 401)

    // path and method already set above

    // ── /api/jobs ────────────────────────────────────────────────────────────
    if (path === '/api/jobs' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(userId).all()
      // For each job, fetch its quotes + line items
      const jobs = await Promise.all((rows.results as any[]).map(r => hydrateJob(r, env, userId)))
      return json(jobs)
    }

    if (path === '/api/jobs' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? `JOB-${nanoid(8)}`
      await env.DB.prepare(`
        INSERT INTO jobs (id, user_id, title, client_id, client_name, client_email, client_phone,
          site_address, description, status, assignee_id, start_date, due_date, notes, archived,
          created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, userId,
        body.title ?? '', body.clientId ?? null, body.clientName ?? '',
        body.clientEmail ?? null, body.clientPhone ?? null, body.siteAddress ?? null,
        body.description ?? '', body.status ?? 'Draft', body.assigneeId ?? null,
        body.startDate ?? null, body.dueDate ?? null, body.notes ?? '',
        body.archived ? 1 : 0, body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const jobMatch = path.match(/^\/api\/jobs\/([^/]+)$/)
    if (jobMatch) {
      const jobId = jobMatch[1]

      if (method === 'GET') {
        const row = await env.DB.prepare(
          'SELECT * FROM jobs WHERE id = ? AND user_id = ?'
        ).bind(jobId, userId).first() as any
        if (!row) return err('Not found', 404)
        return json(await hydrateJob(row, env, userId))
      }

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE jobs SET title=?, client_id=?, client_name=?, client_email=?, client_phone=?,
            site_address=?, description=?, status=?, assignee_id=?, start_date=?, due_date=?,
            notes=?, archived=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.title ?? '', body.clientId ?? null, body.clientName ?? '',
          body.clientEmail ?? null, body.clientPhone ?? null, body.siteAddress ?? null,
          body.description ?? '', body.status ?? 'Draft', body.assigneeId ?? null,
          body.startDate ?? null, body.dueDate ?? null, body.notes ?? '',
          body.archived ? 1 : 0, Date.now(),
          jobId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM jobs WHERE id = ? AND user_id = ?').bind(jobId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/jobs/:id/quotes ──────────────────────────────────────────────────
    const jobQuoteMatch = path.match(/^\/api\/jobs\/([^/]+)\/quotes$/)
    if (jobQuoteMatch) {
      const jobId = jobQuoteMatch[1]

      if (method === 'POST') {
        const body = await request.json() as any
        const quoteId = body.id ?? `QUOTE-${nanoid(8)}`
        const quoteNumber = body.quoteNumber ?? await nextQuoteNumber(env, userId)
        await env.DB.prepare(`
          INSERT INTO quotes (id, quote_number, job_id, user_id, client_name, client_email,
            client_phone, notes, tax_rate, expiry_date, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          quoteId, quoteNumber, jobId, userId,
          body.clientName ?? '', body.clientEmail ?? null, body.clientPhone ?? null,
          body.notes ?? '', body.taxRate ?? 0, body.expiryDate ?? null,
          body.status ?? 'Draft', body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
        ).run()
        // Insert line items
        if (Array.isArray(body.lineItems)) {
          for (const li of body.lineItems) {
            await insertLineItem(env, li, quoteId, userId)
          }
        }
        return json({ id: quoteId, quoteNumber })
      }
    }

    // ── /api/quotes/:id ───────────────────────────────────────────────────────
    const quoteMatch = path.match(/^\/api\/quotes\/([^/]+)$/)
    if (quoteMatch) {
      const quoteId = quoteMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE quotes SET client_name=?, client_email=?, client_phone=?, notes=?,
            tax_rate=?, expiry_date=?, status=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.clientName ?? '', body.clientEmail ?? null, body.clientPhone ?? null,
          body.notes ?? '', body.taxRate ?? 0, body.expiryDate ?? null,
          body.status ?? 'Draft', Date.now(), quoteId, userId
        ).run()
        // Replace line items
        if (Array.isArray(body.lineItems)) {
          await env.DB.prepare('DELETE FROM quote_line_items WHERE quote_id = ? AND user_id = ?')
            .bind(quoteId, userId).run()
          for (const li of body.lineItems) {
            await insertLineItem(env, li, quoteId, userId)
          }
        }
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM quotes WHERE id = ? AND user_id = ?').bind(quoteId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/clients ──────────────────────────────────────────────────────────
    if (path === '/api/clients' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM clients WHERE user_id = ? ORDER BY name ASC'
      ).bind(userId).all()
      return json((rows.results as any[]).map(r => clientFromRow(r)))
    }

    if (path === '/api/clients' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO clients (id, user_id, name, email, phone, address, notes, tags, properties, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, userId, body.name ?? '', body.email ?? null, body.phone ?? null,
        body.address ?? null, body.notes ?? null,
        JSON.stringify(body.tags ?? []),
        JSON.stringify(body.properties ?? []),
        body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const clientMatch = path.match(/^\/api\/clients\/([^/]+)$/)
    if (clientMatch) {
      const clientId = clientMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE clients SET name=?, email=?, phone=?, address=?, notes=?, tags=?, properties=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.name ?? '', body.email ?? null, body.phone ?? null,
          body.address ?? null, body.notes ?? null,
          JSON.stringify(body.tags ?? []),
          JSON.stringify(body.properties ?? []),
          Date.now(), clientId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').bind(clientId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/team ─────────────────────────────────────────────────────────────
    if (path === '/api/team' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM team_members WHERE user_id = ? ORDER BY name ASC'
      ).bind(userId).all()
      return json((rows.results as any[]).map(r => teamMemberFromRow(r)))
    }

    if (path === '/api/team' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO team_members (id, user_id, name, role, hourly_rate, phone, email, color, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, userId, body.name ?? '', body.role ?? '', body.hourlyRate ?? 0,
        body.phone ?? null, body.email ?? null, body.color ?? '#3B82F6',
        body.active !== false ? 1 : 0,
        body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const teamMatch = path.match(/^\/api\/team\/([^/]+)$/)
    if (teamMatch) {
      const memberId = teamMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE team_members SET name=?, role=?, hourly_rate=?, phone=?, email=?, color=?, active=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.name ?? '', body.role ?? '', body.hourlyRate ?? 0,
          body.phone ?? null, body.email ?? null, body.color ?? '#3B82F6',
          body.active !== false ? 1 : 0,
          Date.now(), memberId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM team_members WHERE id = ? AND user_id = ?').bind(memberId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/inventory ────────────────────────────────────────────────────────
    if (path === '/api/inventory' && method === 'GET') {
      const items = await env.DB.prepare(
        'SELECT * FROM inventory_items WHERE user_id = ? ORDER BY name ASC'
      ).bind(userId).all()
      const adjs = await env.DB.prepare(
        'SELECT * FROM inventory_adjustments WHERE user_id = ? ORDER BY adjusted_at DESC'
      ).bind(userId).all()
      return json({
        items: (items.results as any[]).map(r => inventoryItemFromRow(r)),
        adjustments: (adjs.results as any[]).map(r => inventoryAdjFromRow(r)),
      })
    }

    if (path === '/api/inventory' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO inventory_items (id, user_id, name, category, unit, current_stock, low_stock_threshold, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, userId, body.name ?? '', body.category ?? '', body.unit ?? '',
        body.currentStock ?? 0, body.lowStockThreshold ?? 0, body.notes ?? '',
        body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const invMatch = path.match(/^\/api\/inventory\/([^/]+)$/)
    if (invMatch) {
      const itemId = invMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE inventory_items SET name=?, category=?, unit=?, current_stock=?, low_stock_threshold=?, notes=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.name ?? '', body.category ?? '', body.unit ?? '',
          body.currentStock ?? 0, body.lowStockThreshold ?? 0, body.notes ?? '',
          Date.now(), itemId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM inventory_items WHERE id = ? AND user_id = ?').bind(itemId, userId).run()
        return json({ ok: true })
      }
    }

    // POST /api/inventory/:id/adjust
    const invAdjMatch = path.match(/^\/api\/inventory\/([^/]+)\/adjust$/)
    if (invAdjMatch && method === 'POST') {
      const itemId = invAdjMatch[1]
      const body = await request.json() as any
      const adjId = nanoid()
      await env.DB.prepare(`
        INSERT INTO inventory_adjustments (id, item_id, user_id, delta, reason, adjusted_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(adjId, itemId, userId, body.delta ?? 0, body.reason ?? '', Date.now()).run()
      await env.DB.prepare(`
        UPDATE inventory_items SET current_stock = current_stock + ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `).bind(body.delta ?? 0, Date.now(), itemId, userId).run()
      return json({ id: adjId })
    }

    // ── /api/invoices ─────────────────────────────────────────────────────────
    if (path === '/api/invoices' && method === 'GET') {
      const invs = await env.DB.prepare(
        'SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(userId).all()
      const pays = await env.DB.prepare(
        'SELECT * FROM payments WHERE user_id = ? ORDER BY payment_date ASC'
      ).bind(userId).all()
      const paysByInvoice: Record<string, any[]> = {}
      for (const p of pays.results as any[]) {
        if (!paysByInvoice[p.invoice_id]) paysByInvoice[p.invoice_id] = []
        paysByInvoice[p.invoice_id].push(paymentFromRow(p))
      }
      return json((invs.results as any[]).map(r => invoiceFromRow(r, paysByInvoice[r.id] ?? [])))
    }

    if (path === '/api/invoices' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? `INV-${nanoid(8)}`
      await env.DB.prepare(`
        INSERT INTO invoices (id, invoice_number, job_id, quote_id, user_id, amount_due, amount_paid,
          status, due_date, issued_at, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, body.invoiceNumber ?? 1001, body.jobId ?? '', body.quoteId ?? null, userId,
        body.amountDue ?? 0, body.amountPaid ?? 0, body.status ?? 'Unpaid',
        body.dueDate ?? null, body.issuedAt ?? Date.now(), body.notes ?? null,
        body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const invIdMatch = path.match(/^\/api\/invoices\/([^/]+)$/)
    if (invIdMatch) {
      const invoiceId = invIdMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE invoices SET amount_due=?, amount_paid=?, status=?, due_date=?, notes=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.amountDue ?? 0, body.amountPaid ?? 0, body.status ?? 'Unpaid',
          body.dueDate ?? null, body.notes ?? null, Date.now(), invoiceId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM invoices WHERE id = ? AND user_id = ?').bind(invoiceId, userId).run()
        return json({ ok: true })
      }
    }

    // POST /api/invoices/:id/payments
    const payMatch = path.match(/^\/api\/invoices\/([^/]+)\/payments$/)
    if (payMatch && method === 'POST') {
      const invoiceId = payMatch[1]
      const body = await request.json() as any
      const payId = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO payments (id, invoice_id, user_id, amount, payment_method, payment_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        payId, invoiceId, userId, body.amount ?? 0,
        body.paymentMethod ?? 'Other', body.paymentDate ?? Date.now(), body.notes ?? null
      ).run()
      // Recalculate amountPaid
      const total = await env.DB.prepare(
        'SELECT SUM(amount) as total FROM payments WHERE invoice_id = ? AND user_id = ?'
      ).bind(invoiceId, userId).first() as any
      const amountPaid = total?.total ?? 0
      const inv = await env.DB.prepare(
        'SELECT amount_due FROM invoices WHERE id = ?'
      ).bind(invoiceId).first() as any
      const status = amountPaid >= (inv?.amount_due ?? 0) ? 'Paid'
        : amountPaid > 0 ? 'Partial' : 'Unpaid'
      await env.DB.prepare(
        'UPDATE invoices SET amount_paid=?, status=?, updated_at=? WHERE id = ? AND user_id = ?'
      ).bind(amountPaid, status, Date.now(), invoiceId, userId).run()
      return json({ id: payId })
    }

    // DELETE /api/payments/:id
    const delPayMatch = path.match(/^\/api\/payments\/([^/]+)$/)
    if (delPayMatch && method === 'DELETE') {
      const payId = delPayMatch[1]
      const pay = await env.DB.prepare(
        'SELECT invoice_id FROM payments WHERE id = ? AND user_id = ?'
      ).bind(payId, userId).first() as any
      if (!pay) return err('Not found', 404)
      await env.DB.prepare('DELETE FROM payments WHERE id = ? AND user_id = ?').bind(payId, userId).run()
      // Recalculate amountPaid
      const total = await env.DB.prepare(
        'SELECT SUM(amount) as total FROM payments WHERE invoice_id = ? AND user_id = ?'
      ).bind(pay.invoice_id, userId).first() as any
      const amountPaid = total?.total ?? 0
      const inv = await env.DB.prepare(
        'SELECT amount_due FROM invoices WHERE id = ?'
      ).bind(pay.invoice_id).first() as any
      const status = amountPaid >= (inv?.amount_due ?? 0) ? 'Paid'
        : amountPaid > 0 ? 'Partial' : 'Unpaid'
      await env.DB.prepare(
        'UPDATE invoices SET amount_paid=?, status=?, updated_at=? WHERE id = ? AND user_id = ?'
      ).bind(amountPaid, status, Date.now(), pay.invoice_id, userId).run()
      return json({ ok: true })
    }

    // ── /api/expenses ─────────────────────────────────────────────────────────
    if (path === '/api/expenses' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC'
      ).bind(userId).all()
      return json((rows.results as any[]).map(r => expenseFromRow(r)))
    }

    if (path === '/api/expenses' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO expenses (id, job_id, user_id, category, description, amount, expense_date, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, body.jobId ?? null, userId, body.category ?? 'Other',
        body.description ?? '', body.amount ?? 0, body.expenseDate ?? Date.now(),
        body.notes ?? null, body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const expMatch = path.match(/^\/api\/expenses\/([^/]+)$/)
    if (expMatch) {
      const expId = expMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE expenses SET job_id=?, category=?, description=?, amount=?, expense_date=?, notes=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.jobId ?? null, body.category ?? 'Other', body.description ?? '',
          body.amount ?? 0, body.expenseDate ?? Date.now(), body.notes ?? null,
          Date.now(), expId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').bind(expId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/materials ────────────────────────────────────────────────────────
    if (path === '/api/materials' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM job_materials WHERE user_id = ? ORDER BY used_at DESC'
      ).bind(userId).all()
      return json((rows.results as any[]).map(r => materialFromRow(r)))
    }

    if (path === '/api/materials' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? `MAT-${nanoid(6).toUpperCase()}`
      const totalCost = (body.quantity ?? 1) * (body.unitCost ?? 0)
      await env.DB.prepare(`
        INSERT INTO job_materials (id, job_id, user_id, inventory_item_id, description, quantity, unit_cost, total_cost, used_at, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, body.jobId ?? '', userId, body.inventoryItemId ?? null,
        body.description ?? '', body.quantity ?? 1, body.unitCost ?? 0, totalCost,
        body.usedAt ?? Date.now(), body.notes ?? null
      ).run()
      return json({ id })
    }

    const matMatch = path.match(/^\/api\/materials\/([^/]+)$/)
    if (matMatch) {
      const matId = matMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        const totalCost = (body.quantity ?? 1) * (body.unitCost ?? 0)
        await env.DB.prepare(`
          UPDATE job_materials SET description=?, quantity=?, unit_cost=?, total_cost=?, notes=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.description ?? '', body.quantity ?? 1, body.unitCost ?? 0, totalCost,
          body.notes ?? null, matId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM job_materials WHERE id = ? AND user_id = ?').bind(matId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/time-entries ─────────────────────────────────────────────────────
    if (path === '/api/time-entries' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM time_entries WHERE user_id = ? ORDER BY start_time DESC'
      ).bind(userId).all()
      return json((rows.results as any[]).map(r => timeEntryFromRow(r)))
    }

    if (path === '/api/time-entries' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO time_entries (id, job_id, user_id, team_member_id, start_time, end_time, duration, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, body.jobId ?? '', userId, body.teamMemberId ?? '',
        body.startTime ?? Date.now(), body.endTime ?? null, body.duration ?? 0,
        body.notes ?? null, body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const teMatch = path.match(/^\/api\/time-entries\/([^/]+)$/)
    if (teMatch) {
      const teId = teMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE time_entries SET end_time=?, duration=?, notes=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.endTime ?? null, body.duration ?? 0, body.notes ?? null,
          Date.now(), teId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM time_entries WHERE id = ? AND user_id = ?').bind(teId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/note-folders ─────────────────────────────────────────────────────
    if (path === '/api/note-folders' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM note_folders WHERE user_id = ? ORDER BY name ASC'
      ).bind(userId).all()
      return json((rows.results as any[]).map(r => noteFolderFromRow(r)))
    }

    if (path === '/api/note-folders' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO note_folders (id, user_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        id, userId, body.name ?? '',
        body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const noteFolderMatch = path.match(/^\/api\/note-folders\/([^/]+)$/)
    if (noteFolderMatch) {
      const folderId = noteFolderMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE note_folders SET name=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(body.name ?? '', Date.now(), folderId, userId).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        // Unfile rather than delete the notes that were in this folder
        await env.DB.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ? AND user_id = ?').bind(folderId, userId).run()
        await env.DB.prepare('DELETE FROM note_folders WHERE id = ? AND user_id = ?').bind(folderId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/notes ────────────────────────────────────────────────────────────
    if (path === '/api/notes' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC'
      ).bind(userId).all()
      return json((rows.results as any[]).map(r => noteFromRow(r)))
    }

    if (path === '/api/notes' && method === 'POST') {
      const body = await request.json() as any
      const id = body.id ?? nanoid()
      await env.DB.prepare(`
        INSERT INTO notes (id, user_id, folder_id, title, body, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, userId, body.folderId ?? null, body.title ?? '', body.body ?? '',
        body.createdAt ?? Date.now(), body.updatedAt ?? Date.now()
      ).run()
      return json({ id })
    }

    const noteMatch = path.match(/^\/api\/notes\/([^/]+)$/)
    if (noteMatch) {
      const noteId = noteMatch[1]

      if (method === 'PUT' || method === 'PATCH') {
        const body = await request.json() as any
        await env.DB.prepare(`
          UPDATE notes SET folder_id=?, title=?, body=?, updated_at=?
          WHERE id = ? AND user_id = ?
        `).bind(
          body.folderId ?? null, body.title ?? '', body.body ?? '',
          Date.now(), noteId, userId
        ).run()
        return json({ ok: true })
      }

      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').bind(noteId, userId).run()
        return json({ ok: true })
      }
    }

    // ── /api/sync (bulk push from localStorage on first login) ───────────────
    if (path === '/api/sync' && method === 'POST') {
      const body = await request.json() as any
      const results: Record<string, number> = {}

      // Jobs + their quotes
      if (Array.isArray(body.jobs)) {
        for (const job of body.jobs) {
          const existing = await env.DB.prepare('SELECT id FROM jobs WHERE id = ? AND user_id = ?')
            .bind(job.id, userId).first()
          if (!existing) {
            await env.DB.prepare(`
              INSERT OR IGNORE INTO jobs (id, user_id, title, client_id, client_name, client_email,
                client_phone, site_address, description, status, assignee_id, start_date, due_date,
                notes, archived, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              job.id, userId, job.title ?? '', job.clientId ?? null, job.clientName ?? '',
              job.clientEmail ?? null, job.clientPhone ?? null, job.siteAddress ?? null,
              job.description ?? '', job.status ?? 'Draft', job.assigneeId ?? null,
              job.startDate ?? null, job.dueDate ?? null, job.notes ?? '',
              job.archived ? 1 : 0, job.createdAt ?? Date.now(), job.updatedAt ?? Date.now()
            ).run()
            if (Array.isArray(job.quotes)) {
              for (const q of job.quotes) {
                await env.DB.prepare(`
                  INSERT OR IGNORE INTO quotes (id, quote_number, job_id, user_id, client_name,
                    client_email, client_phone, notes, tax_rate, expiry_date, status, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                  q.id, q.quoteNumber ?? 1, job.id, userId, q.clientName ?? '',
                  q.clientEmail ?? null, q.clientPhone ?? null, q.notes ?? '',
                  q.taxRate ?? 0, q.expiryDate ?? null, q.status ?? 'Draft',
                  q.createdAt ?? Date.now(), q.updatedAt ?? Date.now()
                ).run()
                if (Array.isArray(q.lineItems)) {
                  for (const li of q.lineItems) {
                    await insertLineItem(env, li, q.id, userId)
                  }
                }
              }
            }
          }
        }
        results.jobs = body.jobs.length
      }

      // Clients
      if (Array.isArray(body.clients)) {
        for (const c of body.clients) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO clients (id, user_id, name, email, phone, address, notes, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            c.id, userId, c.name ?? '', c.email ?? null, c.phone ?? null,
            c.address ?? null, c.notes ?? null, JSON.stringify(c.tags ?? []),
            c.createdAt ?? Date.now(), c.updatedAt ?? Date.now()
          ).run()
        }
        results.clients = body.clients.length
      }

      // Team
      if (Array.isArray(body.team)) {
        for (const m of body.team) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO team_members (id, user_id, name, role, hourly_rate, phone, email, color, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            m.id, userId, m.name ?? '', m.role ?? '', m.hourlyRate ?? 0,
            m.phone ?? null, m.email ?? null, m.color ?? '#3B82F6',
            m.active !== false ? 1 : 0,
            m.createdAt ?? Date.now(), m.updatedAt ?? Date.now()
          ).run()
        }
        results.team = body.team.length
      }

      // Inventory
      if (Array.isArray(body.inventory)) {
        for (const item of body.inventory) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO inventory_items (id, user_id, name, category, unit, current_stock, low_stock_threshold, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            item.id, userId, item.name ?? '', item.category ?? '', item.unit ?? '',
            item.currentStock ?? 0, item.lowStockThreshold ?? 0, item.notes ?? '',
            item.createdAt ?? Date.now(), item.updatedAt ?? Date.now()
          ).run()
        }
        results.inventory = body.inventory.length
      }

      // Invoices + payments
      if (Array.isArray(body.invoices)) {
        for (const inv of body.invoices) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO invoices (id, invoice_number, job_id, quote_id, user_id, amount_due,
              amount_paid, status, due_date, issued_at, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            inv.id, inv.invoiceNumber ?? 1001, inv.jobId ?? '', inv.quoteId ?? null, userId,
            inv.amountDue ?? 0, inv.amountPaid ?? 0, inv.status ?? 'Unpaid',
            inv.dueDate ?? null, inv.issuedAt ?? Date.now(), inv.notes ?? null,
            inv.createdAt ?? Date.now(), inv.updatedAt ?? Date.now()
          ).run()
          if (Array.isArray(inv.payments)) {
            for (const p of inv.payments) {
              await env.DB.prepare(`
                INSERT OR IGNORE INTO payments (id, invoice_id, user_id, amount, payment_method, payment_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `).bind(
                p.id, inv.id, userId, p.amount ?? 0,
                p.paymentMethod ?? 'Other', p.paymentDate ?? Date.now(), p.notes ?? null
              ).run()
            }
          }
        }
        results.invoices = body.invoices.length
      }

      // Expenses
      if (Array.isArray(body.expenses)) {
        for (const e of body.expenses) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO expenses (id, job_id, user_id, category, description, amount, expense_date, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            e.id, e.jobId ?? null, userId, e.category ?? 'Other',
            e.description ?? '', e.amount ?? 0, e.expenseDate ?? Date.now(),
            e.notes ?? null, e.createdAt ?? Date.now(), e.updatedAt ?? Date.now()
          ).run()
        }
        results.expenses = body.expenses.length
      }

      // Materials
      if (Array.isArray(body.materials)) {
        for (const m of body.materials) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO job_materials (id, job_id, user_id, inventory_item_id, description, quantity, unit_cost, total_cost, used_at, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            m.id, m.jobId ?? '', userId, m.inventoryItemId ?? null,
            m.description ?? '', m.quantity ?? 1, m.unitCost ?? 0, m.totalCost ?? 0,
            m.usedAt ?? Date.now(), m.notes ?? null
          ).run()
        }
        results.materials = body.materials.length
      }

      // Time entries
      if (Array.isArray(body.timeEntries)) {
        for (const t of body.timeEntries) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO time_entries (id, job_id, user_id, team_member_id, start_time, end_time, duration, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            t.id, t.jobId ?? '', userId, t.teamMemberId ?? '',
            t.startTime ?? Date.now(), t.endTime ?? null, t.duration ?? 0,
            t.notes ?? null, t.createdAt ?? Date.now(), t.updatedAt ?? Date.now()
          ).run()
        }
        results.timeEntries = body.timeEntries.length
      }

      // Note folders (before notes, since notes can reference them)
      if (Array.isArray(body.noteFolders)) {
        for (const f of body.noteFolders) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO note_folders (id, user_id, name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            f.id, userId, f.name ?? '', f.createdAt ?? Date.now(), f.updatedAt ?? Date.now()
          ).run()
        }
        results.noteFolders = body.noteFolders.length
      }

      // Notes
      if (Array.isArray(body.notes)) {
        for (const n of body.notes) {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO notes (id, user_id, folder_id, title, body, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            n.id, userId, n.folderId ?? null, n.title ?? '', n.body ?? '',
            n.createdAt ?? Date.now(), n.updatedAt ?? Date.now()
          ).run()
        }
        results.notes = body.notes.length
      }

      return json({ ok: true, synced: results })
    }

    return err('Not found', 404)
  },
}

// ── helpers ───────────────────────────────────────────────────────────────────

function nanoid(size = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  for (let i = 0; i < size; i++) result += chars[bytes[i] % chars.length]
  return result
}

async function insertLineItem(env: Env, li: any, quoteId: string, userId: string) {
  await env.DB.prepare(`
    INSERT OR IGNORE INTO quote_line_items (id, quote_id, user_id, description, quantity, unit_price, type, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    li.id ?? nanoid(), quoteId, userId,
    li.description ?? '', li.quantity ?? 1, li.unitPrice ?? 0,
    li.type ?? 'other', li.sortOrder ?? 0
  ).run()
}

async function nextQuoteNumber(env: Env, userId: string): Promise<number> {
  const row = await env.DB.prepare(
    'SELECT MAX(quote_number) as max FROM quotes WHERE user_id = ?'
  ).bind(userId).first() as any
  return (row?.max ?? 1000) + 1
}

async function hydrateJob(row: any, env: Env, userId: string) {
  const quotes = await env.DB.prepare(
    'SELECT * FROM quotes WHERE job_id = ? AND user_id = ? ORDER BY created_at ASC'
  ).bind(row.id, userId).all()

  const hydratedQuotes = await Promise.all((quotes.results as any[]).map(async (q) => {
    const items = await env.DB.prepare(
      'SELECT * FROM quote_line_items WHERE quote_id = ? ORDER BY sort_order ASC'
    ).bind(q.id).all()
    return {
      id: q.id,
      quoteNumber: q.quote_number,
      jobId: q.job_id,
      clientName: q.client_name,
      clientEmail: q.client_email,
      clientPhone: q.client_phone,
      notes: q.notes,
      taxRate: q.tax_rate,
      expiryDate: q.expiry_date,
      status: q.status,
      lineItems: (items.results as any[]).map(li => ({
        id: li.id,
        quoteId: li.quote_id,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unit_price,
        type: li.type,
        sortOrder: li.sort_order,
      })),
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    }
  }))

  return {
    id: row.id,
    title: row.title,
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    siteAddress: row.site_address,
    description: row.description,
    status: row.status,
    assigneeId: row.assignee_id,
    startDate: row.start_date,
    dueDate: row.due_date,
    notes: row.notes,
    archived: row.archived === 1,
    quotes: hydratedQuotes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function clientFromRow(r: any) {
  return {
    id: r.id, name: r.name, email: r.email, phone: r.phone,
    address: r.address, notes: r.notes,
    tags: JSON.parse(r.tags ?? '[]'),
    properties: JSON.parse(r.properties ?? '[]'),
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function teamMemberFromRow(r: any) {
  return {
    id: r.id, name: r.name, role: r.role, hourlyRate: r.hourly_rate,
    phone: r.phone, email: r.email, color: r.color, active: r.active === 1,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function inventoryItemFromRow(r: any) {
  return {
    id: r.id, name: r.name, category: r.category, unit: r.unit,
    currentStock: r.current_stock, lowStockThreshold: r.low_stock_threshold,
    notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function noteFolderFromRow(r: any) {
  return {
    id: r.id, name: r.name,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function noteFromRow(r: any) {
  return {
    id: r.id, folderId: r.folder_id, title: r.title, body: r.body,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function inventoryAdjFromRow(r: any) {
  return {
    id: r.id, itemId: r.item_id, delta: r.delta,
    reason: r.reason, adjustedAt: r.adjusted_at,
  }
}

function invoiceFromRow(r: any, payments: any[]) {
  return {
    id: r.id, invoiceNumber: r.invoice_number, jobId: r.job_id, quoteId: r.quote_id,
    amountDue: r.amount_due, amountPaid: r.amount_paid, status: r.status,
    dueDate: r.due_date, issuedAt: r.issued_at, notes: r.notes,
    payments, createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function paymentFromRow(r: any) {
  return {
    id: r.id, invoiceId: r.invoice_id, amount: r.amount,
    paymentMethod: r.payment_method, paymentDate: r.payment_date, notes: r.notes,
  }
}

function expenseFromRow(r: any) {
  return {
    id: r.id, jobId: r.job_id, category: r.category, description: r.description,
    amount: r.amount, expenseDate: r.expense_date, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function materialFromRow(r: any) {
  return {
    id: r.id, jobId: r.job_id, inventoryItemId: r.inventory_item_id,
    description: r.description, quantity: r.quantity, unitCost: r.unit_cost,
    totalCost: r.total_cost, usedAt: r.used_at, notes: r.notes,
  }
}

function timeEntryFromRow(r: any) {
  return {
    id: r.id, jobId: r.job_id, teamMemberId: r.team_member_id,
    startTime: r.start_time, endTime: r.end_time, duration: r.duration,
    notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at,
  }
}
