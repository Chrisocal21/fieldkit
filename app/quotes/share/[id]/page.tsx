'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuoteStore } from '@/store/quoteStore'
import QuotePreview from '@/components/quotes/QuotePreview'
import { LogoMark } from '@/components/shared/Logo'
import { generateQuotePDF } from '@/lib/pdf'
import { Quote } from '@/store/quoteStore'

const API_BASE = 'https://fieldkit-api.recipeer-cbv.workers.dev'

/** Small "Sent with FieldKit" credit under a shared document. */
function SentWith() {
  return (
    <p className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
      Sent with
      <Link
        href="/"
        className="inline-flex min-h-0 items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <LogoMark className="h-4 w-4" />
        FieldKit
      </Link>
    </p>
  )
}

export default function ShareQuotePage() {
  const params = useParams()
  const quoteId = params.id as string

  const getQuoteById = useQuoteStore((state) => state.getQuoteById)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try localStorage first (same-device case)
    const local = getQuoteById(quoteId)
    if (local) {
      setQuote(local)
      setLoading(false)
      return
    }
    // Fetch from public API (cross-device share)
    fetch(`${API_BASE}/api/public/quotes/${quoteId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setQuote(data as Quote)
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false))
  }, [quoteId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (quote) document.title = `Quote #${quote.quoteNumber}`
  }, [quote])

  const handleDownloadPDF = () => {
    if (quote) generateQuotePDF(quote)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading quote">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-4">
          Quote not found
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          This quote isn&apos;t available.
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
          The link may be out of date, or the quote was removed. Ask whoever sent
          it for a fresh one.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4">
      {/* Header Actions */}
      <div className="max-w-4xl mx-auto mb-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Shared quote
          </p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            Quote #{quote.quoteNumber}
          </h1>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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

      {/* Quote Preview — no style controls here: this is what the client sees */}
      <div className="max-w-4xl mx-auto shadow-sm">
        <QuotePreview quote={quote} hideControls />
      </div>

      <SentWith />
    </div>
  )
}
