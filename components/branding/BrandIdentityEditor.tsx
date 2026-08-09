'use client'

import { useState, useRef } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

export default function BrandIdentityEditor() {
  const { updatePreset, updateLogo, removeLogo } = useBrandingStore()
  // Read directly from the store so every keystroke updates the live preview
  const currentPreset = useBrandingStore(s => s.presets.find(p => p.isDefault) ?? s.presets[0])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [extractedColors, setExtractedColors] = useState<string[]>([])
  const [colorsApplied, setColorsApplied] = useState(false)

  const extractColorsFromImage = (dataUrl: string) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 64
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, size, size)
      const data = ctx.getImageData(0, 0, size, size).data
      const colorMap: Record<string, number> = {}
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
        if (a < 128) continue
        const brightness = (r + g + b) / 3
        if (brightness > 235 || brightness < 20) continue // skip near-white/black
        // Quantize
        const qr = Math.round(r / 40) * 40
        const qg = Math.round(g / 40) * 40
        const qb = Math.round(b / 40) * 40
        const hex = '#' + [qr, qg, qb].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('')
        colorMap[hex] = (colorMap[hex] || 0) + 1
      }
      const top = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([hex]) => hex)
      setExtractedColors(top)
      setColorsApplied(false)
    }
    img.src = dataUrl
  }

  const applyExtractedColors = () => {
    if (extractedColors.length === 0) return
    const [primary, secondary, accent] = extractedColors
    updatePreset(currentPreset.id, {
      colors: {
        ...currentPreset.colors,
        primary: primary || currentPreset.colors.primary,
        secondary: secondary || primary || currentPreset.colors.secondary,
        accent: accent || primary || currentPreset.colors.accent,
      }
    })
    setColorsApplied(true)
  }

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      updateLogo(currentPreset.id, dataUrl)
      extractColorsFromImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) handleLogoUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4 py-4 lg:px-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Brand Identity</h3>
        <p className="text-slate-400 text-sm">
          Fill in your company details — they'll appear on every quote and invoice you send.
        </p>
      </div>

      {/* Logo Upload Section */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Company Logo
        </label>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          {currentPreset.logoUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={currentPreset.logoUrl}
                  alt="Company logo"
                  className="max-h-32 max-w-full object-contain"
                />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                >
                  Replace Logo
                </button>
                <button
                  onClick={() => removeLogo(currentPreset.id)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                  Remove Logo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-300 font-medium mb-1">
                  Drop your logo here or click to upload
                </p>
                <p className="text-slate-500 text-sm">
                  PNG, JPG, or SVG • Max 5MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all inline-block"
              >
                Choose File
              </button>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleLogoUpload(file)
          }}
          className="hidden"
        />
      </div>

      {/* Extracted Colors from Logo */}
      {extractedColors.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur border border-emerald-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-semibold text-white">Colors detected in your logo</h4>
              <p className="text-xs text-slate-400 mt-0.5">Apply these to your brand palette</p>
            </div>
            {colorsApplied && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Applied
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {extractedColors.map((color, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg border-2 border-slate-700 shadow-lg"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={applyExtractedColors}
              className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Use these colors
            </button>
          </div>
        </div>
      )}

      {/* Company Information */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Company Information</h4>
        
        <div className="space-y-3">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Business Name <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-slate-600 mb-1">Shows at the top of every document you send to clients</p>
            <input
              type="text"
              value={currentPreset.businessName || ''}
              onChange={(e) => updatePreset(currentPreset.id, { businessName: e.target.value })}
              placeholder="Your business name"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Tagline
            </label>
            <p className="text-xs text-slate-600 mb-1">A short phrase that sums up what you do — shown in document footers</p>
            <input
              type="text"
              value={currentPreset.footerText || ''}
              onChange={(e) => updatePreset(currentPreset.id, { footerText: e.target.value })}
              placeholder="e.g. Quality work, every time."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={currentPreset.businessEmail || ''}
                onChange={(e) => updatePreset(currentPreset.id, { businessEmail: e.target.value })}
                placeholder="Business email"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={currentPreset.businessPhone || ''}
                onChange={(e) => updatePreset(currentPreset.id, { businessPhone: e.target.value })}
                placeholder="Business phone"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Website
            </label>
            <input
              type="url"
              value={currentPreset.businessWebsite || ''}
              onChange={(e) => updatePreset(currentPreset.id, { businessWebsite: e.target.value })}
              placeholder="https://yourbusiness.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Address
            </label>
            <textarea
              value={currentPreset.businessAddress || ''}
              onChange={(e) => updatePreset(currentPreset.id, { businessAddress: e.target.value })}
              placeholder="Street address&#10;City, State ZIP"
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Brand Description
            </label>
            <p className="text-xs text-slate-600 mb-1">How would you describe your business in a few words? e.g. "Reliable, affordable, family-owned plumbing"</p>
            <textarea
              value={currentPreset.brandVoice || ''}
              onChange={(e) => updatePreset(currentPreset.id, { brandVoice: e.target.value })}
              placeholder="e.g. Professional and approachable, focused on quality and reliability."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all resize-none"
            />
          </div>
        </div>


      </div>

      {/* Quick Preview */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Preview</h4>
        <div className="bg-white p-5 rounded-lg">
          {currentPreset.logoUrl && (
            <img
              src={currentPreset.logoUrl}
              alt="Logo preview"
              className="max-h-16 mb-4"
            />
          )}
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {currentPreset.businessName || 'Your Business Name'}
          </h3>
          {currentPreset.footerText && (
            <p className="text-slate-600 mb-4">{currentPreset.footerText}</p>
          )}
          <div className="text-sm text-slate-500 space-y-0.5">
            {currentPreset.businessEmail && <div>{currentPreset.businessEmail}</div>}
            {currentPreset.businessPhone && <div>{currentPreset.businessPhone}</div>}
            {currentPreset.businessWebsite && <div>{currentPreset.businessWebsite}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
