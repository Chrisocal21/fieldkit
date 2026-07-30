'use client'

import { useState, useEffect, useMemo } from 'react'
import { useJobStore } from '@/store/jobStore'
import { useClientStore } from '@/store/clientStore'
import { useInvoiceStore } from '@/store/invoiceStore'
import { Quote } from '@/store/quoteStore'
import QuotePreview from '@/components/quotes/QuotePreview'
import QuoteForm from '@/components/quotes/QuoteForm'
import { generateQuotePDF } from '@/lib/pdf'

type FilterTab = 'all' | 'unpaid' | 'overdue' | 'paid'

function calcQuoteTotal(quote: Quote): number {
  const regular = quote.lineItems.filter(i => i.type !== 'discount' && i.type !== 'deposit')
  const discountAmt = quote.lineItems.filter(i => i.type === 'discount').reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const depositAmt = quote.lineItems.filter(i => i.type === 'deposit').reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const subtotal = regular.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxable = Math.max(0, subtotal - discountAmt)
  const gross = taxable + taxable * (quote.taxRate || 0) + (quote.roundingAdjustment ?? 0)
  return gross - depositAmt
}

export default function InvoicesPage() {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false)


  const jobs = useJobStore(s => s.jobs)
  const { clients } = useClientStore()
  const invoices = useInvoiceStore(s => s.invoices)
  const { createInvoice, addPayment, deletePayment, markOverdueInvoices } = useInvoiceStore()

  useEffect(() => {
    setMounted(true)
    markOverdueInvoices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const billableRows = useMemo(() => {
    if (!mounted) return []
    const rows: Array<{
      quote: Quote
      jobTitle: string
      jobId: string
      clientName: string
      total: number
      amountPaid: number
      balance: number
      isPaid: boolean
      isOverdue: boolean
    }> = []

    for (const job of jobs) {
      if (job.archived) continue
      const client = job.clientId ? clients.find(c => c.id === job.clientId) : undefined
      const clientName = client?.name || job.clientName || 'No client'

      for (const quote of job.quotes ?? []) {
        if (quote.status !== 'Sent' && quote.status !== 'Accepted') continue
        const total = calcQuoteTotal(quote)
        const inv = invoices.find(i => i.jobId === job.id && i.quoteId === quote.id)
        const amountPaid = inv?.amountPaid ?? 0
        const balance = Math.max(0, total - amountPaid)
        rows.push({
          quote,
          jobTitle: job.title,
          jobId: job.id,
          clientName,
          total,
          amountPaid,
          balance,
          isPaid: amountPaid >= total - 0.01,
          isOverdue: inv?.status === 'Overdue',
        })
      }
    }

    // Newest first
    return rows.sort((a, b) => b.quote.createdAt - a.quote.createdAt)
  }, [mounted, jobs, clients, invoices])

  const filtered = useMemo(() => {
    if (filter === 'paid') return billableRows.filter(r => r.isPaid)
    if (filter === 'unpaid') return billableRows.filter(r => !r.isPaid)
    if (filter === 'overdue') return billableRows.filter(r => r.isOverdue)
    return billableRows
  }, [billableRows, filter])

  const totalOutstanding = billableRows.filter(r => !r.isPaid).reduce((s, r) => s + r.balance, 0)
  const totalPaid = billableRows.filter(r => r.isPaid).reduce((s, r) => s + r.total, 0)
  const unpaidCount = billableRows.filter(r => !r.isPaid).length
  const overdueCount = billableRows.filter(r => r.isOverdue).length

  const handleMarkPaid = (row: typeof billableRows[0]) => {
    let inv = invoices.find(i => i.jobId === row.jobId && i.quoteId === row.quote.id)
    if (!inv) {
      inv = createInvoice({
        jobId: row.jobId,
        quoteId: row.quote.id,
        amountDue: row.total,
        issuedAt: Date.now(),
        notes: `Quote #${row.quote.quoteNumber}`,
      })
    }
    const balance = row.total - (inv.amountPaid ?? 0)
    if (balance > 0.005) {
      addPayment(inv.id, {
        amount: parseFloat(balance.toFixed(2)),
        paymentMethod: 'Other',
        paymentDate: Date.now(),
        notes: 'Marked as paid',
      })
    }
  }

  const handleMarkUnpaid = (row: typeof billableRows[0]) => {
    const inv = invoices.find(i => i.jobId === row.jobId && i.quoteId === row.quote.id)
    if (inv) inv.payments.forEach(p => deletePayment(inv.id, p.id))
  }

  const handleCopyLink = (quote: Quote) => {
    const url = `${window.location.origin}/quotes/share/${quote.id}`
    navigator.clipboard.writeText(url)
    setCopiedId(quote.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!mounted) return null

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Automatically generated from sent quotes
          </p>
        </div>
        <button
          onClick={() => setIsNewInvoiceOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalOutstanding.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{unpaidCount} unpaid invoice{unpaidCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Collected</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">${totalPaid.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{billableRows.filter(r => r.isPaid).length} paid</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Billed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${billableRows.reduce((s, r) => s + r.total, 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{billableRows.length} invoice{billableRows.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {(['all', 'unpaid', 'overdue', 'paid'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
            {tab === 'unpaid' && unpaidCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                {unpaidCount}
              </span>
            )}
            {tab === 'overdue' && overdueCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No invoices yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
            Invoices appear when you send a quote. Or create one directly.
          </p>
          <button
            onClick={() => setIsNewInvoiceOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            New Invoice
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_80px_90px_90px_80px_120px] gap-3 px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <span>Client</span>
            <span>Job</span>
            <span>Invoice #</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Paid</span>
            <span className="text-center">Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map(row => (
              <div
                key={row.quote.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px_90px_90px_80px_120px] gap-3 px-4 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                {/* Client */}
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{row.clientName}</p>
                  {/* Mobile: show everything inline */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden truncate">{row.jobTitle}</p>
                </div>

                {/* Job */}
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{row.jobTitle}</p>
                </div>

                {/* Invoice # */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">#{row.quote.quoteNumber}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(row.quote.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                    ${row.total.toFixed(2)}
                  </p>
                </div>

                {/* Paid */}
                <div className="text-right">
                  <p className={`text-sm font-semibold tabular-nums ${row.amountPaid > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    ${row.amountPaid.toFixed(2)}
                  </p>
                </div>

                {/* Status badge */}
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.isPaid
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : row.amountPaid > 0
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {row.isPaid ? 'Paid' : row.amountPaid > 0 ? 'Partial' : 'Unpaid'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  {/* View */}
                  <button
                    onClick={() => setPreviewQuote(row.quote)}
                    title="View invoice"
                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  {/* Copy link */}
                  <button
                    onClick={() => handleCopyLink(row.quote)}
                    title="Copy shareable link"
                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {copiedId === row.quote.id ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

                  {/* Download PDF */}
                  <button
                    onClick={() => generateQuotePDF(row.quote, undefined, 'invoice')}
                    title="Download PDF"
                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>

                  {/* Mark paid / unpaid */}
                  {row.isPaid ? (
                    <button
                      onClick={() => handleMarkUnpaid(row)}
                      title="Mark as unpaid"
                      className="group flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3 h-3 group-hover:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <svg className="w-3 h-3 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="group-hover:hidden">Paid</span>
                      <span className="hidden group-hover:inline">Undo</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkPaid(row)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Invoice — Quote #{previewQuote.quoteNumber}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(previewQuote)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copiedId === previewQuote.id ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => generateQuotePDF(previewQuote, undefined, 'invoice')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setPreviewQuote(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <QuotePreview quote={previewQuote} mode="invoice" />
            </div>
          </div>
        </div>
      )}
      {/* New Invoice / Quote Form */}
      <QuoteForm
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
      />
    </div>
  )
}
