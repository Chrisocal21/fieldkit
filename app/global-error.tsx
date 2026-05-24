'use client'

import { useEffect, useState } from 'react'

// global-error replaces the root layout entirely — must include <html> and <body>
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    console.error('[FieldKit global error]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.svg" alt="FIELDKIT" className="h-9 w-9" />
            <span className="text-xl font-bold tracking-widest text-gray-900">
              FIELDKIT
            </span>
          </div>

          {/* Warning icon */}
          <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <p className="text-8xl font-black text-red-500 leading-none mb-4">500</p>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Critical error
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mb-8">
            The app encountered a critical error and couldn&apos;t recover.
            Your data is stored locally and won&apos;t be lost.
            Try reloading the page.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload app
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Go home
            </a>
          </div>

          {/* Collapsible error detail */}
          <button
            onClick={() => setShowDetail(v => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <svg className={`w-3 h-3 transition-transform ${showDetail ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showDetail ? 'Hide' : 'Show'} error details
          </button>
          {showDetail && (
            <div className="mt-3 w-full max-w-lg text-left bg-gray-100 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-mono text-red-600 break-all whitespace-pre-wrap">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-gray-400 font-mono">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="mt-10 w-16 h-px bg-gray-200" />
          <p className="mt-4 text-xs text-gray-400">
            Error 500 &mdash; Critical Failure
          </p>
        </div>
      </body>
    </html>
  )
}
