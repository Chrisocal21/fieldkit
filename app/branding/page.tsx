'use client'

import { useState, useEffect } from 'react'
import { useBrandingStore } from '@/store/brandingStore'
import BrandIdentityEditor from '@/components/branding/BrandIdentityEditor'
import ColorPaletteEditor from '@/components/branding/ColorPaletteEditor'
import TypographyEditor from '@/components/branding/TypographyEditor'
import EmailSignatureGenerator from '@/components/branding/generators/EmailSignatureGenerator'
import LetterheadGenerator from '@/components/branding/generators/LetterheadGenerator'
import BusinessCardGeneratorModal from '@/components/shared/BusinessCardGeneratorModal'
import QRCodeGeneratorModal from '@/components/shared/QRCodeGeneratorModal'
import DocumentStyleEditor from '@/components/branding/DocumentStyleEditor'
import BrandDocPreview from '@/components/branding/BrandDocPreview'
import { useRouter } from 'next/navigation'
import { BrandingPreset } from '@/store/brandingStore'
import { useSettingsStore } from '@/store/settingsStore'

function calcBrandHealth(p: BrandingPreset) {
  const checks = [
    { label: 'Logo uploaded',  done: !!p.logoUrl },
    { label: 'Business name',  done: !!(p.businessName?.trim()) },
    { label: 'Contact info',   done: !!(p.businessEmail || p.businessPhone) },
    { label: 'Brand voice',    done: !!(p.brandVoice?.trim()) },
    { label: 'Custom colors',  done: p.colors.primary !== '#1e40af' },
    { label: 'Terms set',      done: !!(p.termsAndConditions?.trim()) },
    { label: 'Document style', done: p.headerStyle !== undefined && p.headerStyle !== 'standard' },
  ]
  const done = checks.filter(c => c.done).length
  return { score: Math.round((done / checks.length) * 100), checks, done, total: checks.length }
}

