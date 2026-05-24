import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3 mb-10">
        <img src="/logo.svg" alt="FIELDKIT" className="h-9 w-9 dark:invert" />
        <span className="text-xl font-bold tracking-widest text-gray-900 dark:text-white">
          FIELDKIT
        </span>
      </div>

      {/* Code */}
      <p className="text-8xl font-black text-blue-600 dark:text-blue-500 leading-none mb-4">
        404
      </p>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Page not found
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Double-check the URL or head back to a known location.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Jobs
        </Link>
      </div>

      {/* Subtle divider line */}
      <div className="mt-14 w-16 h-px bg-gray-200 dark:bg-gray-700" />
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
        Error 404 &mdash; Not Found
      </p>
    </div>
  )
}
