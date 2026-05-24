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
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3 mb-10">
        <img src="/logo.svg" alt="FIELDKIT" className="h-9 w-9 dark:invert" />
        <span className="text-xl font-bold tracking-widest text-gray-900 dark:text-white">
          FIELDKIT
        </span>
      </div>

      {/* Warning icon */}
      <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {/* Code */}
      <p className="text-8xl font-black text-red-500 dark:text-red-400 leading-none mb-4">
        500
      </p>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Something went wrong
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8">
        An unexpected error occurred. Your data is safe — try refreshing the page
        or navigate back to continue working.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go home
        </Link>
      </div>

      {/* Collapsible error detail */}
      <button
        onClick={() => setShowDetail(v => !v)}
        className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors flex items-center gap-1"
      >
        <svg className={`w-3 h-3 transition-transform ${showDetail ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showDetail ? 'Hide' : 'Show'} error details
      </button>
      {showDetail && (
        <div className="mt-3 w-full max-w-lg text-left bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all whitespace-pre-wrap">
            {error.message || 'Unknown error'}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-600 font-mono">
              Digest: {error.digest}
            </p>
          )}
        </div>
      )}

      <div className="mt-10 w-16 h-px bg-gray-200 dark:bg-gray-700" />
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
        Error 500 &mdash; Internal Server Error
      </p>
    </div>
  )
}
