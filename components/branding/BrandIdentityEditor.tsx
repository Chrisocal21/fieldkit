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
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleSave = () => {
    updatePreset(currentPreset.id, {
      businessName,
      footerText: tagline,
      businessEmail: email,
      businessPhone: phone,
      businessWebsite: website,
      businessAddress: address,
    })
  }

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      updateLogo(currentPreset.id, dataUrl)
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
    <div className="max-w-4xl mx-auto space-y-6">
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
              placeholder="ANCHOR CRM"
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
              placeholder="Simplify your workflow"
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
                placeholder="hello@anchor.com"
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
                placeholder="(555) 123-4567"
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
              placeholder="https://anchor.com"
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
              placeholder="123 Main Street&#10;Suite 100&#10;San Francisco, CA 94102"
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
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
