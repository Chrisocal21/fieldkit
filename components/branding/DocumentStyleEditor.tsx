'use client'

import { useState } from 'react'
import { useBrandingStore, DocumentHeaderStyle, BrandingPreset } from '@/store/brandingStore'

export default function DocumentStyleEditor({ mode }: { mode?: 'quote' | 'invoice' }) {
  const { presets, getDefaultPreset, updatePreset } = useBrandingStore()
  const defaultPreset = getDefaultPreset()
  const [selectedId, setSelectedId] = useState(defaultPreset.id)
  const preset = presets.find((p) => p.id === selectedId) || defaultPreset

  const update = (updates: Partial<BrandingPreset>) => updatePreset(selectedId, updates)

  const inputCls =
    'w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all'

  const QUOTE_LABELS = ['QUOTE', 'ESTIMATE', 'PROPOSAL', 'SCOPE OF WORK']
  const INVOICE_LABELS = ['INVOICE', 'BILL', 'STATEMENT', 'RECEIPT']
  const HEADER_STYLES: { id: DocumentHeaderStyle; label: string; desc: string }[] = [
    { id: 'standard',   label: 'Standard',   desc: 'Classic two-column header' },
    { id: 'banner',     label: 'Banner',     desc: 'Full-width color header bar' },
    { id: 'accent-bar', label: 'Accent Bar', desc: 'Bold left accent stripe' },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-2xl">

      {/* Mode title */}
      {mode && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'quote' ? 'Quote Layout' : 'Invoice Layout'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'quote'
              ? 'Customise how your quotes and estimates look when sent to clients.'
              : 'Customise how your invoices and bills look when sent to clients.'}
          </p>
        </div>
      )}

      {/* Preset selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Editing Preset</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className={inputCls}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.isDefault ? '(Default)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* ── Document Labels ── */}
      <Section title="Document Label" desc={mode === 'quote' ? 'What appears as the title on quotes sent to clients.' : mode === 'invoice' ? 'What appears as the title on invoices sent to clients.' : 'Customize what appears as the document title on quotes and invoices.'}>
        <div className={mode ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
          {/* Quote label — shown when mode is 'quote' or no mode */}
          {(mode !== 'invoice') && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Quote Label</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {QUOTE_LABELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => update({ quoteLabel: l })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      (preset.quoteLabel || 'QUOTE') === l
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={preset.quoteLabel || 'QUOTE'}
                onChange={(e) => update({ quoteLabel: e.target.value.toUpperCase() })}
                placeholder="Custom label..."
                className={inputCls}
              />
            </div>
          </div>
          )}
          {/* Invoice label — shown when mode is 'invoice' or no mode */}
          {(mode !== 'quote') && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Invoice Label</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {INVOICE_LABELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => update({ invoiceLabel: l })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      (preset.invoiceLabel || 'INVOICE') === l
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={preset.invoiceLabel || 'INVOICE'}
                onChange={(e) => update({ invoiceLabel: e.target.value.toUpperCase() })}
                placeholder="Custom label..."
                className={inputCls}
              />
            </div>
          </div>
          )}
        </div>
      </Section>

      {/* ── Header Style ── */}
      <Section title="Header Style" desc="Choose how your company info and document title are laid out at the top.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HEADER_STYLES.map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => update({ headerStyle: id })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                (preset.headerStyle || 'standard') === id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Mini preview */}
              <HeaderStylePreview style={id} color={preset.colors.primary} />
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Intro Message ── */}
      <Section title="Opening Message" desc="A short greeting or description shown at the top of every document, below the header.">
        <textarea
          value={preset.introMessage || ''}
          onChange={(e) => update({ introMessage: e.target.value })}
          placeholder="e.g. Thank you for the opportunity to provide this estimate. We look forward to working with you."
          rows={3}
          className={`${inputCls} resize-none`}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Leave blank to hide this section.</p>
      </Section>

      {/* ── Terms & Conditions ── */}
      <Section title="Terms & Conditions" desc="Payment terms, warranty notes, or any fine print shown at the bottom of documents.">
        <textarea
          value={preset.termsAndConditions || ''}
          onChange={(e) => update({ termsAndConditions: e.target.value })}
          placeholder="e.g. Payment due within 30 days of invoice. A 1.5% monthly finance charge will be applied to overdue balances. All work is guaranteed for 1 year."
          rows={5}
          className={`${inputCls} resize-none`}
        />
      </Section>

      {/* ── Document Options ── */}
      <Section title="Document Options" desc="Toggle optional sections that appear on generated documents.">
        <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <ToggleRow
            label="Signature Line"
            desc='Adds an "Authorized by" signature field at the bottom'
            enabled={preset.showSignatureLine ?? false}
            onChange={(v) => update({ showSignatureLine: v })}
          />
          <ToggleRow
            label="Payment Methods"
            desc="Show accepted payment methods (Venmo, Zelle, etc.)"
            enabled={preset.showPaymentInfo ?? false}
            onChange={(v) => update({ showPaymentInfo: v })}
          />
          <ToggleRow
            label="Table Borders"
            desc="Show grid lines in the line items table"
            enabled={preset.showBorders}
            onChange={(v) => update({ showBorders: v })}
          />
        </div>
      </Section>

      {/* ── Live Preview ── */}
      <Section title="Document Preview" desc="A simplified look at how your document header will appear.">
        <LivePreview preset={preset} mode={mode} />
      </Section>

    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  )
}

