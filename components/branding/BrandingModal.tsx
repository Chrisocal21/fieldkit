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
