import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-4">
        Error 404
      </p>

      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Nothing here.
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mb-10">
        This page doesn&apos;t exist. Could be a typo, could be a link that outlived
        the page. Either way, your jobs are right where you left them.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Jobs
        </Link>
      </div>
    </div>
  )
}
