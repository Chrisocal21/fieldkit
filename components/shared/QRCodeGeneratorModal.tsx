'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QRCodeGeneratorModal({ isOpen, onClose }: QRCodeGeneratorModalProps) {
  const [text, setText] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (text && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      
      QRCode.toDataURL(text, { width: 300, margin: 2 }).then((url) => {
        setQrCodeUrl(url)
      })
    }
  }, [text])

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  const handleCopy = async () => {
    if (qrCodeUrl) {
      try {
        const blob = await (await fetch(qrCodeUrl)).blob()
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        alert('QR Code copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              QR Code Generator
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
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter text or URL
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com or any text..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                rows={3}
              />
            </div>

            {text && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <canvas ref={canvasRef} />
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleDownload}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {!text && (
              <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-600">
                Enter text above to generate QR code
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
