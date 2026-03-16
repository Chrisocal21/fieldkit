'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuoteStore } from '@/store/quoteStore'
import QuotePreview from '@/components/quotes/QuotePreview'
import { generateQuotePDF } from '@/lib/pdf'

export default function ShareQuotePage() {
  const params = useParams()
  const router = useRouter()
  const quoteId = params.id as string
  
  const quote = useQuoteStore((state) =>
    state.quotes.find((q) => q.id === quoteId)
  )

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quote Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This quote doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  const handleDownloadPDF = () => {
    generateQuotePDF(quote)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      {/* Header Actions */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Shared Quote
        </h1>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Download PDF
        </button>
      </div>

      {/* Quote Preview */}
      <QuotePreview quote={quote} />

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Powered by FIELDKIT</p>
      </div>
    </div>
  )
}