function ToggleRow({ label, desc, enabled, onChange }: { label: string; desc: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-900">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-4 w-14 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition duration-200 ${
            enabled ? 'translate-x-9' : 'translate-x-px'
          }`}
        />
      </button>
    </div>
  )
}

function HeaderStylePreview({ style, color }: { style: DocumentHeaderStyle; color: string }) {
  if (style === 'banner') {
    return (
      <div className="w-full h-10 rounded overflow-hidden" style={{ backgroundColor: color }}>
        <div className="flex items-center justify-between h-full px-2">
          <div className="w-8 h-2 bg-white/40 rounded" />
          <div className="w-6 h-2 bg-white/60 rounded" />
        </div>
      </div>
    )
  }
  if (style === 'accent-bar') {
    return (
      <div className="w-full h-10 rounded overflow-hidden border border-gray-100 dark:border-gray-800 flex">
        <div className="w-1.5 h-full rounded-l" style={{ backgroundColor: color }} />
        <div className="flex-1 flex items-center justify-between px-2 bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-2 bg-gray-200 dark:bg-gray-600 rounded" />
          <div className="w-6 h-2 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      </div>
    )
  }
  // standard
  return (
    <div className="w-full h-10 rounded border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-between px-2">
      <div className="space-y-1">
        <div className="w-8 h-1.5 rounded" style={{ backgroundColor: color }} />
        <div className="w-5 h-1 bg-gray-200 dark:bg-gray-600 rounded" />
      </div>
      <div className="w-6 h-6 rounded border-2" style={{ borderColor: color }} />
    </div>
  )
}

function LivePreview({ preset, mode }: { preset: BrandingPreset; mode?: 'quote' | 'invoice' }) {
  const headerStyle = preset.headerStyle || 'standard'
  const quoteLabel = mode === 'invoice' ? (preset.invoiceLabel || 'INVOICE') : (preset.quoteLabel || 'QUOTE')

  return (
    <div
      className="border rounded-xl overflow-hidden text-sm"
      style={{ borderColor: preset.colors.border, backgroundColor: preset.colors.background }}
    >
      {/* Header */}
      {headerStyle === 'banner' && (
        <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: preset.colors.primary }}>
          <div>
            {preset.logoUrl ? (
              <img src={preset.logoUrl} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-white font-bold text-lg">{preset.businessName || 'Your Business'}</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-white/60 text-xs">{preset.businessEmail || ''}</span>
            <p className="text-white font-bold text-xl mt-0.5">{quoteLabel}</p>
          </div>
        </div>
      )}

      {headerStyle === 'accent-bar' && (
        <div className="flex">
          <div className="w-2" style={{ backgroundColor: preset.colors.primary }} />
          <div className="flex-1 px-6 py-4 flex justify-between items-start">
            <div>
              <p className="font-bold" style={{ color: preset.colors.primary }}>{preset.businessName || 'Your Business'}</p>
              <p className="text-xs mt-0.5" style={{ color: preset.colors.textLight }}>{preset.businessAddress || ''}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: preset.colors.primary }}>{quoteLabel}</p>
              <p className="text-xs mt-0.5" style={{ color: preset.colors.textLight }}>#QUO-0001</p>
            </div>
          </div>
        </div>
      )}

      {headerStyle === 'standard' && (
        <div className="px-6 py-4 flex justify-between items-start">
          <div>
            {preset.logoUrl ? (
              <img src={preset.logoUrl} alt="Logo" className="h-10 object-contain" />
            ) : (
              <p className="font-bold text-lg" style={{ color: preset.colors.primary }}>{preset.businessName || 'Your Business'}</p>
            )}
            <p className="text-xs mt-1" style={{ color: preset.colors.textLight }}>{preset.businessAddress || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ fontSize: `${preset.fontSize.title}px`, color: preset.colors.primary }}>{quoteLabel}</p>
            <p className="text-xs mt-1" style={{ color: preset.colors.textLight }}>#QUO-0001</p>
          </div>
        </div>
      )}

      {/* Intro message */}
      {preset.introMessage && (
        <div className="px-6 pb-4">
          <p className="text-xs italic border-l-2 pl-3" style={{ color: preset.colors.textLight, borderColor: preset.colors.border }}>
            {preset.introMessage}
          </p>
        </div>
      )}

      {/* Placeholder line items */}
      <div className="px-6 pb-4">
        <div className="rounded-lg overflow-hidden" style={{ border: preset.showBorders ? `1px solid ${preset.colors.border}` : 'none' }}>
          <div className="px-3 py-2 flex justify-between text-xs font-semibold" style={{ backgroundColor: preset.colors.primary + '15', color: preset.colors.secondary }}>
            <span>Description</span>
            <span>Total</span>
          </div>
          {[{ label: 'Labor — 4 hrs', amount: '$320.00' }, { label: 'Materials', amount: '$140.00' }].map((row) => (
            <div key={row.label} className="px-3 py-2 flex justify-between text-xs" style={{ color: preset.colors.text, borderTop: preset.showBorders ? `1px solid ${preset.colors.border}` : 'none' }}>
              <span>{row.label}</span>
              <span className="font-medium">{row.amount}</span>
            </div>
          ))}
          <div className="px-3 py-2 flex justify-end gap-4 text-xs font-bold border-t" style={{ borderColor: preset.colors.border }}>
            <span style={{ color: preset.colors.textLight }}>TOTAL</span>
            <span style={{ color: preset.colors.accent }}>$460.00</span>
          </div>
        </div>
      </div>

      {/* Signature line */}
      {preset.showSignatureLine && (
        <div className="px-6 pb-4 flex gap-8">
          <div className="flex-1 border-t pt-1" style={{ borderColor: preset.colors.border }}>
            <p className="text-xs" style={{ color: preset.colors.textLight }}>Authorized signature</p>
          </div>
          <div className="flex-1 border-t pt-1" style={{ borderColor: preset.colors.border }}>
            <p className="text-xs" style={{ color: preset.colors.textLight }}>Date</p>
          </div>
        </div>
      )}

      {/* T&C */}
      {preset.termsAndConditions && (
        <div className="px-6 pb-4 border-t pt-3" style={{ borderColor: preset.colors.border }}>
          <p className="text-xs font-semibold mb-1" style={{ color: preset.colors.secondary }}>Terms & Conditions</p>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: preset.colors.textLight }}>{preset.termsAndConditions}</p>
        </div>
      )}
    </div>
  )
}
