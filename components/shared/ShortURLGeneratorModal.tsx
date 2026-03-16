'use client'

import { useState } from 'react'

interface ShortURLGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortenedURL {
  original: string
  short: string
  clicks: number
  created: string
}

export default function ShortURLGeneratorModal({ isOpen, onClose }: ShortURLGeneratorModalProps) {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [urls, setUrls] = useState<ShortenedURL[]>([])

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8)
  }

  const handleShorten = () => {
    if (!url) return

    const shortCode = customSlug || generateShortCode()
    const shortUrl = `fk.link/${shortCode}`

    const newUrl: ShortenedURL = {
      original: url,
      short: shortUrl,
      clicks: 0,
      created: new Date().toLocaleDateString(),
    }

    setUrls([newUrl, ...urls])
    setUrl('')
    setCustomSlug('')
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Short URL Generator
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* URL Input */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-long-url.com/very/long/path"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom slug (optional)
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300">
                    fk.link/
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-custom-link"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleShorten}
                disabled={!url}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Shorten URL
              </button>
            </div>

            {/* URL List */}
            {urls.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Your Short Links
                </h3>
                <div className="space-y-2">
                  {urls.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <a
                              href={item.original}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline"
                            >
                              {item.short}
                            </a>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              • {item.created}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.original}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(`https://${item.short}`)}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Copy"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {urls.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-600">
                No short links created yet
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Note: This is a frontend demo. In production, connect to a URL shortening API.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
