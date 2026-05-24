'use client'

import { useState, useRef } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

export default function BrandIdentityEditor() {
  const { presets, getDefaultPreset, updatePreset, updateLogo, removeLogo } = useBrandingStore()
  const currentPreset = getDefaultPreset()
  
  const [businessName, setBusinessName] = useState(currentPreset.businessName || '')
  const [tagline, setTagline] = useState(currentPreset.footerText || '')
  const [email, setEmail] = useState(currentPreset.businessEmail || '')
  const [phone, setPhone] = useState(currentPreset.businessPhone || '')
  const [website, setWebsite] = useState(currentPreset.businessWebsite || '')
  const [address, setAddress] = useState(currentPreset.businessAddress || '')
  const [brandVoice, setBrandVoice] = useState(currentPreset.brandVoice || '')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [extractedColors, setExtractedColors] = useState<string[]>([])
  const [colorsApplied, setColorsApplied] = useState(false)

  const handleSave = () => {
    updatePreset(currentPreset.id, {
      businessName,
      footerText: tagline,
      businessEmail: email,
      businessPhone: phone,
      businessWebsite: website,
      businessAddress: address,
      brandVoice,
    })
  }

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
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-4 lg:px-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Brand Identity</h3>
        <p className="text-slate-400 text-sm">
          Define your company information and upload your logo
        </p>
      </div>

      {/* Logo Upload Section */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Company Logo
        </label>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
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
              <div className="text-5xl">🖼️</div>
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
        <div className="bg-slate-900/50 backdrop-blur border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
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
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Company Information</h4>
        
        <div className="space-y-4">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Business Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onBlur={handleSave}
              placeholder="Your business name"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              onBlur={handleSave}
              placeholder="Your tagline or slogan"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleSave}
                placeholder="Business email address"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handleSave}
                placeholder="Business phone number"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onBlur={handleSave}
              placeholder="https://yourbusiness.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Business Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={handleSave}
              placeholder="Street address&#10;City, State ZIP"
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Brand Voice
            </label>
            <p className="text-xs text-slate-500 mb-2">Describe your brand's tone and personality — used to guide asset copy</p>
            <textarea
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              onBlur={handleSave}
              placeholder="e.g. Professional and approachable, focused on quality and reliability. We speak plainly and never oversell."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Changes saved automatically</span>
        </div>
      </div>

      {/* Quick Preview */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Brand Preview</h4>
        <div className="bg-white p-8 rounded-lg">
          {currentPreset.logoUrl && (
            <img
              src={currentPreset.logoUrl}
              alt="Logo preview"
              className="max-h-16 mb-4"
            />
          )}
          <h3 className="text-2xl font-bold text-slate-900 mb-1">
            {businessName || 'Your Business Name'}
          </h3>
          {tagline && (
            <p className="text-slate-600 mb-4">{tagline}</p>
          )}
          <div className="text-sm text-slate-700 space-y-1">
            {email && <div>✉️ {email}</div>}
            {phone && <div>📞 {phone}</div>}
            {website && <div>🌐 {website}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
