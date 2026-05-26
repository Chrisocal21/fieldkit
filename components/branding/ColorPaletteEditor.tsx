'use client'

import { useState } from 'react'
import { useBrandingStore, BrandingColors } from '@/store/brandingStore'

export default function ColorPaletteEditor() {
  const { getDefaultPreset, updatePreset } = useBrandingStore()
  const currentPreset = getDefaultPreset()
  const [colors, setColors] = useState<BrandingColors>(currentPreset.colors)

  const updateColor = (key: keyof BrandingColors, value: string) => {
    const newColors = { ...colors, [key]: value }
    setColors(newColors)
    updatePreset(currentPreset.id, { colors: newColors })
  }

  const colorSections = [
    {
      title: 'Brand Colors',
      colors: [
        { key: 'primary' as keyof BrandingColors, label: 'Primary', description: 'Main brand color' },
        { key: 'secondary' as keyof BrandingColors, label: 'Secondary', description: 'Secondary color' },
        { key: 'accent' as keyof BrandingColors, label: 'Accent', description: 'Highlight color' },
      ]
    },
    {
      title: 'Background Colors',
      colors: [
        { key: 'background' as keyof BrandingColors, label: 'Background', description: 'Page background' },
        { key: 'border' as keyof BrandingColors, label: 'Border', description: 'Border color' },
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'text' as keyof BrandingColors, label: 'Text', description: 'Primary text' },
        { key: 'textLight' as keyof BrandingColors, label: 'Light Text', description: 'Secondary text' },
      ]
    }
  ]

  const presetPalettes = [
    {
      name: 'Ocean Blue',
      colors: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#06b6d4',
        background: '#ffffff',
        border: '#cbd5e1',
        text: '#1e293b',
        textLight: '#64748b'
      }
    },
    {
      name: 'Forest Green',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#14b8a6',
        background: '#ffffff',
        border: '#cbd5e1',
        text: '#1e293b',
        textLight: '#64748b'
      }
    },
    {
      name: 'Royal Purple',
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: '#ffffff',
        border: '#cbd5e1',
        text: '#1e293b',
        textLight: '#64748b'
      }
    },
    {
      name: 'Sunset Orange',
      colors: {
        primary: '#f97316',
        secondary: '#ea580c',
        accent: '#fb923c',
        background: '#ffffff',
        border: '#cbd5e1',
        text: '#1e293b',
        textLight: '#64748b'
      }
    }
  ]

  const applyPresetPalette = (paletteColors: Partial<BrandingColors>) => {
    const newColors = { ...colors, ...paletteColors }
    setColors(newColors)
    updatePreset(currentPreset.id, { colors: newColors })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4 py-4 lg:px-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Color Palette</h3>
        <p className="text-slate-400 text-sm">
          Customize your brand colors for documents and assets
        </p>
      </div>

      {/* Preset Palettes */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => applyPresetPalette(palette.colors)}
              className="group p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg transition-all"
            >
              <div className="flex gap-1 mb-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: palette.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: palette.colors.secondary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: palette.colors.accent }}
                />
              </div>
              <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                {palette.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Editors — all sections in one card */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4 space-y-5">
        {colorSections.map((section, si) => (
          <div key={section.title}>
            {si > 0 && <div className="border-t border-slate-800 mb-4" />}
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{section.title}</h4>
            <div className="space-y-3">
              {section.colors.map((colorConfig) => (
                <div key={colorConfig.key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors[colorConfig.key]}
                    onChange={(e) => updateColor(colorConfig.key, e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-700 hover:border-slate-600 transition-colors flex-shrink-0"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <label className="text-sm text-slate-300">{colorConfig.label}</label>
                    <input
                      type="text"
                      value={colors[colorConfig.key]}
                      onChange={(e) => updateColor(colorConfig.key, e.target.value)}
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-mono text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Preview</h4>
        <div className="bg-white p-4 rounded-lg space-y-3">
          {/* Header with primary color */}
          <div
            className="p-3 rounded-lg text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <h3 className="font-bold">Primary Color</h3>
          </div>

          {/* Content area */}
          <div style={{ color: colors.text }}>
            <h4 className="font-semibold mb-1" style={{ fontSize: 15 }}>Document Title</h4>
            <p style={{ color: colors.textLight, fontSize: 13 }} className="mb-3">
              Secondary text color
            </p>
            
            {/* Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: colors.primary }}>Primary</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: colors.secondary }}>Secondary</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: colors.accent }}>Accent</button>
            </div>
          </div>

          {/* Table preview */}
          <div className="border rounded-lg overflow-hidden text-sm" style={{ borderColor: colors.border }}>
            <div className="px-3 py-1.5 font-medium" style={{ backgroundColor: colors.secondary, color: 'white' }}>Table Header</div>
            <div className="px-3 py-1.5" style={{ color: colors.text }}>Row content</div>
            <div className="px-3 py-1.5 border-t flex justify-between" style={{ borderColor: colors.border, color: colors.text }}>
              <span style={{ color: colors.textLight }}>Subtotal</span>
              <span className="font-bold" style={{ color: colors.accent }}>$1,234.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
