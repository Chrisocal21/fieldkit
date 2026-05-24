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
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-4 lg:px-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Color Palette</h3>
        <p className="text-slate-400 text-sm">
          Customize your brand colors for documents and assets
        </p>
      </div>

      {/* Preset Palettes */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => applyPresetPalette(palette.colors)}
              className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg transition-all"
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

      {/* Color Editors */}
      {colorSections.map((section) => (
        <div key={section.title} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">{section.title}</h4>
          <div className="space-y-4">
            {section.colors.map((colorConfig) => (
              <div key={colorConfig.key} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <input
                    type="color"
                    value={colors[colorConfig.key]}
                    onChange={(e) => updateColor(colorConfig.key, e.target.value)}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-700 hover:border-slate-600 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-slate-300">
                      {colorConfig.label}
                    </label>
                    <input
                      type="text"
                      value={colors[colorConfig.key]}
                      onChange={(e) => updateColor(colorConfig.key, e.target.value)}
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs font-mono text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500">{colorConfig.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Preview Section */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Color Preview</h4>
        <div className="bg-white p-6 rounded-lg space-y-4">
          {/* Header with primary color */}
          <div
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: colors.primary }}
          >
            <h3 className="text-xl font-bold">Primary Color Header</h3>
            <p className="text-sm opacity-90">This is how your primary color looks</p>
          </div>

          {/* Content area */}
          <div style={{ color: colors.text }}>
            <h4 className="text-lg font-semibold mb-2">Document Title</h4>
            <p style={{ color: colors.textLight }} className="text-sm mb-4">
              This is secondary text that provides additional information
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: colors.secondary }}
              >
                Secondary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: colors.accent }}
              >
                Accent Button
              </button>
            </div>
          </div>

          {/* Table preview */}
          <div
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: colors.border }}
          >
            <div
              className="px-4 py-2 font-medium"
              style={{ backgroundColor: colors.secondary, color: 'white' }}
            >
              Table Header
            </div>
            <div className="px-4 py-2" style={{ color: colors.text }}>
              Table content with primary text
            </div>
            <div
              className="px-4 py-2 border-t"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              <span style={{ color: colors.textLight }}>Subtotal:</span>{' '}
              <span className="font-bold" style={{ color: colors.accent }}>
                $1,234.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
