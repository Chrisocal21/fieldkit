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

const generators = [
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Create professional business cards with your brand',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    id: 'qr-code',
    name: 'QR Code',
    description: 'Generate branded QR codes for marketing',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    id: 'email-signature',
    name: 'Email Signature',
    description: 'HTML email signature for Gmail, Outlook',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'letterhead',
    name: 'Letterhead',
    description: 'Professional letterhead template',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'social-media',
    name: 'Social Media Graphics',
    description: 'Create covers for LinkedIn, Facebook, Twitter',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
]

export default function AssetGeneratorPanel({ onClose }: AssetGeneratorPanelProps) {
  const [showBusinessCard, setShowBusinessCard] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showEmailSignature, setShowEmailSignature] = useState(false)
  const [showSocialMedia, setShowSocialMedia] = useState(false)
  const [showLetterhead, setShowLetterhead] = useState(false)

  const getOnClick = (id: string) => {
    switch (id) {
      case 'business-card': return () => setShowBusinessCard(true)
      case 'qr-code': return () => setShowQRCode(true)
      case 'email-signature': return () => setShowEmailSignature(true)
      case 'letterhead': return () => setShowLetterhead(true)
      case 'social-media': return () => setShowSocialMedia(true)
      default: return undefined
    }
  }

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
              onClick={getOnClick(generator.id)}
              className="group relative p-6 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl text-left transition-all hover:border-blue-500 hover:bg-slate-900 cursor-pointer transform hover:scale-[1.02]"
            >
              {/* Icon */}
              <div className="mb-3 text-blue-400 group-hover:text-blue-300 transition-colors">
                {generator.icon}
              </div>

              {/* Content */}
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {generator.name}
              </h4>
              <p className="text-sm text-slate-400">
                {generator.description}
              </p>

              {/* Arrow indicator */}
              <div className="mt-4 flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Create now</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.5 3.5 0 0112 18.5a3.5 3.5 0 01-2.33-.95L9 17.1" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Pro Tips</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>â€¢ Complete your brand identity before generating assets</li>
                <li>â€¢ Upload a high-quality logo for the best results</li>
                <li>â€¢ Customize your color palette to match your brand</li>
                <li>â€¢ Generate multiple variations and pick your favorite</li>
              </ul>
            </div>
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
