'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Quote, useQuoteStore } from '@/store/quoteStore'
import { useJobStore } from '@/store/jobStore'
import EmptyState from '@/components/shared/EmptyState'
import QuoteForm from '@/components/quotes/QuoteForm'
import QuotePreview from '@/components/quotes/QuotePreview'
import { generateQuotePDF } from '@/lib/pdf'

export default function QuotesPage() {
  const router = useRouter()
  const quotes = useQuoteStore((state) => state.quotes)
  const addJob = useJobStore((state) => state.addJob)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list')

  const handleCreateJob = (quote: Quote) => {
    if (confirm('Convert this quote to a job?')) {
      addJob({
        title: `Quote #${quote.quoteNumber} - ${quote.clientName}`,
        clientName: quote.clientName,
        description: quote.lineItems.map((item) => item.description).join(', '),
        status: 'Quoted',
        quoteId: quote.id,
        notes: quote.notes,
      })
      router.push('/jobs')
    }
  }

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setViewMode('preview')
  }

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsFormOpen(true)
  }

  const handleShareQuote = (quote: Quote) => {
    const shareUrl = `${window.location.origin}/quotes/share/${quote.id}`
    navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  }

  const handleDownloadPDF = (quote: Quote) => {
    generateQuotePDF(quote)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedQuote(null)
  }

  if (quotes.length === 0) {
    return (
      <>
        <EmptyState
          title="No quotes yet"
          description="Create your first quote to start estimating work for clients."
          action={{
            label: 'Create Quote',
            onClick: () => setIsFormOpen(true),
          }}
        />
        <QuoteForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedQuote(null)
          }}
        />
      </>
    )
  }

  if (viewMode === 'preview' && selectedQuote) {
    return (
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Quotes
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditQuote(selectedQuote)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleShareQuote(selectedQuote)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg
                className="w-4 h-4 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
            <button
              onClick={() => handleDownloadPDF(selectedQuote)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg
                className="w-4 h-4 inline mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              PDF
            </button>
            <button
              onClick={() => handleCreateJob(selectedQuote)}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Convert to Job
            </button>
          </div>
        </div>

        <QuotePreview quote={selectedQuote} />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create clean, shareable quotes for your clients
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedQuote(null)
            setIsFormOpen(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Quote
        </button>
      </div>

      {/* Quotes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => {
          const subtotal = quote.lineItems.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
          )
          const tax = subtotal * quote.taxRate
          const total = subtotal + tax

          return (
            <div
              key={quote.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    #{quote.quoteNumber}
                  </p>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {quote.clientName}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quote.status === 'Accepted'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : quote.status === 'Declined'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : quote.status === 'Sent'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {quote.status}
                </span>
              </div>

              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ${total.toFixed(2)}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {quote.lineItems.length} line item
                {quote.lineItems.length !== 1 ? 's' : ''}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewQuote(quote)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownloadPDF(quote)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Download PDF"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleCreateJob(quote)}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  title="Convert to Job"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      <QuoteForm
        quote={selectedQuote || undefined}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedQuote(null)
        }}
      />
    </div>
  )
}
