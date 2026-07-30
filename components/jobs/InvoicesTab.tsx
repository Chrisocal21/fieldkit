'use client'

import { useState } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useJobStore } from '@/store/jobStore'
import { Quote } from '@/store/quoteStore'
import QuotePreview from '@/components/quotes/QuotePreview'
import { generateQuotePDF } from '@/lib/pdf'

interface InvoicesTabProps {
  jobId: string
}

export default function InvoicesTab({ jobId }: InvoicesTabProps) {
  const job = useJobStore((state) => state.jobs.find(j => j.id === jobId))
  const invoices = useInvoiceStore((state) => state.invoices)
  const { createInvoice, addPayment, deletePayment } = useInvoiceStore()

  // All sent quotes become invoice line items automatically
  const sentQuotes = (job?.quotes || []).filter(
    q => q.status === 'Sent' || q.status === 'Accepted'
  )

  const getQuoteTotal = (quote: Quote) => {
    const regular = quote.lineItems.filter(i => i.type !== 'discount' && i.type !== 'deposit')
    const discountAmt = quote.lineItems.filter(i => i.type === 'discount').reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const depositAmt = quote.lineItems.filter(i => i.type === 'deposit').reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const subtotal = regular.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const taxable = Math.max(0, subtotal - discountAmt)
    const gross = taxable + taxable * (quote.taxRate || 0) + (quote.roundingAdjustment ?? 0)
    return gross - depositAmt  // amount actually owed after deposit
  }

  const getInvoiceForQuote = (quoteId: string) =>
    invoices.find(inv => inv.jobId === jobId && inv.quoteId === quoteId)

  const isPaid = (quote: Quote) => {
    const inv = getInvoiceForQuote(quote.id)
    if (!inv) return false
    return inv.amountPaid >= getQuoteTotal(quote) - 0.01
  }

  const handleMarkPaid = (quote: Quote) => {
    const total = getQuoteTotal(quote)
    let inv = getInvoiceForQuote(quote.id)
    if (!inv) {
      inv = createInvoice({
        jobId,
        quoteId: quote.id,
        amountDue: total,
        issuedAt: Date.now(),
        notes: `Quote #${quote.quoteNumber}`,
      })
    }
    const balance = total - (inv.amountPaid ?? 0)
    if (balance > 0.005) {
      addPayment(inv.id, {
        amount: parseFloat(balance.toFixed(2)),
        paymentMethod: 'Other',
        paymentDate: Date.now(),
        notes: 'Marked as paid',
      })
    }
  }

  const handleMarkUnpaid = (quote: Quote) => {
    const inv = getInvoiceForQuote(quote.id)
    if (inv && inv.payments.length > 0) {
      inv.payments.forEach(p => deletePayment(inv.id, p.id))
    }
  }

  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = (quote: Quote) => {
    const url = `${window.location.origin}/quotes/share/${quote.id}`
    navigator.clipboard.writeText(url)
    setCopiedId(quote.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const totalBilled = sentQuotes.reduce((s, q) => s + getQuoteTotal(q), 0)
  const totalPaid = sentQuotes
    .filter(q => isPaid(q))
    .reduce((s, q) => s + getQuoteTotal(q), 0)
  const outstanding = totalBilled - totalPaid

  return (
    <>
      <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h3>

      {sentQuotes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-1">No invoices yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Send a quote to start invoicing
          </p>
        </div>
      ) : (
        <>
          {/* Quote rows */}
          <div className="space-y-2">
            {sentQuotes.map(quote => {
              const total = getQuoteTotal(quote)
              const paid = isPaid(quote)
              return (
                <div
                  key={quote.id}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 border transition-colors ${
                    paid
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div>
                    <p className={`font-medium text-sm ${paid ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      Quote #{quote.quoteNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(quote.createdAt).toLocaleDateString()}
                      {' · '}
                      {quote.lineItems.length} item{quote.lineItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-semibold tabular-nums ${paid ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                      ${total.toFixed(2)}
                    </span>
                    {/* View */}
                    <button
                      onClick={() => setPreviewQuote(quote)}
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
                      onClick={() => handleCopyLink(quote)}
                      title="Copy shareable link"
                      className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copiedId === quote.id ? (
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
                      onClick={() => generateQuotePDF(quote, undefined, 'invoice')}
                      title="Download PDF"
                      className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    {paid ? (
                      <button
                        onClick={() => handleMarkUnpaid(quote)}
                        title="Click to mark as unpaid"
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 group-hover:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <svg className="w-3.5 h-3.5 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="group-hover:hidden">Paid</span>
                        <span className="hidden group-hover:inline">Undo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(quote)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary — only shown when there are multiple quotes */}
          {sentQuotes.length > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Total Billed</span>
                <span>${totalBilled.toFixed(2)}</span>
              </div>
              {totalPaid > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Paid</span>
                  <span>−${totalPaid.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-1.5">
                <span>Outstanding</span>
                <span>${outstanding.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>

      {/* Preview Modal */}
      {previewQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-3xl my-8 shadow-2xl">
            {/* Modal header */}
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
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Preview content */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <QuotePreview quote={previewQuote} mode="invoice" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
