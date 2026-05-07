'use client'

import { useState, useRef, useEffect } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

interface LetterheadGeneratorProps {
  isOpen?: boolean
  onClose: () => void
  isEmbedded?: boolean
}

type PageSize = 'letter' | 'a4'

const pageSizes = {
  letter: { width: 816, height: 1056, name: 'US Letter (8.5" × 11")' }, // 96 DPI
  a4: { width: 794, height: 1123, name: 'A4 (210mm × 297mm)' }, // 96 DPI
}

export default function LetterheadGenerator({ isOpen, onClose, isEmbedded = false }: LetterheadGeneratorProps) {
  // If not embedded, require isOpen prop
  if (!isEmbedded && !isOpen) return null
  
  const { getDefaultPreset } = useBrandingStore()
  const currentPreset = getDefaultPreset()
  
  const [pageSize, setPageSize] = useState<PageSize>('letter')
  const [includeFooter, setIncludeFooter] = useState(true)
  const [customMessage, setCustomMessage] = useState('')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      renderCanvas()
    }
  }, [pageSize, includeFooter, customMessage, currentPreset, isOpen])

  if (!isOpen) return null

  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const spec = pageSizes[pageSize]
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = spec.width
    canvas.height = spec.height

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, spec.width, spec.height)

    // Top section background (subtle)
    const gradient = ctx.createLinearGradient(0, 0, spec.width, 150)
    gradient.addColorStop(0, hexToRgba(currentPreset.colors.primary, 0.03))
    gradient.addColorStop(1, hexToRgba(currentPreset.colors.primary, 0))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, spec.width, 150)

    // Logo (if available)
    if (currentPreset.logoUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const logoMaxHeight = 80
        const aspectRatio = img.width / img.height
        const logoHeight = Math.min(logoMaxHeight, img.height)
        const logoWidth = logoHeight * aspectRatio
        const logoX = 50
        const logoY = 40
        ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight)
        continueRendering()
      }
      img.onerror = () => {
        continueRendering()
      }
      img.src = currentPreset.logoUrl
    } else {
      continueRendering()
    }

    function continueRendering() {
      if (!ctx || !canvas) return
      
      // Company Info (top right)
      ctx.fillStyle = currentPreset.colors.text
      ctx.textAlign = 'right'
      ctx.font = 'bold 20px Arial'
      ctx.fillText(currentPreset.businessName || 'Company Name', spec.width - 50, 50)

      ctx.font = '13px Arial'
      let yOffset = 75
      
      if (currentPreset.businessAddress) {
        const addressLines = currentPreset.businessAddress.split('\n')
        addressLines.forEach(line => {
          ctx.fillText(line, spec.width - 50, yOffset)
          yOffset += 18
        })
      }

      if (currentPreset.businessPhone) {
        ctx.fillText(`Phone: ${currentPreset.businessPhone}`, spec.width - 50, yOffset)
        yOffset += 18
      }

      if (currentPreset.businessEmail) {
        ctx.fillText(`Email: ${currentPreset.businessEmail}`, spec.width - 50, yOffset)
        yOffset += 18
      }

      if (currentPreset.businessWebsite) {
        ctx.fillStyle = currentPreset.colors.primary
        ctx.fillText(currentPreset.businessWebsite.replace(/^https?:\/\//, ''), spec.width - 50, yOffset)
      }

      // Decorative line
      ctx.strokeStyle = currentPreset.colors.primary
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, 150)
      ctx.lineTo(spec.width - 50, 150)
      ctx.stroke()

      // Content area placeholder
      ctx.fillStyle = currentPreset.colors.textLight
      ctx.textAlign = 'left'
      ctx.font = '12px Arial'
      ctx.fillText('[Your letter content goes here]', 50, 200)

      // Footer (if enabled)
      if (includeFooter) {
        const footerY = spec.height - 80
        
        // Footer line
        ctx.strokeStyle = currentPreset.colors.border
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(50, footerY)
        ctx.lineTo(spec.width - 50, footerY)
        ctx.stroke()

        // Footer text
        ctx.fillStyle = currentPreset.colors.textLight
        ctx.textAlign = 'center'
        ctx.font = '10px Arial'
        
        const footerText = customMessage || currentPreset.footerText || 'Thank you for your business'
        ctx.fillText(footerText, spec.width / 2, footerY + 25)

        if (currentPreset.businessWebsite || currentPreset.businessEmail) {
          const contactLine = [
            currentPreset.businessWebsite?.replace(/^https?:\/\//, ''),
            currentPreset.businessEmail
          ].filter(Boolean).join(' • ')
          ctx.fillText(contactLine, spec.width / 2, footerY + 40)
        }
      }

      // Update preview
      setPreviewUrl(canvas.toDataURL('image/png'))
    }
  }

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `letterhead-${pageSize}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <>
      {!isEmbedded && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      )}

      {/* Full Screen Editor */}
      <div className={isEmbedded ? "h-full flex flex-col" : "fixed inset-0 z-50 flex"}>
        {/* Main Preview Area */}
        <div className="flex-1 bg-slate-950 flex flex-col">
          {/* Top Bar */}
          <div className="flex-shrink-0 px-6 py-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📄</span>
                  Letterhead Generator
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {pageSizes[pageSize].name}
              </span>
              <button
                onClick={downloadImage}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-900/30">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Letterhead Preview"
                  className="max-h-[calc(100vh-150px)] w-auto rounded-lg shadow-2xl border border-slate-700"
                />
              ) : (
                <div className="w-96 h-[500px] bg-slate-800 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Generating preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Controls */}
        <div className="w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Settings</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Page Size */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Page Size</h4>
                  <div className="space-y-2">
                    {(Object.keys(pageSizes) as PageSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setPageSize(size)}
                        className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                          pageSize === size
                            ? 'border-blue-600 bg-blue-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex-shrink-0 mr-3">
                          {pageSize === size ? (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                          )}
                        </div>
                        <span className="text-sm text-slate-300">{pageSizes[size].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Options</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeFooter}
                        onChange={(e) => setIncludeFooter(e.target.checked)}
                        className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-slate-300">Include footer</span>
                    </label>

                    {includeFooter && (
                      <div className="ml-8">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Custom Footer Message
                        </label>
                        <textarea
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Thank you for your business"
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-white text-xs font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Usage
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Download as PNG template</li>
                    <li>• Import into Word or Pages</li>
                    <li>• Print on letterhead paper</li>
                    <li>• Best at 300 DPI</li>
                  </ul>
                </div>
          </div>
        </div>

        {/* Hidden canvas for rendering */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  )
}
