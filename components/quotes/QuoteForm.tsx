'use client'

import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Quote, QuoteLineItem } from '@/store/quoteStore'
import { useJobStore } from '@/store/jobStore'
import { useClientStore } from '@/store/clientStore'
import ClientSelector from '@/components/shared/ClientSelector'
import QuoteLineItems from './QuoteLineItems'
import QuotePreview from './QuotePreview'

// Rounds up to the nearest sensible clean number
function getRoundTarget(amount: number): number {
  if (amount < 100) return Math.ceil(amount / 5) * 5
  if (amount < 500) return Math.ceil(amount / 10) * 10
  if (amount < 2000) return Math.ceil(amount / 50) * 50
  return Math.ceil(amount / 100) * 100
}

interface QuoteFormProps {
  jobId?: string  // Optional - will auto-create a job if not provided
  quote?: Quote
  isOpen: boolean
  onClose: () => void
}

export default function QuoteForm({ jobId, quote, isOpen, onClose }: QuoteFormProps) {
  const { jobs, addJob, addQuoteToJob, updateJobQuote } = useJobStore()
  const getClientById = useClientStore(s => s.getClientById)

  // Get the job to pre-fill client information
  const job = jobs.find(j => j.id === jobId)

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>()
  const [siteAddress, setSiteAddress] = useState('')

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
    taxRate: 0,
    roundingAdjustment: 0,
    expiryDate: '',
    status: 'Draft' as 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Revised',
  })

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleClientSelect = (clientId: string) => {
    const client = getClientById(clientId)
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.name,
        clientEmail: client.email || '',
        clientPhone: client.phone || '',
      }))
      setSelectedClientId(clientId)
      setSiteAddress('')
    }
  }

  // Reset form when modal opens or quote changes
  useEffect(() => {
    if (isOpen) {
      if (quote) {
        // Editing existing quote
        setFormData({
          clientName: quote.clientName || '',
          clientEmail: quote.clientEmail || '',
          clientPhone: quote.clientPhone || '',
          notes: quote.notes || '',
          taxRate: (quote.taxRate || 0) * 100,
          roundingAdjustment: quote.roundingAdjustment || 0,
          expiryDate: quote.expiryDate
            ? new Date(quote.expiryDate).toISOString().split('T')[0]
            : '',
          status: quote.status || 'Draft',
        })
        setLineItems(quote.lineItems || [])
        // Pre-select client if the job has one
        setSelectedClientId(job?.clientId)
        setSiteAddress('')
      } else if (job) {
        // Creating new quote - pre-fill from job
        setFormData({
          clientName: job.clientName || '',
          clientEmail: job.clientEmail || '',
          clientPhone: job.clientPhone || '',
          notes: '',
          taxRate: 0,
          roundingAdjustment: 0,
          expiryDate: '',
          status: 'Draft',
        })
        setLineItems([])
        setSelectedClientId(job?.clientId)
        setSiteAddress('')
      } else {
        // Standalone new quote - empty form
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          notes: '',
          taxRate: 0,
          roundingAdjustment: 0,
          expiryDate: '',
          status: 'Draft',
        })
        setLineItems([])
        setSelectedClientId(undefined)
        setSiteAddress('')
      }
    }
  }, [isOpen, quote, job])

  const submitQuote = (status: Quote['status']) => {
    if (!formData.clientName.trim()) return

    const quoteData = {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail || undefined,
      clientPhone: formData.clientPhone || undefined,
      notes: formData.notes,
      taxRate: formData.taxRate / 100,
      roundingAdjustment: formData.roundingAdjustment,
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate).getTime()
        : undefined,
      status,
      lineItems: lineItems,
    }

    let targetJobId = jobId

    if (!targetJobId) {
      // Auto-create a job using the client name as the title
      targetJobId = addJob({
        title: formData.clientName.trim() || 'New Quote',
        clientId: selectedClientId || undefined,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || undefined,
        clientPhone: formData.clientPhone || undefined,
        siteAddress: siteAddress || undefined,
        description: '',
        status: 'Quoted',
        notes: '',
      })
    }

    if (quote) {
      updateJobQuote(targetJobId, quote.id, quoteData)
    } else {
      addQuoteToJob(targetJobId, quoteData)
    }

    onClose()
  }

  if (!isOpen) return null

  const regularItems = lineItems.filter(i => i.type !== 'discount' && i.type !== 'deposit')
  const discountItems = lineItems.filter(i => i.type === 'discount')
  const depositItems = lineItems.filter(i => i.type === 'deposit')
  const subtotal = regularItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const discountTotal = discountItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const depositTotal = depositItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const taxableAmount = Math.max(0, subtotal - discountTotal)
  const tax = taxableAmount * (formData.taxRate / 100)
  const baseTotal = taxableAmount + tax
  const roundTarget = getRoundTarget(baseTotal)
  const roundingDiff = parseFloat((roundTarget - baseTotal).toFixed(2))
  const total = baseTotal + formData.roundingAdjustment
  const amountDue = total - depositTotal

  const previewQuote: Quote = {
    id: 'preview',
    quoteNumber: quote?.quoteNumber || 1,
    jobId: jobId || 'preview',
    clientName: formData.clientName || 'Your Client',
    clientEmail: formData.clientEmail || undefined,
    clientPhone: formData.clientPhone || undefined,
    notes: formData.notes || '',
    taxRate: formData.taxRate / 100,
    roundingAdjustment: formData.roundingAdjustment,
    expiryDate: formData.expiryDate ? new Date(formData.expiryDate).getTime() : undefined,
    status: formData.status,
    lineItems,
    createdAt: quote?.createdAt || Date.now(),
    updatedAt: Date.now(),
  }

  const handleRoundUp = () => {
    setFormData(prev => ({ ...prev, roundingAdjustment: roundingDiff }))
  }

  const removeRounding = () => {
    setFormData(prev => ({ ...prev, roundingAdjustment: 0 }))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`relative transform rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full overflow-hidden ${
          previewOpen ? 'sm:max-w-[90vw] flex items-stretch' : 'sm:max-w-3xl'
        }`}>
          {/* Form side */}
          <div className={`px-4 pb-4 pt-5 sm:p-6 ${previewOpen ? 'w-[520px] flex-shrink-0 overflow-y-auto max-h-[85vh]' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {quote ? 'Edit Quote' : 'Create New Quote'}
            </h3>
            <button
              type="button"
              onClick={() => setPreviewOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                previewOpen
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {previewOpen ? 'Hide Preview' : 'Preview'}
            </button>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Client Information
              </h4>

              {/* Client selector dropdown */}
              <ClientSelector
                selectedClientId={selectedClientId}
                onSelectClient={handleClientSelect}
                label="Client *"
              />

              {/* Property / site picker — shown when client has multiple properties */}
              {(() => {
                const client = selectedClientId ? getClientById(selectedClientId) : undefined
                const props = client?.properties ?? []
                if (props.length === 0) return null
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Property / Site
                    </label>
                    <select
                      value={siteAddress}
                      onChange={(e) => setSiteAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">— Select a property —</option>
                      {props.map((p) => (
                        <option key={p.id} value={p.address}>
                          {p.label} — {p.address}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Client email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Client phone number"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <QuoteLineItems items={lineItems} onChange={setLineItems} />

            {/* Totals Summary */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-600 dark:text-amber-400">Discount:</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">−${discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm items-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxRate: parseFloat(e.target.value) || 0,
                        roundingAdjustment: 0,
                      })
                    }
                    className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-600 dark:text-gray-400">%</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${tax.toFixed(2)}
                </span>
              </div>
              {formData.roundingAdjustment > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 dark:text-gray-400">Rounding:</span>
                    <button
                      type="button"
                      onClick={removeRounding}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove rounding"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    +${formData.roundingAdjustment.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-gray-700 items-center">
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  {roundingDiff > 0.01 && (
                    <button
                      type="button"
                      onClick={handleRoundUp}
                      title={`Round up total to $${roundTarget.toFixed(0)}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Round to ${roundTarget.toFixed(0)}
                    </button>
                  )}
                </div>
                <span className="text-gray-900 dark:text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
              {depositTotal > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Deposit received:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">−${depositTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Amount Due:</span>
                    <span className="text-gray-900 dark:text-white">${amountDue.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes / Terms
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Payment terms, delivery notes, etc."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => submitQuote('Draft')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => submitQuote('Sent')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                {quote?.status === 'Sent' ? 'Update & Resend' : 'Send Quote'}
              </button>
            </div>
          </form>
          </div>{/* end form side */}
          {/* Preview side */}
          {previewOpen && (
            <div className="flex-1 border-l border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[85vh] bg-gray-50 dark:bg-gray-900/50">
              <QuotePreview quote={previewQuote} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
