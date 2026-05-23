'use client'

import { useState } from 'react'
import { Job } from '@/store/jobStore'
import { Quote } from '@/store/quoteStore'
import { QuoteCard } from '@/components/quotes/QuoteCard'
import QuoteForm from '@/components/quotes/QuoteForm'
import { useJobStore } from '@/store/jobStore'

interface JobQuotesTabProps {
  job: Job
}

export function JobQuotesTab({ job }: JobQuotesTabProps) {
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>()
  
  const { deleteJobQuote, updateJobQuote } = useJobStore()

  const quotes = job.quotes || []

  const handleCreateQuote = () => {
    setEditingQuote(undefined)
    setIsQuoteFormOpen(true)
  }

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote)
    setIsQuoteFormOpen(true)
  }

  const handleSendQuote = (quoteId: string) => {
    updateJobQuote(job.id, quoteId, { status: 'Sent' })
  }

  const handleDeleteQuote = (quoteId: string) => {
    if (confirm('Delete this quote? This cannot be undone.')) {
      deleteJobQuote(job.id, quoteId)
    }
  }

  return (
    <div className="space-y-4">
      {quotes.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No quotes yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create your first quote to send to the client.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateQuote}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Quote
            </button>
          </div>
        </div>
      ) : (
        /* Quote List */
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quotes ({quotes.length})
            </h3>
            <button
              onClick={handleCreateQuote}
              type="button"
              className="inline-flex items-center px-3 py-1.5 text-sm border border-transparent font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Quote
            </button>
          </div>

          <div className="space-y-3">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onEdit={() => handleEditQuote(quote)}
                onDelete={() => handleDeleteQuote(quote.id)}
                onSend={() => handleSendQuote(quote.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Quote Form Modal */}
      <QuoteForm
        jobId={job.id}
        isOpen={isQuoteFormOpen}
        onClose={() => {
          setIsQuoteFormOpen(false)
          setEditingQuote(undefined)
        }}
        quote={editingQuote}
      />
    </div>
  )
}