function exportBrandKit(preset: BrandingPreset) {
  const hex2rgb = (h: string) => {
    const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16)
    return `rgb(${r},${g},${b})`
  }
  const cssVars = `:root {\n  --brand-primary: ${preset.colors.primary};\n  --brand-secondary: ${preset.colors.secondary};\n  --brand-accent: ${preset.colors.accent};\n  --brand-text: ${preset.colors.text};\n  --brand-text-light: ${preset.colors.textLight};\n  --brand-bg: ${preset.colors.background};\n  --brand-border: ${preset.colors.border};\n  --brand-font: "${preset.fontFamily}", sans-serif;\n}`
  const kit = {
    exportedAt: new Date().toISOString(),
    brand: {
      name: preset.businessName || '', tagline: preset.footerText || '',
      voice: preset.brandVoice || '', website: preset.businessWebsite || '',
      email: preset.businessEmail || '', phone: preset.businessPhone || '',
      address: preset.businessAddress || '',
    },
    colors: Object.fromEntries(Object.entries(preset.colors).map(([k,v]) => [k, { hex: v, rgb: hex2rgb(v) }])),
    typography: { fontFamily: preset.fontFamily, sizes: preset.fontSize },
    documents: {
      quoteLabel: preset.quoteLabel || 'QUOTE', invoiceLabel: preset.invoiceLabel || 'INVOICE',
      headerStyle: preset.headerStyle || 'standard',
      termsAndConditions: preset.termsAndConditions || '', introMessage: preset.introMessage || '',
    },
    cssVariables: cssVars,
  }
  const blob = new Blob([JSON.stringify(kit, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(preset.businessName || 'brand').toLowerCase().replace(/\s+/g,'-')}-brand-kit.json`
  a.click()
  URL.revokeObjectURL(url)
}

type BrandingTool =
  | 'documents'
  | 'identity'
  | 'colors'
  | 'typography'
  | 'email-signature'
  | 'letterhead'
  | 'business-card'
  | 'qr-code'

const toolIcons: Record<BrandingTool, React.ReactNode> = {
  'documents': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  'identity': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  'colors': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  'typography': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  ),
  'email-signature': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'letterhead': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  'business-card': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
  ),
  'qr-code': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
}

const toolList: { id: BrandingTool; name: string; category: string }[] = [
  { id: 'identity',        name: 'Business Info',   category: 'Your Brand' },
  { id: 'colors',          name: 'Brand Colors',    category: 'Your Brand' },
  { id: 'typography',      name: 'Font & Text',     category: 'Your Brand' },
  { id: 'documents',       name: 'Document Style',  category: 'Documents' },
  { id: 'email-signature', name: 'Email Signature', category: 'Download' },
  { id: 'letterhead',      name: 'Letterhead',      category: 'Download' },
  { id: 'business-card',   name: 'Business Card',   category: 'Download' },
  { id: 'qr-code',         name: 'QR Code',         category: 'Download' },
]

export default function BrandingStudioPage() {
  const router = useRouter()
  const [activeTool, setActiveTool] = useState<BrandingTool>('identity')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [previewPresetId, setPreviewPresetId] = useState<string | null>(null)
  // Defer store-derived values so SSR and client render the same initial HTML
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const getDefaultPreset = useBrandingStore(state => state.getDefaultPreset)
  const sidebarCollapsed = useSettingsStore(s => s.sidebarCollapsed)
  const currentPreset = getDefaultPreset()
  const health = calcBrandHealth(currentPreset)

  const categories = Array.from(new Set(toolList.map(t => t.category)))

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'documents':
        return (
          <div className="h-full overflow-auto">
            <DocumentStyleEditor onPreviewChange={setPreviewPresetId} />
          </div>
        )
      case 'identity':
        return (
          <div className="h-full overflow-auto">
            <BrandIdentityEditor />
          </div>
        )
      case 'colors':
        return (
          <div className="h-full overflow-auto">
            <ColorPaletteEditor />
          </div>
        )
      case 'typography':
        return (
          <div className="h-full overflow-auto">
            <TypographyEditor />
          </div>
        )
      case 'email-signature':
        return <EmailSignatureGenerator onClose={() => setActiveTool('documents')} isEmbedded />
      case 'letterhead':
        return <LetterheadGenerator onClose={() => setActiveTool('documents')} isEmbedded />
      case 'business-card':
        return (
          <div className="h-full overflow-auto">
            <BusinessCardGeneratorModal isOpen onClose={() => setActiveTool('documents')} />
          </div>
        )
      case 'qr-code':
        return (
          <div className="h-full overflow-auto">
            <QRCodeGeneratorModal isOpen onClose={() => setActiveTool('documents')} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`fixed inset-0 bg-slate-950 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'}`}>
      {/* Top Bar */}
      <div className="flex-shrink-0 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 z-30">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Branding Studio</h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {mounted ? (currentPreset.businessName || 'Your Brand') : 'Your Brand'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBrandKit(currentPreset)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Kit
          </button>
          <button
            onClick={() => setMobilePreviewOpen(v => !v)}
            className={`lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mobilePreviewOpen
                ? 'bg-slate-700 text-white ring-1 ring-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {mobilePreviewOpen ? 'Hide' : 'Preview'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative top-16 bottom-0 lg:top-0 left-0 z-20
            w-64
            bg-slate-900/95 backdrop-blur-xl border-r border-slate-800
            transition-transform duration-300 ease-in-out
            flex flex-col
          `}
        >
          {/* Sidebar Header */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tools
            </h2>
          </div>

          {/* Tools List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                  {category}
                </h3>
                <div className="space-y-1">
                  {toolList.filter(t => t.category === category).map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTool(tool.id)
                        if (tool.id !== 'documents') setPreviewPresetId(null)
                        if (window.innerWidth < 1024) setSidebarOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all
                        ${activeTool === tool.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      {toolIcons[tool.id]}
                      <span className="flex-1 text-left font-medium text-sm">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer — Brand Health Score */}
          <div className="flex-shrink-0 p-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Brand Health</span>
              <span className={`text-xs font-bold ${
                health.score >= 80 ? 'text-emerald-400' : health.score >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>{mounted ? health.score : 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  health.score >= 80 ? 'bg-emerald-500' : health.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${mounted ? health.score : 0}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Workspace */}
        <main className="flex-1 overflow-hidden bg-slate-950 flex relative">
          <div className={`flex-1 overflow-hidden ${mobilePreviewOpen ? 'hidden' : ''} lg:block`}>
            {renderActiveTool()}
          </div>
          <div className={`${
            mobilePreviewOpen ? 'absolute inset-0' : 'hidden'
          } lg:relative lg:inset-auto lg:block lg:w-[560px] xl:w-[720px] lg:flex-shrink-0`}>
            <BrandDocPreview previewPresetId={previewPresetId} />
          </div>
        </main>
      </div>
    </div>
  )
}
