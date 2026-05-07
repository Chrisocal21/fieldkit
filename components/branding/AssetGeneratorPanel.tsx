'use client'

import { useState } from 'react'
import BusinessCardGeneratorModal from '../shared/BusinessCardGeneratorModal'
import QRCodeGeneratorModal from '../shared/QRCodeGeneratorModal'
import EmailSignatureGenerator from './generators/EmailSignatureGenerator'
import SocialMediaGenerator from './generators/SocialMediaGenerator'
import LetterheadGenerator from './generators/LetterheadGenerator'

interface AssetGeneratorPanelProps {
  onClose: () => void
}

export default function AssetGeneratorPanel({ onClose }: AssetGeneratorPanelProps) {
  const [showBusinessCard, setShowBusinessCard] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showEmailSignature, setShowEmailSignature] = useState(false)
  const [showSocialMedia, setShowSocialMedia] = useState(false)
  const [showLetterhead, setShowLetterhead] = useState(false)

  const generators = [
    {
      id: 'business-card',
      name: 'Business Card',
      description: 'Create professional business cards with your brand',
      icon: '💼',
      available: true,
      onClick: () => setShowBusinessCard(true)
    },
    {
      id: 'qr-code',
      name: 'QR Code',
      description: 'Generate branded QR codes for marketing',
      icon: '📱',
      available: true,
      onClick: () => setShowQRCode(true)
    },
    {
      id: 'email-signature',
      name: 'Email Signature',
      description: 'HTML email signature for Gmail, Outlook',
      icon: '✉️',
      available: true,
      onClick: () => setShowEmailSignature(true)
    },
    {
      id: 'letterhead',
      name: 'Letterhead',
      description: 'Professional letterhead template',
      icon: '📄',
      available: true,
      onClick: () => setShowLetterhead(true)
    },
    {
      id: 'social-media',
      name: 'Social Media Graphics',
      description: 'Create covers for LinkedIn, Facebook, Twitter',
      icon: '🎨',
      available: true,
      onClick: () => setShowSocialMedia(true)
    },
    {
      id: 'invoice-header',
      name: 'Invoice Header',
      description: 'Branded invoice and quote headers',
      icon: '🧾',
      available: false,
      badge: 'Coming Soon'
    }
  ]

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Generate Assets</h3>
          <p className="text-slate-400 text-sm">
            Create branded marketing materials and business assets
          </p>
        </div>

        {/* Generator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generators.map((generator) => (
            <button
              key={generator.id}
              onClick={generator.available ? generator.onClick : undefined}
              disabled={!generator.available}
              className={`group relative p-6 bg-slate-900/50 backdrop-blur border rounded-xl text-left transition-all ${
                generator.available
                  ? 'border-slate-800 hover:border-blue-500 hover:bg-slate-900 cursor-pointer transform hover:scale-[1.02]'
                  : 'border-slate-800 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Badge */}
              {generator.badge && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">
                    {generator.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="text-4xl mb-3">{generator.icon}</div>

              {/* Content */}
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {generator.name}
              </h4>
              <p className="text-sm text-slate-400">
                {generator.description}
              </p>

              {/* Arrow indicator for available items */}
              {generator.available && (
                <div className="mt-4 flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Create now</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">💡</div>
            <div>
              <h4 className="text-white font-semibold mb-2">Pro Tips</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Make sure your brand identity is complete before generating assets</li>
                <li>• Upload a high-quality logo for the best results</li>
                <li>• Customize your color palette to match your brand</li>
                <li>• Generate multiple variations and pick your favorite</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Assets (Placeholder) */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Recent Assets</h4>
          <div className="text-center py-8">
            <div className="text-5xl mb-3">📁</div>
            <p className="text-slate-400">No assets generated yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Start creating branded assets with the generators above
            </p>
          </div>
        </div>
      </div>

      {/* Generator Modals */}
      <BusinessCardGeneratorModal
        isOpen={showBusinessCard}
        onClose={() => setShowBusinessCard(false)}
      />
      <QRCodeGeneratorModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
      />
      <EmailSignatureGenerator
        isOpen={showEmailSignature}
        onClose={() => setShowEmailSignature(false)}
      />
      <SocialMediaGenerator
        isOpen={showSocialMedia}
        onClose={() => setShowSocialMedia(false)}
      />
      <LetterheadGenerator
        isOpen={showLetterhead}
        onClose={() => setShowLetterhead(false)}
      />
    </>
  )
}
