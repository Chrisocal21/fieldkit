'use client'

import { useEffect, useState } from 'react'
import './globals.css'
import { fontVariables } from './fonts'
import { LogoMark } from '@/components/shared/Logo'

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
    <html lang="en" className={`dark ${fontVariables}`}>
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-2.5 mb-10">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-xl font-bold tracking-[0.04em] text-white">
              FIELDKIT
            </span>
          </div>

          <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-red-400 mb-4">
            Error 500
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            The app fell over.
          </h1>
          <p className="text-base text-zinc-400 max-w-md mb-8">
            It hit an error it couldn&apos;t recover from. Your data is stored locally
            and won&apos;t be lost. Reloading usually sorts it out.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload app
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white border border-white/25 hover:bg-white/10 rounded-lg transition-colors"
            >
              Go home
            </a>
          </div>

          {/* Collapsible error detail */}
          <button
            onClick={() => setShowDetail(v => !v)}
            aria-expanded={showDetail}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <svg className={`w-3 h-3 transition-transform ${showDetail ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showDetail ? 'Hide' : 'Show'} error details
          </button>
          {showDetail && (
            <div className="mt-3 w-full max-w-lg text-left bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs font-mono text-red-400 break-all whitespace-pre-wrap">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-zinc-500 font-mono">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
