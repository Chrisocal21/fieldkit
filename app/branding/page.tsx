'use client'

import { useState } from 'react'
import { useBrandingStore } from '@/store/brandingStore'
import BrandIdentityEditor from '@/components/branding/BrandIdentityEditor'
import ColorPaletteEditor from '@/components/branding/ColorPaletteEditor'
import TypographyEditor from '@/components/branding/TypographyEditor'
import EmailSignatureGenerator from '@/components/branding/generators/EmailSignatureGenerator'
import SocialMediaGenerator from '@/components/branding/generators/SocialMediaGenerator'
import LetterheadGenerator from '@/components/branding/generators/LetterheadGenerator'
import BusinessCardGeneratorModal from '@/components/shared/BusinessCardGeneratorModal'
import QRCodeGeneratorModal from '@/components/shared/QRCodeGeneratorModal'
import { useRouter } from 'next/navigation'

type BrandingTool =
  | 'identity'
  | 'colors'
  | 'typography'
  | 'email-signature'
  | 'social-media'
  | 'letterhead'
  | 'business-card'
  | 'qr-code'

const toolIcons: Record<BrandingTool, React.ReactNode> = {
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
  'social-media': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
  { id: 'identity',        name: 'Brand Identity',  category: 'Foundation' },
  { id: 'colors',          name: 'Color Palette',   category: 'Foundation' },
  { id: 'typography',      name: 'Typography',      category: 'Foundation' },
  { id: 'email-signature', name: 'Email Signature', category: 'Assets' },
  { id: 'social-media',    name: 'Social Graphics', category: 'Assets' },
  { id: 'letterhead',      name: 'Letterhead',      category: 'Assets' },
  { id: 'business-card',   name: 'Business Card',   category: 'Assets' },
  { id: 'qr-code',         name: 'QR Code',         category: 'Assets' },
]

export default function BrandingStudioPage() {
  const router = useRouter()
  const [activeTool, setActiveTool] = useState<BrandingTool>('identity')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const getDefaultPreset = useBrandingStore(state => state.getDefaultPreset)
  const currentPreset = getDefaultPreset()

  const categories = Array.from(new Set(toolList.map(t => t.category)))

  const renderActiveTool = () => {
    switch (activeTool) {
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
        return <EmailSignatureGenerator onClose={() => setActiveTool('identity')} isEmbedded />
      case 'social-media':
        return <SocialMediaGenerator onClose={() => setActiveTool('identity')} isEmbedded />
      case 'letterhead':
        return <LetterheadGenerator onClose={() => setActiveTool('identity')} isEmbedded />
      case 'business-card':
        return (
          <div className="h-full overflow-auto">
            <BusinessCardGeneratorModal isOpen onClose={() => setActiveTool('identity')} />
          </div>
        )
      case 'qr-code':
        return (
          <div className="h-full overflow-auto">
            <QRCodeGeneratorModal isOpen onClose={() => setActiveTool('identity')} />
          </div>
        )
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl mb-2">🚧</p>
              <p className="text-slate-400">Coming Soon</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col">
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
                {currentPreset.businessName || 'Your Brand'}
              </p>
            </div>
          </div>
        </div>

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

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative inset-y-16 left-0 z-20
            w-72 lg:w-80
            bg-slate-900/95 backdrop-blur-xl border-r border-slate-800
            transition-transform duration-300 ease-in-out
            flex flex-col
          `}
        >
          {/* Sidebar Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
              Tools
            </h2>
          </div>

          {/* Tools List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                        if (window.innerWidth < 1024) setSidebarOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${activeTool === tool.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 p-4 border-t border-slate-800">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-slate-400">
                Changes are saved automatically
              </p>
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
        <main className="flex-1 overflow-hidden bg-slate-950">
          {renderActiveTool()}
        </main>
      </div>
    </div>
  )
}
