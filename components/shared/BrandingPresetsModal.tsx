'use client'

import { useState, useRef, useEffect } from 'react'
import { useBrandingStore, BrandingPreset, DocumentLayoutType } from '@/store/brandingStore'
import QRCode from 'qrcode'

interface BrandingPresetsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BrandingPresetsModal({ isOpen, onClose }: BrandingPresetsModalProps) {
  const { presets, createPreset, updatePreset, deletePreset, duplicatePreset, setDefaultPreset, updateLogo, removeLogo } = useBrandingStore()
  
  const [selectedPreset, setSelectedPreset] = useState<BrandingPreset | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [previewType, setPreviewType] = useState<'quote' | 'invoice'>('quote')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [qrCodeText, setQrCodeText] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleCreateNew = () => {
    if (!presetName.trim()) return
    
    const defaultPreset = presets.find(p => p.isDefault) || presets[0]
    
    const newPreset = createPreset({
      name: presetName,
      logoPosition: 'left',
      logoWidth: 150,
      colors: { ...defaultPreset.colors },
      layoutType: 'classic',
      fontFamily: 'Helvetica',
      fontSize: { ...defaultPreset.fontSize },
      showBorders: true,
      accentColor: defaultPreset.accentColor,
      isDefault: false
    })
    
    handlePresetSelect(newPreset)
    setPresetName('')
    setIsCreating(false)
  }

