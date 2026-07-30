'use client'

import { useState } from 'react'
import { useBrandingStore } from '@/store/brandingStore'
import { Quote } from '@/store/quoteStore'
import QuotePreview from '@/components/quotes/QuotePreview'

// Mock quote used purely to drive the preview — same Quote shape real quotes
// and invoices use (invoices in this app are rendered from their originating
// Quote with a relabeled title, so one mock document covers both).
const MOCK_QUOTE: Quote = {
  id: 'preview-doc',
  quoteNumber: 42,
  jobId: 'preview-job',
  clientName: 'Alex Thompson',
  clientEmail: 'alex@example.com',
  clientPhone: '(503) 555-0142',
  notes: '',
  taxRate: 0.08,
  status: 'Sent',
  lineItems: [
    { id: 'i1', quoteId: 'preview-doc', description: 'Interior Painting — Living Room & Hallway', quantity: 1, unitPrice: 1200, type: 'labor', sortOrder: 0 },
    { id: 'i2', quoteId: 'preview-doc', description: 'Premium Paint & Primer (3 gal)', quantity: 3, unitPrice: 68, type: 'material', sortOrder: 1 },
    { id: 'i3', quoteId: 'preview-doc', description: 'Tape, drop cloths & rollers', quantity: 1, unitPrice: 45, type: 'material', sortOrder: 2 },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export default function BrandDocPreview() {
  const preset = useBrandingStore((s) => s.getDefaultPreset())
  const [docMode, setDocMode] = useState<'quote' | 'invoice'>('quote')

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800">
      {/* Panel header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Live Preview
        </span>
        <div className="flex items-center gap-0.5 bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setDocMode('quote')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              docMode === 'quote' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >Quote</button>
          <button
            onClick={() => setDocMode('invoice')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              docMode === 'invoice' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >Invoice</button>
        </div>
      </div>

      {/* Scrollable document — renders the exact same component real quotes and
          invoices use, so this preview can never drift from what clients actually see. */}
      <div className="flex-1 overflow-auto p-4 bg-slate-900/30">
        <div className="origin-top" style={{ zoom: 0.65 }}>
          <QuotePreview quote={MOCK_QUOTE} presetId={preset.id} mode={docMode} hideControls />
        </div>
      </div>
    </div>
  )
}
