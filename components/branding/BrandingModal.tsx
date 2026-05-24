'use client'

import { useState } from 'react'
import BrandIdentityEditor from './BrandIdentityEditor'
import ColorPaletteEditor from './ColorPaletteEditor'
import TypographyEditor from './TypographyEditor'
import AssetGeneratorPanel from './AssetGeneratorPanel'
import { useBrandingStore } from '@/store/brandingStore'

interface BrandingModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'identity' | 'colors' | 'typography' | 'assets' | 'export'

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'identity',
    label: 'Brand Identity',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'colors',
    label: 'Colors',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 'typography',
    label: 'Typography',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
      </svg>
    ),
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'export',
    label: 'Export',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
]

function ExportTab() {
  const { getDefaultPreset } = useBrandingStore()
  const preset = getDefaultPreset()
  const [copied, setCopied] = useState<string | null>(null)

  const cssVars = `/* ${preset.name} — Brand CSS Variables */
:root {
  --brand-primary:     ${preset.colors.primary};
  --brand-secondary:   ${preset.colors.secondary};
  --brand-accent:      ${preset.colors.accent};
  --brand-background:  ${preset.colors.background};
  --brand-text:        ${preset.colors.text};
  --brand-text-light:  ${preset.colors.textLight};
  --brand-border:      ${preset.colors.border};
  --brand-font:        ${preset.fontFamily}, sans-serif;
  --brand-size-title:  ${preset.fontSize.title}pt;
  --brand-size-heading:${preset.fontSize.heading}pt;
  --brand-size-body:   ${preset.fontSize.body}pt;
  --brand-size-small:  ${preset.fontSize.small}pt;
}`

  const tailwindConfig = `// tailwind.config extend
colors: {
  brand: {
    primary:    '${preset.colors.primary}',
    secondary:  '${preset.colors.secondary}',
    accent:     '${preset.colors.accent}',
    background: '${preset.colors.background}',
    text:       '${preset.colors.text}',
    border:     '${preset.colors.border}',
  }
}`

  const jsonTokens = JSON.stringify({
    colors: preset.colors,
    typography: {
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
    },
    business: {
      name: preset.businessName,
      email: preset.businessEmail,
      phone: preset.businessPhone,
      website: preset.businessWebsite,
    }
  }, null, 2)

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const blocks = [
    { key: 'css', label: 'CSS Variables', lang: 'css', content: cssVars },
    { key: 'tailwind', label: 'Tailwind Config', lang: 'js', content: tailwindConfig },
    { key: 'json', label: 'JSON Tokens', lang: 'json', content: jsonTokens },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Export Design Tokens</h3>
        <p className="text-slate-400 text-sm">
          Copy your brand tokens into any project — CSS, Tailwind, or JSON.
        </p>
      </div>

      {blocks.map(({ key, label, lang, content }) => (
        <div key={key} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{lang}</span>
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
            <button
              onClick={() => copy(key, content)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium"
            >
              {copied === key ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
            {content}
          </pre>
        </div>
      ))}
    </div>
  )
}

export default function BrandingModal({ isOpen, onClose }: BrandingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identity')
  const { presets } = useBrandingStore()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Branding Studio
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Create and manage your brand identity
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'identity' && <BrandIdentityEditor />}
            {activeTab === 'typography' && <TypographyEditor />}
            {activeTab === 'colors' && <ColorPaletteEditor />}
            {activeTab === 'assets' && <AssetGeneratorPanel onClose={onClose} />}
            {activeTab === 'export' && <ExportTab />}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
            <div className="text-xs text-slate-500">
              {presets.length} preset{presets.length !== 1 ? 's' : ''} configured
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


interface BrandingModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'identity' | 'colors' | 'typography' | 'assets' | 'export'

export default function BrandingModal({ isOpen, onClose }: BrandingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('identity')
  const { presets, getDefaultPreset } = useBrandingStore()
  
  const currentBrand = getDefaultPreset()

  if (!isOpen) return null

  const tabs = [
    { id: 'identity' as TabType, label: 'Brand Identity', icon: '🎨' },
    { id: 'colors' as TabType, label: 'Colors', icon: '🌈' },
    { id: 'typography' as TabType, label: 'Typography', icon: '📝' },
    { id: 'assets' as TabType, label: 'Assets', icon: '✨' },
    { id: 'export' as TabType, label: 'Export', icon: '📦' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">🎨</span>
                  Branding Studio
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Create and manage your brand identity
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                aria-label="Close"
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

            {/* Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'identity' && <BrandIdentityEditor />}
            {activeTab === 'typography' && <TypographyEditor />}
            {activeTab === 'colors' && <ColorPaletteEditor />}
            {activeTab === 'assets' && <AssetGeneratorPanel onClose={onClose} />}
            {activeTab === 'export' && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">Coming soon: Export design tokens</p>
                <p className="text-slate-500 text-sm mt-2">
                  Export as CSS, Tailwind, JSON, SCSS, or Figma tokens
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
            <div className="text-xs text-slate-500">
              {presets.length} preset{presets.length !== 1 ? 's' : ''} configured
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
