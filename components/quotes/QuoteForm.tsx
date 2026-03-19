'use client'

import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Quote, QuoteLineItem } from '@/store/quoteStore'
import { useJobStore } from '@/store/jobStore'
import QuoteLineItems from './QuoteLineItems'

interface QuoteFormProps {
  jobId: string  // Required - quotes belong to a job
  quote?: Quote
  isOpen: boolean
  onClose: () => void
}

export default function QuoteForm({ jobId, quote, isOpen, onClose }: QuoteFormProps) {
  const { jobs, addQuoteToJob, updateJobQuote } = useJobStore()
  
  // Get the job to pre-fill client information
  const job = jobs.find(j => j.id === jobId)

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
    taxRate: 0,
    expiryDate: '',
    status: 'Draft' as 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Revised',
  })

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([])

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
          taxRate: (quote.taxRate || 0) * 100, // Convert decimal to percentage
          expiryDate: quote.expiryDate
            ? new Date(quote.expiryDate).toISOString().split('T')[0]
            : '',
          status: quote.status || 'Draft',
        })
        setLineItems(quote.lineItems || [])
      } else if (job) {
        // Creating new quote - pre-fill from job
        setFormData({
          clientName: job.clientName || '',
          clientEmail: job.clientEmail || '',
          clientPhone: job.clientPhone || '',
          notes: '',
          taxRate: 0,
          expiryDate: '',
          status: 'Draft',
        })
        setLineItems([])
      } else {
        // Fallback - empty form
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          notes: '',
          taxRate: 0,
          expiryDate: '',
          status: 'Draft',
        })
        setLineItems([])
      }
    }
  }, [isOpen, quote, job])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const quoteData = {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail || undefined,
      clientPhone: formData.clientPhone || undefined,
      notes: formData.notes,
      taxRate: formData.taxRate / 100, // Convert percentage to decimal
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate).getTime()
        : undefined,
      status: formData.status,
      lineItems: lineItems,
    }

    if (quote) {
      // Update existing quote
      updateJobQuote(jobId, quote.id, quoteData)
    } else {
      // Create new quote
      addQuoteToJob(jobId, quoteData)
    }

    onClose()
  }

  if (!isOpen) return null

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const tax = subtotal * (formData.taxRate / 100)
  const total = subtotal + tax

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {quote ? 'Edit Quote' : 'Create New Quote'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Client Information
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Client or company name"
                  />
                </div>

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
                    placeholder="client@example.com"
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
                    placeholder="(555) 123-4567"
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
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Quote['status'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
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
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {quote ? 'Save Changes' : 'Create Quote'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
