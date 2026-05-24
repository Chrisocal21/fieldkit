'use client'

import { useState, useRef, useEffect } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

interface SocialMediaGeneratorProps {
  isOpen?: boolean
  onClose: () => void
  isEmbedded?: boolean
}

type Platform = 'linkedin-cover' | 'facebook-cover' | 'twitter-header' | 'instagram-post' | 'instagram-story'

const platformSpecs = {
  'linkedin-cover': { width: 1584, height: 396, name: 'LinkedIn Cover' },
  'facebook-cover': { width: 820, height: 312, name: 'Facebook Cover' },
  'twitter-header': { width: 1500, height: 500, name: 'Twitter Header' },
  'instagram-post': { width: 1080, height: 1080, name: 'Instagram Post' },
  'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story' },
}

export default function SocialMediaGenerator({ isOpen, onClose, isEmbedded = false }: SocialMediaGeneratorProps) {
  if (!isEmbedded && !isOpen) return null
  
  const { getDefaultPreset } = useBrandingStore()
  const currentPreset = getDefaultPreset()
  
  const [platform, setPlatform] = useState<Platform>('linkedin-cover')
  const [headline, setHeadline] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [backgroundColor, setBackgroundColor] = useState(currentPreset.colors.primary)
  const [textColor, setTextColor] = useState('#ffffff')
  const [useGradient, setUseGradient] = useState(true)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    renderCanvas()
  }, [platform, headline, subheadline, backgroundColor, textColor, useGradient, currentPreset, isOpen])

  if (!isEmbedded && !isOpen) return null

  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const spec = platformSpecs[platform]
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = spec.width
    canvas.height = spec.height

    // Background
    if (useGradient) {
      const gradient = ctx.createLinearGradient(0, 0, spec.width, spec.height)
      gradient.addColorStop(0, backgroundColor)
      gradient.addColorStop(1, currentPreset.colors.secondary)
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = backgroundColor
    }
    ctx.fillRect(0, 0, spec.width, spec.height)

    // Logo (if available)
    if (currentPreset.logoUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const logoHeight = spec.height * 0.15
        const aspectRatio = img.width / img.height
        const logoWidth = logoHeight * aspectRatio
        const logoX = 50
        const logoY = 50
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
      
      // Headline
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const headlineFontSize = spec.height * 0.12
      ctx.font = `bold ${headlineFontSize}px Arial, sans-serif`
      const headlineText = headline || 'Your Headline'
      ctx.fillText(headlineText, spec.width / 2, spec.height / 2 - headlineFontSize * 0.6)

      // Subheadline
      if (subheadline) {
        const subheadlineFontSize = spec.height * 0.06
        ctx.font = `${subheadlineFontSize}px Arial, sans-serif`
        ctx.fillStyle = textColor
        ctx.globalAlpha = 0.9
        ctx.fillText(subheadline, spec.width / 2, spec.height / 2 + headlineFontSize * 0.6)
        ctx.globalAlpha = 1
      }

      // Website/Company name at bottom
      if (currentPreset.businessWebsite || currentPreset.businessName) {
        const bottomFontSize = spec.height * 0.04
        ctx.font = `${bottomFontSize}px Arial, sans-serif`
        ctx.fillStyle = textColor
        ctx.globalAlpha = 0.7
        const bottomText = currentPreset.businessWebsite?.replace(/^https?:\/\//, '') || currentPreset.businessName || ''
        ctx.fillText(bottomText, spec.width / 2, spec.height - 50)
        ctx.globalAlpha = 1
      }

      // Update preview
      setPreviewUrl(canvas.toDataURL('image/png'))
    }
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${platform}-${Date.now()}.png`
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
                  <span>📱</span>
                  Social Media Graphics
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {platformSpecs[platform].width} × {platformSpecs[platform].height}px
              </span>
              <button
                onClick={downloadImage}
                disabled={!headline}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[calc(100vh-200px)] rounded-lg shadow-2xl border border-slate-700"
                />
              ) : (
                <div className="w-96 h-96 bg-slate-800 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Generating preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Controls */}
        <div className="w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Customize</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Platform Selection */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Platform & Size</h4>
                  <div className="space-y-2">
                    {(Object.keys(platformSpecs) as Platform[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          platform === p
                            ? 'border-blue-600 bg-blue-500/10 text-white'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <span className="font-medium">{platformSpecs[p].name}</span>
                        <span className="text-xs opacity-60">
                          {platformSpecs[p].width} × {platformSpecs[p].height}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Content */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Text Content</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Your Main Message"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Subheadline
                      </label>
                      <input
                        type="text"
                        value={subheadline}
                        onChange={(e) => setSubheadline(e.target.value)}
                        placeholder="Optional supporting text"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Styling */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Colors & Style</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-16 h-12 rounded cursor-pointer border-2 border-slate-700"
                          />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm font-mono focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-16 h-12 rounded cursor-pointer border-2 border-slate-700"
                          />
                          <input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm font-mono focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useGradient}
                        onChange={(e) => setUseGradient(e.target.checked)}
                        className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-slate-300">Use gradient background</span>
                    </label>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-white text-xs font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Pro Tips
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Keep text short and impactful</li>
                    <li>• Ensure good contrast</li>
                    <li>• Use high-quality logo</li>
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
