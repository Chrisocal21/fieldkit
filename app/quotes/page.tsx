'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Quote, useQuoteStore } from '@/store/quoteStore'
import { useJobStore } from '@/store/jobStore'
import EmptyState from '@/components/shared/EmptyState'
import QuoteForm from '@/components/quotes/QuoteForm'
import QuotePreview from '@/components/quotes/QuotePreview'
import StatusBadge from '@/components/shared/StatusBadge'
import { generateQuotePDF } from '@/lib/pdf'

export default function QuotesPage() {
  const router = useRouter()
  const { getAllQuotes } = useQuoteStore()
  const jobs = useJobStore((state) => state.jobs)

  const [mounted, setMounted] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list')

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const quotes = mounted ? getAllQuotes() : []

  // Filter out undefined/null values and legacy quotes that don't have jobId
  const validQuotes = quotes.filter(q => q && q.jobId)
  const legacyQuotes = quotes.filter(q => q && !q.jobId)

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setViewMode('preview')
  }

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setSelectedJobId(quote.jobId)
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

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs?selected=${jobId}`)
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedQuote(null)
  }

  if (quotes.length === 0) {
    return (
      <EmptyState
        title="No quotes yet"
        description="Create a quote directly — a job will be created automatically."
        action={{
          label: 'New Quote',
          onClick: () => setIsFormOpen(true),
        }}
      />
    )
  }

  if (viewMode === 'preview' && selectedQuote && selectedQuote.jobId) {
    const job = jobs.find(j => j.id === selectedQuote.jobId)
    
    return (
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            {job && (
              <button
                onClick={() => handleViewJob(job.id)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Job: {job.title}
              </button>
            )}
          </div>

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
          </div>
        </div>

        <QuotePreview quote={selectedQuote} />

        {/* Quote Form Modal */}
        {selectedJobId && (
          <QuoteForm
            jobId={selectedJobId}
            quote={selectedQuote || undefined}
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false)
              setSelectedQuote(null)
              setSelectedJobId(null)
            }}
          />
        )}
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
            View all quotes across your jobs
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedQuote(null)
            setSelectedJobId(null)
            setIsFormOpen(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          New Quote
        </button>
      </div>

      {/* Legacy Quotes Warning */}
      {legacyQuotes.length > 0 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {legacyQuotes.length} old quote{legacyQuotes.length !== 1 ? 's' : ''} need{legacyQuotes.length === 1 ? 's' : ''} migration
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                These quotes were created before the Jobs-First update. They're not visible here. Create new quotes from within jobs instead.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for Valid Quotes */}
      {validQuotes.length === 0 && legacyQuotes.length === 0 && (
        <EmptyState
          title="No quotes yet"
          description="Create a quote directly — a job will be created automatically."
          action={{
            label: 'New Quote',
            onClick: () => setIsFormOpen(true),
          }}
        />
      )}

      {validQuotes.length === 0 && legacyQuotes.length > 0 && (
        <EmptyState
          title="No active quotes"
          description="Your old quotes are incompatible with the new Jobs-First architecture. Create new quotes directly."
          action={{
            label: 'New Quote',
            onClick: () => setIsFormOpen(true),
          }}
        />
      )}

      {/* Quotes Grid */}
      {validQuotes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {validQuotes.map((quote) => {
            const job = jobs.find(j => j.id === quote.jobId)
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
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    #{quote.quoteNumber}
                  </p>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {quote.clientName}
                  </h3>
                  {job && (
                    <button
                      onClick={() => handleViewJob(job.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      Job: {job.title}
                    </button>
                  )}
                </div>
                <StatusBadge status={quote.status} />
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
                  onClick={() => handleEditQuote(quote)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Edit Quote"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
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
              </div>
            </div>
          )
        })}
        </div>
      )}

      {/* Modals */}
      <QuoteForm
        jobId={selectedJobId || undefined}
        quote={selectedQuote || undefined}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedQuote(null)
          setSelectedJobId(null)
        }}
      />
    </div>
  )
}
