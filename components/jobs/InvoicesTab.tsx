'use client'

import { useState } from 'react'
import { useInvoiceStore, Invoice, Payment } from '@/store/invoiceStore'
import { useJobStore } from '@/store/jobStore'

interface InvoicesTabProps {
  jobId: string
}

export default function InvoicesTab({ jobId }: InvoicesTabProps) {
  const job = useJobStore((state) => state.jobs.find(j => j.id === jobId))
  const invoices = useInvoiceStore((state) => state.getInvoicesByJobId(jobId))
  const createInvoice = useInvoiceStore((state) => state.createInvoice)
  const addPayment = useInvoiceStore((state) => state.addPayment)
  const deletePayment = useInvoiceStore((state) => state.deletePayment)
  const calculateBalance = useInvoiceStore((state) => state.calculateBalance)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null)

  const handleCreateInvoice = () => {
    // Get the accepted quote to create invoice from
    const acceptedQuote = job?.quotes?.find(q => q.status === 'Accepted')
    
    if (!acceptedQuote) {
      alert('Please accept a quote before creating an invoice')
      return
    }

    // Calculate quote total
    const subtotal = acceptedQuote.lineItems?.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0) || 0
    const tax = subtotal * (acceptedQuote.taxRate || 0)
    const total = subtotal + tax

    // Create invoice with 30-day due date
    const dueDate = Date.now() + (30 * 24 * 60 * 60 * 1000)

    createInvoice({
      jobId,
      quoteId: acceptedQuote.id,
      amountDue: total,
      dueDate,
      issuedAt: Date.now(),
      notes: `Invoice for ${job?.title || 'Job'}`
    })

    setShowCreateModal(false)
  }

  const handleAddPayment = (invoiceId: string) => {
    setSelectedInvoice(invoices.find(inv => inv.id === invoiceId) || null)
    setShowPaymentModal(true)
  }

  const handleRecordPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedInvoice) return

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    const paymentMethod = formData.get('paymentMethod') as any
    const notes = formData.get('notes') as string

    if (amount <= 0 || amount > calculateBalance(selectedInvoice.id)) {
      alert('Payment amount must be between 0 and the remaining balance')
      return
    }

    addPayment(selectedInvoice.id, {
      amount,
      paymentMethod,
      paymentDate: Date.now(),
      notes: notes || undefined
    })

    setShowPaymentModal(false)
    setSelectedInvoice(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Partial':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const acceptedQuote = job?.quotes?.find(q => q.status === 'Accepted')
  const canCreateInvoice = acceptedQuote && invoices.length === 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h3>
        {canCreateInvoice && (
          <button
            onClick={handleCreateInvoice}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
          >
            Create Invoice
          </button>
        )}
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No invoices yet</p>
          {!acceptedQuote && (
            <p className="text-sm text-gray-500 dark:text-gray-500">Accept a quote to create an invoice</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const balance = calculateBalance(invoice.id)
            const isExpanded = expandedInvoice === invoice.id

            return (
              <div key={invoice.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                {/* Invoice Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Invoice #{invoice.invoiceNumber}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Issued {new Date(invoice.issuedAt).toLocaleDateString()}
                      {invoice.dueDate && ` • Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedInvoice(isExpanded ? null : invoice.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Invoice Summary */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount Due</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${invoice.amountDue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ${invoice.amountPaid.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${balance.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                    {/* Payments History */}
                    {invoice.payments.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment History</p>
                        <div className="space-y-2">
                          {invoice.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 rounded p-2">
                              <div className="flex-1">
                                <p className="text-gray-900 dark:text-white font-medium">${payment.amount.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {payment.paymentMethod} • {new Date(payment.paymentDate).toLocaleDateString()}
                                </p>
                                {payment.notes && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{payment.notes}</p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this payment?')) {
                                    deletePayment(invoice.id, payment.id)
                                  }
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {balance > 0 && (
                      <button
                        onClick={() => handleAddPayment(invoice.id)}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Record Payment
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0.01"
                  max={calculateBalance(selectedInvoice.id)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Balance: ${calculateBalance(selectedInvoice.id).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Payment reference or notes"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedInvoice(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
