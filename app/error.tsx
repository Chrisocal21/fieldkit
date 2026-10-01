'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    // Log to console for debugging — replace with an error reporting service if needed
    console.error('[FieldKit error boundary]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-red-600 dark:text-red-400 mb-4">
        Error 500
      </p>

      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Something broke.
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mb-8">
        That one&apos;s on me, not you. Your data is safe. Try again, or head back
        and pick up where you left off.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go home
        </Link>
      </div>

      {/* Collapsible error detail */}
      <button
        onClick={() => setShowDetail(v => !v)}
        aria-expanded={showDetail}
        className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
      >
        <svg className={`w-3 h-3 transition-transform ${showDetail ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showDetail ? 'Hide' : 'Show'} error details
      </button>
      {showDetail && (
        <div className="mt-3 w-full max-w-lg text-left bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all whitespace-pre-wrap">
            {error.message || 'Unknown error'}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 font-mono">
              Digest: {error.digest}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
