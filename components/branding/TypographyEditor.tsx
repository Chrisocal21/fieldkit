'use client'

import { useState } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

type FontFamily = 'Helvetica' | 'Times' | 'Courier' | 'Georgia' | 'Arial'

export default function TypographyEditor() {
  const { getDefaultPreset, updatePreset } = useBrandingStore()
  const currentPreset = getDefaultPreset()
  
  const [fontFamily, setFontFamily] = useState<FontFamily>(currentPreset.fontFamily)
  const [fontSize, setFontSize] = useState(currentPreset.fontSize)

  const handleFontFamilyChange = (family: FontFamily) => {
    setFontFamily(family)
    updatePreset(currentPreset.id, { fontFamily: family })
  }

  const handleFontSizeChange = (key: keyof typeof fontSize, value: number) => {
    const newFontSize = { ...fontSize, [key]: value }
    setFontSize(newFontSize)
    updatePreset(currentPreset.id, { fontSize: newFontSize })
  }

  const fontPairings: {
    personality: string; desc: string; fontFamily: FontFamily
    fontSize: { title: number; heading: number; body: number; small: number }
  }[] = [
    { personality: 'Professional & Clean', desc: 'Trust-building, corporate, organized', fontFamily: 'Arial', fontSize: { title: 22, heading: 12, body: 10, small: 8 } },
    { personality: 'Bold & Impactful',      desc: 'Confident, energetic, stands out',   fontFamily: 'Helvetica', fontSize: { title: 28, heading: 14, body: 11, small: 9 } },
    { personality: 'Classic & Established', desc: 'Heritage, expertise, credibility',   fontFamily: 'Times', fontSize: { title: 22, heading: 12, body: 10, small: 8 } },
    { personality: 'Elegant & Premium',     desc: 'Sophisticated, refined, high-end',   fontFamily: 'Georgia', fontSize: { title: 24, heading: 13, body: 10, small: 8 } },
    { personality: 'Technical & Precise',   desc: 'Detail-oriented, modern, systematic',fontFamily: 'Courier', fontSize: { title: 20, heading: 11, body: 9, small: 7 } },
  ]

  const applyPairing = (p: typeof fontPairings[number]) => {
    setFontFamily(p.fontFamily)
    setFontSize(p.fontSize)
    updatePreset(currentPreset.id, { fontFamily: p.fontFamily, fontSize: p.fontSize })
  }

  const fontFamilies: { value: FontFamily; label: string; description: string; style: string }[] = [
    { 
      value: 'Helvetica', 
      label: 'Helvetica', 
      description: 'Clean, modern sans-serif',
      style: 'font-sans'
    },
    { 
      value: 'Arial', 
      label: 'Arial', 
      description: 'Classic, widely supported',
      style: 'font-sans'
    },
    { 
      value: 'Times', 
      label: 'Times New Roman', 
      description: 'Traditional serif',
      style: 'font-serif'
    },
    { 
      value: 'Georgia', 
      label: 'Georgia', 
      description: 'Elegant serif',
      style: 'font-serif'
    },
    { 
      value: 'Courier', 
      label: 'Courier', 
      description: 'Monospace, technical',
      style: 'font-mono'
    },
  ]

  const fontSizes = [
    { key: 'title' as const, label: 'Title', description: 'Main document title', min: 18, max: 32 },
    { key: 'heading' as const, label: 'Heading', description: 'Section headings', min: 10, max: 20 },
    { key: 'body' as const, label: 'Body', description: 'Normal text', min: 8, max: 14 },
    { key: 'small' as const, label: 'Small', description: 'Fine print', min: 6, max: 10 },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4 py-4 lg:px-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Typography Settings</h3>
        <p className="text-slate-400 text-sm">
          Customize fonts and sizes for your branded documents
        </p>
      </div>

      {/* Font Personality Pairings */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Style Presets</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {fontPairings.map((p) => {
            const active = fontFamily === p.fontFamily
            return (
              <button
                key={p.personality}
                onClick={() => applyPairing(p)}
                className={`text-left p-3 rounded-lg border-2 overflow-hidden transition-all ${
                  active
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${active ? 'text-purple-300' : 'text-white'}`}>{p.personality}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{p.fontFamily} · {p.fontSize.title}/{p.fontSize.body}pt</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Font Family Selection */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Font Family</h4>
        <div className="space-y-1.5">
          {fontFamilies.map((font) => (
            <button
              key={font.value}
              onClick={() => handleFontFamilyChange(font.value)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 transition-all ${
                fontFamily === font.value
                  ? 'border-blue-600 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {fontFamily === font.value ? (
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                  )}
                </div>
                <div className="text-left">
                  <div className={`text-sm font-medium text-white ${font.style}`}>{font.label}</div>
                  <div className="text-xs text-slate-500">{font.description}</div>
                </div>
              </div>
              <div className={`text-lg text-slate-400 ${font.style}`}>Aa</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Scale */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Size Scale</h4>
        <div className="space-y-4">
          {fontSizes.map((size) => (
            <div key={size.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <label className="text-sm font-medium text-slate-300">{size.label}</label>
                  <p className="text-xs text-slate-600">{size.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm font-mono">
                    {fontSize[size.key]}pt
                  </span>
                  <input
                    type="number"
                    value={fontSize[size.key]}
                    onChange={(e) => handleFontSizeChange(size.key, parseInt(e.target.value) || size.min)}
                    min={size.min}
                    max={size.max}
                    className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min={size.min}
                max={size.max}
                value={fontSize[size.key]}
                onChange={(e) => handleFontSizeChange(size.key, parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.5 3.5 0 0112 18.5a3.5 3.5 0 01-2.33-.95L9 17.1" />
            </svg>
          </div>
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white mb-1">Typography Tips</p>
            <ul className="space-y-1 text-slate-400">
              <li>• Use serif fonts (Times, Georgia) for traditional, formal documents</li>
              <li>• Use sans-serif fonts (Helvetica, Arial) for modern, clean look</li>
              <li>• Keep body text between 9-11pt for optimal readability</li>
              <li>• Ensure good contrast between title and body text sizes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
