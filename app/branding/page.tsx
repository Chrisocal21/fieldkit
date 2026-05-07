'use client'

import { useState } from 'react'
import { useBrandingStore } from '@/store/brandingStore'
import BrandIdentityEditor from '@/components/branding/BrandIdentityEditor'
import ColorPaletteEditor from '@/components/branding/ColorPaletteEditor'
import TypographyEditor from '@/components/branding/TypographyEditor'
import EmailSignatureGenerator from '@/components/branding/generators/EmailSignatureGenerator'
import SocialMediaGenerator from '@/components/branding/generators/SocialMediaGenerator'
import LetterheadGenerator from '@/components/branding/generators/LetterheadGenerator'
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

export default function BrandingStudioPage() {
  const router = useRouter()
  const [activeTool, setActiveTool] = useState<BrandingTool>('identity')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const getDefaultPreset = useBrandingStore(state => state.getDefaultPreset)
  const currentPreset = getDefaultPreset()

  const tools = [
    {
      id: 'identity' as BrandingTool,
      name: 'Brand Identity',
      icon: '🎨',
      category: 'Foundation'
    },
    {
      id: 'colors' as BrandingTool,
      name: 'Color Palette',
      icon: '🎨',
      category: 'Foundation'
    },
    {
      id: 'typography' as BrandingTool,
      name: 'Typography',
      icon: '📝',
      category: 'Foundation'
    },
    {
      id: 'email-signature' as BrandingTool,
      name: 'Email Signature',
      icon: '✉️',
      category: 'Assets'
    },
    {
      id: 'social-media' as BrandingTool,
      name: 'Social Graphics',
      icon: '📱',
      category: 'Assets'
    },
    {
      id: 'letterhead' as BrandingTool,
      name: 'Letterhead',
      icon: '📄',
      category: 'Assets'
    },
    {
      id: 'business-card' as BrandingTool,
      name: 'Business Card',
      icon: '💼',
      category: 'Assets',
      comingSoon: true
    },
    {
      id: 'qr-code' as BrandingTool,
      name: 'QR Code',
      icon: '📲',
      category: 'Assets',
      comingSoon: true
    }
  ]

  const categories = Array.from(new Set(tools.map(t => t.category)))

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
      default:
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
              <span className="text-xl">🎨</span>
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
                  {tools.filter(t => t.category === category).map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (!tool.comingSoon) {
                          setActiveTool(tool.id)
                          // Close sidebar on mobile after selection
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false)
                          }
                        }
                      }}
                      disabled={tool.comingSoon}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${activeTool === tool.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : tool.comingSoon
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      <span className="text-xl">{tool.icon}</span>
                      <span className="flex-1 text-left font-medium text-sm">{tool.name}</span>
                      {tool.comingSoon && (
                        <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                          Soon
                        </span>
                      )}
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
                💡 Changes are saved automatically
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
