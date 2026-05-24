'use client'

import { useState, useRef } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

interface EmailSignatureGeneratorProps {
  isOpen?: boolean
  onClose: () => void
  isEmbedded?: boolean
}

type LayoutType = 'minimal' | 'professional' | 'creative'

export default function EmailSignatureGenerator({ isOpen, onClose, isEmbedded = false }: EmailSignatureGeneratorProps) {
  if (!isEmbedded && !isOpen) return null
  
  const { getDefaultPreset } = useBrandingStore()
  const currentPreset = getDefaultPreset()
  
  const [layout, setLayout] = useState<LayoutType>('professional')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState(currentPreset.businessEmail || '')
  const [phone, setPhone] = useState(currentPreset.businessPhone || '')
  const [website, setWebsite] = useState(currentPreset.businessWebsite || '')
  const [includeAddress, setIncludeAddress] = useState(false)
  const [includeSocial, setIncludeSocial] = useState(false)
  const [linkedIn, setLinkedIn] = useState('')
  const [twitter, setTwitter] = useState('')
  const [copied, setCopied] = useState(false)
  
  const signatureRef = useRef<HTMLDivElement>(null)

  const generateHTML = () => {
    const html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">
  <tr>
    <td style="padding-right: 20px; ${layout === 'minimal' ? 'border-right: 2px solid ' + currentPreset.colors.primary + '; padding-right: 15px;' : ''}">
      ${currentPreset.logoUrl && layout !== 'minimal' ? `<img src="${currentPreset.logoUrl}" alt="${currentPreset.businessName || 'Logo'}" style="max-width: 120px; max-height: 60px; display: block; margin-bottom: 10px;" />` : ''}
    </td>
    <td>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-bottom: 5px;">
            <strong style="font-size: 16px; color: ${currentPreset.colors.primary};">${name || 'Your Name'}</strong>
          </td>
        </tr>
        ${title ? `<tr><td style="padding-bottom: 8px; color: ${currentPreset.colors.textLight}; font-size: 13px;">${title}</td></tr>` : ''}
        ${currentPreset.businessName ? `<tr><td style="padding-bottom: 10px; font-weight: 600;">${currentPreset.businessName}</td></tr>` : ''}
        ${email ? `<tr><td style="padding-bottom: 3px;"><a href="mailto:${email}" style="color: ${currentPreset.colors.text}; text-decoration: none;">📧 ${email}</a></td></tr>` : ''}
        ${phone ? `<tr><td style="padding-bottom: 3px;"><a href="tel:${phone}" style="color: ${currentPreset.colors.text}; text-decoration: none;">📞 ${phone}</a></td></tr>` : ''}
        ${website ? `<tr><td style="padding-bottom: 3px;"><a href="${website}" style="color: ${currentPreset.colors.primary}; text-decoration: none;">🌐 ${website.replace(/^https?:\/\//, '')}</a></td></tr>` : ''}
        ${includeAddress && currentPreset.businessAddress ? `<tr><td style="padding-bottom: 3px; font-size: 12px; color: ${currentPreset.colors.textLight};">📍 ${currentPreset.businessAddress.replace(/\n/g, ', ')}</td></tr>` : ''}
        ${includeSocial && (linkedIn || twitter) ? `
        <tr>
          <td style="padding-top: 10px;">
            ${linkedIn ? `<a href="${linkedIn}" style="display: inline-block; margin-right: 8px;"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" style="height: 20px;" /></a>` : ''}
            ${twitter ? `<a href="${twitter}" style="display: inline-block;"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=flat&logo=twitter&logoColor=white" alt="Twitter" style="height: 20px;" /></a>` : ''}
          </td>
        </tr>
        ` : ''}
      </table>
    </td>
  </tr>
</table>
    `.trim()
    return html
  }

  const copyToClipboard = async () => {
    const html = generateHTML()
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const renderPreview = () => {
    return (
      <div className="bg-white p-6 rounded-lg">
        <div className="flex gap-5">
          {currentPreset.logoUrl && layout === 'professional' && (
            <div>
              <img
                src={currentPreset.logoUrl}
                alt="Logo"
                className="max-w-[120px] max-h-[60px] mb-3"
              />
            </div>
          )}
          <div className={layout === 'minimal' ? 'border-l-2 pl-4' : ''} style={layout === 'minimal' ? { borderColor: currentPreset.colors.primary } : {}}>
            <div className="text-lg font-bold mb-1" style={{ color: currentPreset.colors.primary }}>
              {name || 'Your Name'}
            </div>
            {title && (
              <div className="text-sm mb-2" style={{ color: currentPreset.colors.textLight }}>
                {title}
              </div>
            )}
            {currentPreset.businessName && (
              <div className="font-semibold mb-2" style={{ color: currentPreset.colors.text }}>
                {currentPreset.businessName}
              </div>
            )}
            <div className="text-sm space-y-1" style={{ color: currentPreset.colors.text }}>
              {email && <div>📧 <a href={`mailto:${email}`} style={{ color: currentPreset.colors.text, textDecoration: 'none' }}>{email}</a></div>}
              {phone && <div>📞 <a href={`tel:${phone}`} style={{ color: currentPreset.colors.text, textDecoration: 'none' }}>{phone}</a></div>}
              {website && <div>🌐 <a href={website} style={{ color: currentPreset.colors.primary, textDecoration: 'none' }}>{website.replace(/^https?:\/\//, '')}</a></div>}
              {includeAddress && currentPreset.businessAddress && (
                <div className="text-xs mt-2" style={{ color: currentPreset.colors.textLight }}>
                  📍 {currentPreset.businessAddress.replace(/\n/g, ', ')}
                </div>
              )}
            </div>
            {includeSocial && (linkedIn || twitter) && (
              <div className="flex gap-2 mt-3">
                {linkedIn && (
                  <a href={linkedIn} className="inline-block">
                    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" className="h-5" />
                  </a>
                )}
                {twitter && (
                  <a href={twitter} className="inline-block">
                    <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=flat&logo=twitter&logoColor=white" alt="Twitter" className="h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isEmbedded && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      )}

      {/* Full Screen Editor */}
      <div className={isEmbedded ? "h-full flex flex-col" : "fixed inset-0 z-50 flex"}>
        {/* Main Preview Area */}
        <div className="flex-1 bg-slate-950 flex flex-col">
          {/* Top Bar */}
          <div className="flex-shrink-0 px-6 py-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>✉️</span>
                  Email Signature
                </h2>
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy HTML
                </>
              )}
            </button>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="bg-white p-12 rounded-lg shadow-2xl border border-slate-700 max-w-2xl">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Controls */}
        <div className="w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Customize</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Layout Selection */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Layout Style</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(['minimal', 'professional', 'creative'] as LayoutType[]).map((layoutType) => (
                      <button
                        key={layoutType}
                        onClick={() => setLayout(layoutType)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                          layout === layoutType
                            ? 'border-blue-600 bg-blue-500/10 text-white'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        {layoutType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Personal Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Your job title"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
                          placeholder="Phone number"
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Sections */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Optional</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAddress}
                        onChange={(e) => setIncludeAddress(e.target.checked)}
                        className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-slate-300">Include business address</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSocial}
                        onChange={(e) => setIncludeSocial(e.target.checked)}
                        className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-slate-300">Include social media links</span>
                    </label>
                    {includeSocial && (
                      <div className="ml-8 space-y-3 pt-2">
                        <input
                          type="url"
                          value={linkedIn}
                          onChange={(e) => setLinkedIn(e.target.value)}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                        />
                        <input
                          type="url"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          placeholder="https://twitter.com/yourhandle"
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Preview & Export */}
              <div className="space-y-6">
                {/* Preview */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  {renderPreview()}
                </div>

                {/* Export */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Export Signature</h3>
                  <button
                    onClick={copyToClipboard}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy HTML Code
                      </>
                    )}
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">📖</span>
                    How to Use
                  </h4>
                  <div className="text-sm text-slate-300 space-y-3">
                    <div>
                      <p className="font-medium text-white mb-1">Gmail:</p>
                      <p className="text-slate-400 text-xs">Settings → General → Signature → Paste HTML</p>
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Outlook (Desktop):</p>
                      <p className="text-slate-400 text-xs">File → Options → Mail → Signatures → Paste HTML</p>
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Apple Mail:</p>
                      <p className="text-slate-400 text-xs">Mail → Preferences → Signatures → Paste HTML</p>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </>
  )
}