  const handleDuplicate = (preset: BrandingPreset) => {
    const newPreset = duplicatePreset(preset.id, `${preset.name} (Copy)`)
    handlePresetSelect(newPreset)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      deletePreset(id)
      if (selectedPreset?.id === id) {
        setSelectedPreset(null)
      }
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedPreset) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      updateLogo(selectedPreset.id, base64)
      setSelectedPreset({ ...selectedPreset, logoUrl: base64 })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    if (!selectedPreset) return
    removeLogo(selectedPreset.id)
    setSelectedPreset({ ...selectedPreset, logoUrl: undefined })
  }

  // Generate QR code when text changes
  useEffect(() => {
    if (!selectedPreset || !qrCodeText.trim()) {
      return
    }

    // Debounce QR generation
    const timer = setTimeout(() => {
      QRCode.toDataURL(qrCodeText, { width: 300, margin: 2 })
        .then((url) => {
          updateSelectedPreset({ 
            paymentInfo: { 
              ...selectedPreset.paymentInfo, 
              qrCodeText: qrCodeText,
              qrCodeUrl: url 
            }
          })
        })
        .catch((err) => {
          console.error('Error generating QR code:', err)
        })
    }, 500)

    return () => clearTimeout(timer)
  }, [qrCodeText])

  // Load QR text when preset changes
  useEffect(() => {
    if (selectedPreset?.paymentInfo?.qrCodeText) {
      setQrCodeText(selectedPreset.paymentInfo.qrCodeText)
    } else {
      setQrCodeText('')
    }
  }, [selectedPreset?.id])

  const handleRemoveQRCode = () => {
    if (!selectedPreset) return
    setQrCodeText('')
    updateSelectedPreset({ 
      paymentInfo: { 
        ...selectedPreset.paymentInfo, 
        qrCodeText: undefined,
        qrCodeUrl: undefined 
      }
    })
  }

  const updateSelectedPreset = (updates: Partial<BrandingPreset>) => {
    if (!selectedPreset) return
    updatePreset(selectedPreset.id, updates)
    setSelectedPreset({ ...selectedPreset, ...updates })
  }

  // Handle preset selection while preserving user content
  const handlePresetSelect = (newPreset: BrandingPreset) => {
    if (!selectedPreset) {
      // First time selecting a preset, use it as-is
      setSelectedPreset(newPreset)
      return
    }

    // Preserve content from current preset and apply to new preset
    const contentToPreserve = {
      logoUrl: selectedPreset.logoUrl,
      businessName: selectedPreset.businessName,
      businessAddress: selectedPreset.businessAddress,
      businessPhone: selectedPreset.businessPhone,
      businessEmail: selectedPreset.businessEmail,
      businessWebsite: selectedPreset.businessWebsite,
      footerText: selectedPreset.footerText,
      paymentInfo: selectedPreset.paymentInfo,
    }

    // Create new preset with preserved content but new style
    const presetWithContent = {
      ...newPreset,
      ...contentToPreserve
    }

    // Update the store
    updatePreset(newPreset.id, contentToPreserve)
    
    // Set as selected
    setSelectedPreset(presetWithContent)
  }

  const builtInPresetIds = ['classic-default', 'modern-preset', 'minimal-preset', 'bold-preset']

  // Sample data for preview
  const sampleLineItems = [
    { id: '1', description: 'Custom Woodwork', quantity: 1, unitPrice: 850.00, type: 'labor' as const },
    { id: '2', description: 'Premium Oak Lumber', quantity: 25, unitPrice: 12.50, type: 'material' as const },
    { id: '3', description: 'Hardware & Finishing', quantity: 1, unitPrice: 75.00, type: 'material' as const }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Document Branding & Presets
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Preset List */}
          <div className="w-56 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <div className="mb-4">
              {isCreating ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                    placeholder="Preset name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateNew}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false)
                        setPresetName('')
                      }}
                      className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Preset
                </button>
              )}
            </div>

            <div className="space-y-1">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 rounded-md cursor-pointer flex items-center justify-between group ${
                    selectedPreset?.id === preset.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {preset.name}
                      </span>
                      {preset.isDefault && (
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {preset.layoutType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle - Preset Editor */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200 dark:border-gray-700">
            {selectedPreset ? (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Preset Actions */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedPreset.name}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDuplicate(selectedPreset)}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Duplicate
                    </button>
                    {!builtInPresetIds.includes(selectedPreset.id) && (
                      <button
                        onClick={() => handleDelete(selectedPreset.id)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                          deleteConfirmId === selectedPreset.id
                            ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                            : 'border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        {deleteConfirmId === selectedPreset.id ? 'Confirm?' : 'Delete'}
                      </button>
                    )}
                    {!selectedPreset.isDefault && (
                      <button
                        onClick={() => {
                          setDefaultPreset(selectedPreset.id)
                          updateSelectedPreset({ isDefault: true })
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Company Logo
                  </h4>
                  
                  {selectedPreset.logoUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedPreset.logoUrl}
                          alt="Logo preview"
                          className="h-16 object-contain border border-gray-200 dark:border-gray-700 rounded p-2 bg-white"
                        />
                        <button
                          onClick={handleRemoveLogo}
                          className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload logo
                      </span>
                      <span className="text-xs text-gray-500">PNG, JPG, or SVG</span>
                    </button>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <select
                        value={selectedPreset.logoPosition}
                        onChange={(e) => updateSelectedPreset({ logoPosition: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={selectedPreset.logoWidth}
                        onChange={(e) => updateSelectedPreset({ logoWidth: parseInt(e.target.value) || 150 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        min="50"
                        max="300"
                      />
                    </div>
                  </div>
                </div>

                {/* Layout Type */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Invoice Theme
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['classic', 'modern', 'minimal', 'bold'] as DocumentLayoutType[]).map((layout) => {
                      // Find the built-in preset for this layout type
                      const targetPreset = presets.find(p => p.layoutType === layout && 
                        ['classic-default', 'modern-preset', 'minimal-preset', 'bold-preset'].includes(p.id))
                      
                      return (
                        <button
                          key={layout}
                          onClick={() => targetPreset && handlePresetSelect(targetPreset)}
                          className={`py-3 px-4 border-2 rounded-lg text-sm font-medium capitalize transition-all ${
                            selectedPreset.layoutType === layout
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                          }`}
                        >
                          {layout}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Colors */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Brand Colors
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={selectedPreset.colors.primary}
                          onChange={(e) => updateSelectedPreset({
                            colors: { ...selectedPreset.colors, primary: e.target.value }
                          })}
                          className="w-20 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedPreset.colors.primary}
                          onChange={(e) => updateSelectedPreset({
                            colors: { ...selectedPreset.colors, primary: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Accent Color
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={selectedPreset.colors.accent || selectedPreset.accentColor}
                          onChange={(e) => updateSelectedPreset({ 
                            accentColor: e.target.value,
                            colors: { ...selectedPreset.colors, accent: e.target.value }
                          })}
                          className="w-20 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedPreset.colors.accent || selectedPreset.accentColor}
                          onChange={(e) => updateSelectedPreset({ 
                            accentColor: e.target.value,
                            colors: { ...selectedPreset.colors, accent: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    
                    {/* Advanced Colors - Collapsible */}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 select-none">
                        Advanced Colors
                      </summary>
                      <div className="mt-4 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Secondary
                            </label>
                            <input
                              type="color"
                              value={selectedPreset.colors.secondary}
                              onChange={(e) => updateSelectedPreset({
                                colors: { ...selectedPreset.colors, secondary: e.target.value }
                              })}
                              className="w-full h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Text
                            </label>
                            <input
                              type="color"
                              value={selectedPreset.colors.text}
                              onChange={(e) => updateSelectedPreset({
                                colors: { ...selectedPreset.colors, text: e.target.value }
                              })}
                              className="w-full h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Text Light
                            </label>
                            <input
                              type="color"
                              value={selectedPreset.colors.textLight}
                              onChange={(e) => updateSelectedPreset({
                                colors: { ...selectedPreset.colors, textLight: e.target.value }
                              })}
                              className="w-full h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Background
                            </label>
                            <input
                              type="color"
                              value={selectedPreset.colors.background}
                              onChange={(e) => updateSelectedPreset({
                                colors: { ...selectedPreset.colors, background: e.target.value }
                              })}
                              className="w-full h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                {/* Typography */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Typography
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Font Family
                      </label>
                      <select
                        value={selectedPreset.fontFamily}
                        onChange={(e) => updateSelectedPreset({ fontFamily: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="Helvetica">Helvetica (Sans-Serif)</option>
                        <option value="Arial">Arial (Sans-Serif)</option>
                        <option value="Times">Times (Serif)</option>
                        <option value="Georgia">Georgia (Serif)</option>
                        <option value="Courier">Courier (Monospace)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title Size
                      </label>
                      <input
                        type="number"
                        value={selectedPreset.fontSize.title}
                        onChange={(e) => updateSelectedPreset({
                          fontSize: { ...selectedPreset.fontSize, title: parseInt(e.target.value) || 24 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        min="16"
                        max="48"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Body Size
                      </label>
                      <input
                        type="number"
                        value={selectedPreset.fontSize.body}
                        onChange={(e) => updateSelectedPreset({
                          fontSize: { ...selectedPreset.fontSize, body: parseInt(e.target.value) || 10 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        min="8"
                        max="16"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Business Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Business Name"
                      value={selectedPreset.businessName || ''}
                      onChange={(e) => updateSelectedPreset({ businessName: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={selectedPreset.businessPhone || ''}
                      onChange={(e) => updateSelectedPreset({ businessPhone: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={selectedPreset.businessEmail || ''}
                      onChange={(e) => updateSelectedPreset({ businessEmail: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Website"
                      value={selectedPreset.businessWebsite || ''}
                      onChange={(e) => updateSelectedPreset({ businessWebsite: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <textarea
                      placeholder="Address"
                      value={selectedPreset.businessAddress || ''}
                      onChange={(e) => updateSelectedPreset({ businessAddress: e.target.value })}
                      className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Footer Text */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Footer Text
                  </h4>
                  <textarea
                    placeholder="Thank you for your business! Payment terms, etc."
                    value={selectedPreset.footerText || ''}
                    onChange={(e) => updateSelectedPreset({ footerText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    rows={3}
                  />
                </div>

                {/* Payment Information */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Methods
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Venmo (@username)"
                        value={selectedPreset.paymentInfo?.venmo || ''}
                        onChange={(e) => updateSelectedPreset({ 
                          paymentInfo: { ...selectedPreset.paymentInfo, venmo: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="PayPal (email or @username)"
                        value={selectedPreset.paymentInfo?.paypal || ''}
                        onChange={(e) => updateSelectedPreset({ 
                          paymentInfo: { ...selectedPreset.paymentInfo, paypal: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Cash App ($username)"
                        value={selectedPreset.paymentInfo?.cashApp || ''}
                        onChange={(e) => updateSelectedPreset({ 
                          paymentInfo: { ...selectedPreset.paymentInfo, cashApp: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Zelle (email or phone)"
                        value={selectedPreset.paymentInfo?.zelle || ''}
                        onChange={(e) => updateSelectedPreset({ 
                          paymentInfo: { ...selectedPreset.paymentInfo, zelle: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <textarea
                      placeholder="Bank Details (e.g., Account #, Routing #, etc.)"
                      value={selectedPreset.paymentInfo?.bankDetails || ''}
                      onChange={(e) => updateSelectedPreset({ 
                        paymentInfo: { ...selectedPreset.paymentInfo, bankDetails: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      rows={2}
                    />
                    
                    {/* Payment QR Code Generator */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Link QR Code
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Add a Linktree, website, or payment page URL to generate a QR code
                      </p>
                      <input
                        type="url"
                        placeholder="https://linktr.ee/yourbusiness or https://yoursite.com/pay"
                        value={qrCodeText}
                        onChange={(e) => setQrCodeText(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      {selectedPreset.paymentInfo?.qrCodeUrl && (
                        <div className="mt-4 flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <img
                            src={selectedPreset.paymentInfo.qrCodeUrl}
                            alt="Payment QR Code"
                            className="h-28 w-28 object-contain border border-gray-300 dark:border-gray-600 rounded bg-white p-2"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              QR Code Generated
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 break-all mb-3">
                              {selectedPreset.paymentInfo.qrCodeText}
                            </p>
                            <button
                              onClick={handleRemoveQRCode}
                              className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-red-300 dark:border-red-600"
                            >
                              Clear QR Code
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Display Options
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPreset.showBorders}
                      onChange={(e) => updateSelectedPreset({ showBorders: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show table borders
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Select a preset to edit or create a new one
              </div>
            )}
          </div>

          {/* Right Side - Live Preview (50% width) */}
          {selectedPreset && (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h3>
                  <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-md p-1 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setPreviewType('quote')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        previewType === 'quote'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Quote
                    </button>
                    <button
                      onClick={() => setPreviewType('invoice')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        previewType === 'invoice'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Invoice
                    </button>
                  </div>
                </div>

                {/* Preview Document */}
                <div 
                  className="rounded-lg shadow-lg border overflow-hidden"
                  style={{
                    backgroundColor: selectedPreset.colors.background,
                    borderColor: selectedPreset.colors.border,
                  }}
                >
                  {/* CLASSIC LAYOUT - Simple header with rounded badge */}
                  {selectedPreset.layoutType === 'classic' && (
                    <div className="p-6">
                      {/* Logo */}
                      {selectedPreset.logoUrl && (
                        <div className={`mb-4 flex ${selectedPreset.logoPosition === 'center' ? 'justify-center' : selectedPreset.logoPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
                          <img src={selectedPreset.logoUrl} alt="Logo" style={{ width: `${selectedPreset.logoWidth * 0.4}px` }} className="object-contain" />
                        </div>
                      )}
                      
                      {/* Title */}
                      <h1 className="font-bold mb-3" style={{ fontSize: `${selectedPreset.fontSize.title * 0.5}px`, color: selectedPreset.colors.primary }}>
                        {selectedPreset.businessName || 'YOUR BUSINESS'}
                      </h1>
                      <p className="text-xs mb-4" style={{ color: selectedPreset.colors.textLight }}>
                        {selectedPreset.businessAddress?.split('\n')[0] || 'Your Business Foundation'}
                      </p>
                      
                      {/* Invoice badge */}
                      <div className="inline-block px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: selectedPreset.colors.primary + '20', color: selectedPreset.colors.primary }}>
                        <span className="text-xs font-semibold uppercase">{previewType === 'quote' ? 'QUOTE' : 'INVOICE'} #{previewType === 'quote' ? 'ANC-2026-001' : '1001'}</span>
                      </div>
                    </div>
                  )}

                  {/* MODERN LAYOUT - Gradient header banner full width */}
                  {selectedPreset.layoutType === 'modern' && (
                    <>
                      <div className="p-8 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${selectedPreset.colors.primary}, ${selectedPreset.accentColor})` }}>
                        <div className="flex justify-between items-start">
                          <div>
                            {selectedPreset.logoUrl && (
                              <img src={selectedPreset.logoUrl} alt="Logo" style={{ width: `${selectedPreset.logoWidth * 0.4}px` }} className="object-contain mb-4" />
                            )}
                            <h1 className="font-bold text-white mb-1" style={{ fontSize: `${selectedPreset.fontSize.title * 0.5}px` }}>
                              {selectedPreset.businessName || 'YOUR BUSINESS'}
                            </h1>
                            <p className="text-xs text-white/80">
                              {selectedPreset.businessAddress?.split('\n')[0] || 'Your Business Foundation'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                              <p className="text-white/80 text-[10px] uppercase font-semibold mb-1">{previewType === 'quote' ? 'Quote' : 'Invoice'}</p>
                              <p className="text-white font-bold text-sm">#{previewType === 'quote' ? 'ANC-2026-001' : '1001'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6"></div>
                    </>
                  )}

                  {/* MINIMAL LAYOUT - Clean bordered box header */}
                  {selectedPreset.layoutType === 'minimal' && (
                    <div className="p-6">
                      <div className="border rounded-lg p-6 mb-6" style={{ borderColor: selectedPreset.colors.border, borderWidth: '2px' }}>
                        {selectedPreset.logoUrl && (
                          <div className="flex justify-center mb-4">
                            <img src={selectedPreset.logoUrl} alt="Logo" style={{ width: `${selectedPreset.logoWidth * 0.4}px` }} className="object-contain" />
                          </div>
                        )}
                        <div className="text-center space-y-3">
                          <h1 className="font-bold" style={{ fontSize: `${selectedPreset.fontSize.title * 0.5}px`, color: selectedPreset.colors.text }}>
                            {selectedPreset.businessName || 'YOUR BUSINESS'}
                          </h1>
                          <p className="text-xs" style={{ color: selectedPreset.colors.textLight }}>
                            {selectedPreset.businessAddress?.split('\n')[0] || 'Your Business Foundation'}
                          </p>
                          <div className="pt-2">
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: selectedPreset.colors.textLight }}>
                              {previewType === 'quote' ? 'Quote' : 'Invoice'}
                            </p>
                            <p className="font-semibold text-sm" style={{ color: selectedPreset.colors.text }}>
                              #{previewType === 'quote' ? 'ANC-2026-001' : '1001'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOLD LAYOUT - Full-width colored banner */}
                  {selectedPreset.layoutType === 'bold' && (
                    <>
                      <div className="p-8" style={{ backgroundColor: selectedPreset.colors.primary }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h1 className="font-black text-white mb-2" style={{ fontSize: `${selectedPreset.fontSize.title * 0.6}px`, letterSpacing: '0.05em' }}>
                              {previewType === 'quote' ? 'QUOTE' : 'INVOICE'}
                            </h1>
                            <p className="text-white/90 text-xs font-medium">
                              #{previewType === 'quote' ? 'ANC-2026-001' : '1001'}
                            </p>
                          </div>
                          {selectedPreset.logoUrl && (
                            <img src={selectedPreset.logoUrl} alt="Logo" style={{ width: `${selectedPreset.logoWidth * 0.4}px` }} className="object-contain" />
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-6">
                          <h2 className="font-bold mb-1" style={{ fontSize: `${selectedPreset.fontSize.heading * 0.5}px`, color: selectedPreset.colors.text }}>
                            {selectedPreset.businessName || 'YOUR BUSINESS'}
                          </h2>
                          <p className="text-xs" style={{ color: selectedPreset.colors.textLight }}>
                            {selectedPreset.businessAddress?.split('\n')[0] || 'Your Business Foundation'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* SHARED CONTENT - Line Items, Totals, Footer */}
                  <div className="px-6 pb-6">

                    {/* Line Items */}
                    <div className="mb-4">
                      <h3
                        className="font-semibold uppercase mb-2 text-xs"
                        style={{
                          color: selectedPreset.colors.secondary,
                        }}
                      >
                        Items
                      </h3>
                      <table className="w-full text-xs">
                        <thead>
                          <tr
                            style={{
                              borderBottomWidth: selectedPreset.showBorders ? '1px' : '0',
                              borderColor: selectedPreset.colors.border,
                            }}
                          >
                            <th
                              className="text-left pb-1 font-semibold"
                              style={{
                                color: selectedPreset.colors.text,
                              }}
                            >
                              Description
                            </th>
                            <th
                              className="text-right pb-1 font-semibold"
                              style={{
                                color: selectedPreset.colors.text,
                              }}
                            >
                              Qty
                            </th>
                            <th
                              className="text-right pb-1 font-semibold"
                              style={{
                                color: selectedPreset.colors.text,
                              }}
                            >
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleLineItems.map((item, index) => (
                            <tr
                              key={item.id}
                              style={{
                                borderBottomWidth: selectedPreset.showBorders && index !== sampleLineItems.length - 1 ? '1px' : '0',
                                borderColor: selectedPreset.colors.border,
                              }}
                            >
                              <td
                                className="py-1.5"
                                style={{
                                  color: selectedPreset.colors.text,
                                }}
                              >
                                {item.description}
                              </td>
                              <td
                                className="text-right py-1.5"
                                style={{
                                  color: selectedPreset.colors.text,
                                }}
                              >
                                {item.quantity}
                              </td>
                              <td
                                className="text-right py-1.5 font-medium"
                                style={{
                                  color: selectedPreset.colors.text,
                                }}
                              >
                                ${(item.quantity * item.unitPrice).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-4">
                      <div className="space-y-1 min-w-[140px] text-xs">
                        <div className="flex justify-between">
                          <span
                            style={{
                              color: selectedPreset.colors.textLight,
                            }}
                          >
                            Subtotal:
                          </span>
                          <span
                            className="font-medium"
                            style={{
                              color: selectedPreset.colors.text,
                            }}
                          >
                            $1,237.50
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            style={{
                              color: selectedPreset.colors.textLight,
                            }}
                          >
                            Tax (8.0%):
                          </span>
                          <span
                            className="font-medium"
                            style={{
                              color: selectedPreset.colors.text,
                            }}
                          >
                            $99.00
                          </span>
                        </div>
                        <div
                          className="flex justify-between font-bold pt-1.5"
                          style={{
                            borderTopWidth: selectedPreset.showBorders ? '1px' : '0',
                            borderColor: selectedPreset.colors.border,
                          }}
                        >
                          <span
                            style={{
                              fontSize: `${selectedPreset.fontSize.heading * 0.5}px`,
                              color: selectedPreset.accentColor,
                            }}
                          >
                            TOTAL:
                          </span>
                          <span
                            style={{
                              fontSize: `${selectedPreset.fontSize.heading * 0.5}px`,
                              color: selectedPreset.accentColor,
                            }}
                          >
                            $1,336.50
                          </span>
                        </div>
                        {previewType === 'invoice' && (
                          <>
                            <div className="flex justify-between pt-1.5">
                              <span
                                style={{
                                  color: selectedPreset.colors.textLight,
                                }}
                              >
                                Paid:
                              </span>
                              <span
                                style={{
                                  color: selectedPreset.colors.text,
                                }}
                              >
                                $500.00
                              </span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span
                                style={{
                                  fontSize: `${selectedPreset.fontSize.heading * 0.5}px`,
                                  color: selectedPreset.accentColor,
                                }}
                              >
                                Due:
                              </span>
                              <span
                                style={{
                                  fontSize: `${selectedPreset.fontSize.heading * 0.5}px`,
                                  color: selectedPreset.accentColor,
                                }}
                              >
                                $836.50
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className="pt-3 space-y-3"
                      style={{
                        borderTopWidth: '1px',
                        borderColor: selectedPreset.colors.border,
                      }}
                    >
                      {selectedPreset.footerText && (
                        <p
                          className="text-xs"
                          style={{
                            color: selectedPreset.colors.textLight,
                          }}
                        >
                          {selectedPreset.footerText.substring(0, 150)}
                          {selectedPreset.footerText.length > 150 && '...'}
                        </p>
                      )}

                      {/* Payment Information */}
                      {(selectedPreset.paymentInfo?.venmo || 
                        selectedPreset.paymentInfo?.paypal || 
                        selectedPreset.paymentInfo?.cashApp || 
                        selectedPreset.paymentInfo?.zelle ||
                        selectedPreset.paymentInfo?.bankDetails ||
                        selectedPreset.paymentInfo?.qrCodeUrl) && (
                        <div className="space-y-2">
                          <h4
                            className="text-xs font-semibold uppercase"
                            style={{ color: selectedPreset.colors.secondary }}
                          >
                            Payment Methods
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {selectedPreset.paymentInfo?.venmo && (
                              <div style={{ color: selectedPreset.colors.text }}>
                                <span className="font-medium">Venmo:</span> {selectedPreset.paymentInfo.venmo}
                              </div>
                            )}
                            {selectedPreset.paymentInfo?.paypal && (
                              <div style={{ color: selectedPreset.colors.text }}>
                                <span className="font-medium">PayPal:</span> {selectedPreset.paymentInfo.paypal}
                              </div>
                            )}
                            {selectedPreset.paymentInfo?.cashApp && (
                              <div style={{ color: selectedPreset.colors.text }}>
                                <span className="font-medium">Cash App:</span> {selectedPreset.paymentInfo.cashApp}
                              </div>
                            )}
                            {selectedPreset.paymentInfo?.zelle && (
                              <div style={{ color: selectedPreset.colors.text }}>
                                <span className="font-medium">Zelle:</span> {selectedPreset.paymentInfo.zelle}
                              </div>
                            )}
                          </div>
                          {selectedPreset.paymentInfo?.bankDetails && (
                            <p
                              className="text-xs"
                              style={{ color: selectedPreset.colors.text }}
                            >
                              <span className="font-medium">Bank:</span> {selectedPreset.paymentInfo.bankDetails}
                            </p>
                          )}
                          {selectedPreset.paymentInfo?.qrCodeUrl && (
                            <div className="flex flex-col items-center pt-2 gap-1">
                              <img
                                src={selectedPreset.paymentInfo.qrCodeUrl}
                                alt="Payment QR Code"
                                className="w-16 h-16 object-contain border rounded p-1"
                                style={{ borderColor: selectedPreset.colors.border }}
                              />
                              {selectedPreset.paymentInfo?.qrCodeText && (
                                <p 
                                  className="text-[8px] text-center px-2"
                                  style={{ color: selectedPreset.colors.textLight }}
                                >
                                  Scan to pay
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Preview updates in real-time
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
