'use client'

import { useState } from 'react'
import { useBrandingStore } from '@/store/brandingStore'

const today = new Date()
const dueDate = new Date(today.getTime() + 30 * 86400000)
const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const MOCK = {
  client: 'Alex Thompson',
  address: '127 Maple Drive\nPortland, OR 97201',
  email: 'alex@example.com',
  phone: '(503) 555-0142',
  date: fmt(today),
  due: fmt(dueDate),
  quoteNum: 'QUO-0042',
  invoiceNum: 'INV-0042',
  items: [
    { description: 'Interior Painting — Living Room & Hallway', qty: 1, price: 1200 },
    { description: 'Premium Paint & Primer (3 gal)', qty: 3, price: 68 },
    { description: 'Tape, drop cloths & rollers', qty: 1, price: 45 },
  ],
  taxRate: 0.08,
}


export default function BrandDocPreview() {
  const preset = useBrandingStore(s => s.getDefaultPreset())
  const [docMode, setDocMode] = useState<'quote' | 'invoice'>('quote')

  const subtotal = MOCK.items.reduce((s, i) => s + i.qty * i.price, 0)
  const tax = subtotal * MOCK.taxRate
  const total = subtotal + tax

  const headerStyle = preset.headerStyle || 'standard'
  const docLabel = docMode === 'invoice' ? (preset.invoiceLabel || 'INVOICE') : (preset.quoteLabel || 'QUOTE')
  const docNum = docMode === 'invoice' ? MOCK.invoiceNum : MOCK.quoteNum
  const fontFamily = preset.fontFamily || 'Helvetica'
  const fontClass = fontFamily === 'Georgia' || fontFamily === 'Times' ? 'font-serif' : fontFamily === 'Courier' ? 'font-mono' : 'font-sans'
  const c = preset.colors

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

      {/* Scrollable document */}
      <div className="flex-1 overflow-auto p-4 bg-slate-900/30">
        {/* zoom scales the doc visually; the wrapper clips overflow */}
        <div className="origin-top" style={{ zoom: 0.52 }}>
          <div
            className={`w-full rounded-xl shadow-2xl overflow-hidden ${fontClass}`}
            style={{ backgroundColor: c.background, color: c.text, fontFamily }}
          >

            {/* ── BANNER header ── */}
            {headerStyle === 'banner' && (
              <div className="p-10" style={{ backgroundColor: c.primary }}>
                <div className="flex items-start justify-between">
                  <div>
                    {preset.logoUrl && <img src={preset.logoUrl} alt="" style={{ maxHeight: 52, marginBottom: 12 }} className="object-contain" />}
                    <div className="text-3xl font-bold text-white">{preset.businessName || 'Your Business'}</div>
                    <div className="text-sm mt-1.5 text-white/70 whitespace-pre-line">{preset.businessAddress || '123 Business Ave, City, ST 12345'}</div>
                    <div className="text-sm text-white/70">{preset.businessEmail || 'hello@business.com'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-black tracking-widest text-white/20">{docLabel}</div>
                    <div className="text-white font-bold text-xl mt-2">#{docNum}</div>
                    <div className="text-white/70 text-sm mt-1">{MOCK.date}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ACCENT BAR header ── */}
            {headerStyle === 'accent-bar' && (
              <div className="flex">
                <div className="w-3 flex-shrink-0" style={{ backgroundColor: c.primary }} />
                <div className="flex-1 p-10 flex items-start justify-between">
                  <div>
                    {preset.logoUrl && <img src={preset.logoUrl} alt="" style={{ maxHeight: 44, marginBottom: 10 }} className="object-contain" />}
                    <div className="text-2xl font-bold" style={{ color: c.text }}>{preset.businessName || 'Your Business'}</div>
                    <div className="text-sm mt-1 whitespace-pre-line" style={{ color: c.textLight }}>{preset.businessAddress || '123 Business Ave, City, ST 12345'}</div>
                    <div className="text-sm" style={{ color: c.textLight }}>{preset.businessEmail || 'hello@business.com'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black" style={{ color: c.primary }}>{docLabel}</div>
                    <div className="font-bold text-xl mt-2" style={{ color: c.text }}>#{docNum}</div>
                    <div className="text-sm mt-1" style={{ color: c.textLight }}>{MOCK.date}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STANDARD header ── */}
            {(headerStyle === 'standard' || !headerStyle) && (
              <div className="p-10 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    {preset.logoUrl && <img src={preset.logoUrl} alt="" style={{ maxHeight: 48, marginBottom: 12 }} className="object-contain" />}
                    <div className="text-2xl font-bold" style={{ color: c.text }}>{preset.businessName || 'Your Business'}</div>
                    <div className="text-sm mt-1 whitespace-pre-line" style={{ color: c.textLight }}>{preset.businessAddress || '123 Business Ave, City, ST 12345'}</div>
                    <div className="text-sm" style={{ color: c.textLight }}>{preset.businessEmail || 'hello@business.com'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black" style={{ color: c.primary }}>{docLabel}</div>
                    <div className="text-sm mt-2" style={{ color: c.textLight }}>#{docNum}</div>
                    <div className="text-sm" style={{ color: c.textLight }}>{MOCK.date}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Body ── */}
            <div className="px-10 pb-10 space-y-6">

              {/* Intro message */}
              {preset.introMessage && (
                <div className="p-4 rounded-lg border-l-4" style={{ borderColor: c.primary, backgroundColor: `${c.primary}18` }}>
                  <p className="text-sm italic" style={{ color: c.text }}>{preset.introMessage}</p>
                </div>
              )}

              {/* Bill to / details */}
              <div className="flex gap-16">
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: c.textLight }}>Bill To</div>
                  <div className="font-semibold text-lg" style={{ color: c.text }}>{MOCK.client}</div>
                  <div className="text-sm whitespace-pre-line mt-0.5" style={{ color: c.textLight }}>{MOCK.address}</div>
                  <div className="text-sm" style={{ color: c.textLight }}>{MOCK.email}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: c.textLight }}>Details</div>
                  <div className="text-sm space-y-1">
                    <div style={{ color: c.textLight }}>Date: <span style={{ color: c.text }}>{MOCK.date}</span></div>
                    <div style={{ color: c.textLight }}>Due: <span style={{ color: c.text }}>{MOCK.due}</span></div>
                    <div style={{ color: c.textLight }}>Ref: <span style={{ color: c.text }}>{docNum}</span></div>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: c.primary }}>
                    <th className="text-left px-4 py-3 text-white font-semibold rounded-tl-lg" style={{ fontSize: `${preset.fontSize?.heading || 12}pt` }}>Description</th>
                    <th className="text-center px-4 py-3 text-white font-semibold w-20" style={{ fontSize: `${preset.fontSize?.heading || 12}pt` }}>Qty</th>
                    <th className="text-right px-4 py-3 text-white font-semibold w-32" style={{ fontSize: `${preset.fontSize?.heading || 12}pt` }}>Rate</th>
                    <th className="text-right px-4 py-3 text-white font-semibold w-32 rounded-tr-lg" style={{ fontSize: `${preset.fontSize?.heading || 12}pt` }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK.items.map((item, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: i % 2 !== 0 ? `${c.primary}0a` : 'transparent',
                        borderBottom: preset.showBorders !== false ? `1px solid ${c.border}` : 'none',
                      }}
                    >
                      <td className="px-4 py-3" style={{ color: c.text, fontSize: `${preset.fontSize?.body || 10}pt` }}>{item.description}</td>
                      <td className="px-4 py-3 text-center" style={{ color: c.textLight, fontSize: `${preset.fontSize?.body || 10}pt` }}>{item.qty}</td>
                      <td className="px-4 py-3 text-right" style={{ color: c.textLight, fontSize: `${preset.fontSize?.body || 10}pt` }}>${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: c.text, fontSize: `${preset.fontSize?.body || 10}pt` }}>${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm" style={{ color: c.textLight }}>
                    <span>Subtotal</span><span style={{ color: c.text }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: c.textLight }}>
                    <span>Tax ({(MOCK.taxRate * 100).toFixed(0)}%)</span><span style={{ color: c.text }}>${tax.toFixed(2)}</span>
                  </div>
                  <div
                    className="flex justify-between font-bold text-xl pt-2 border-t"
                    style={{ borderColor: c.border, color: c.text, fontSize: `${preset.fontSize?.title || 22}pt` }}
                  >
                    <span>Total</span>
                    <span style={{ color: c.primary }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* T&C */}
              {preset.termsAndConditions && (
                <div className="pt-6 border-t" style={{ borderColor: c.border }}>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: c.textLight }}>Terms & Conditions</div>
                  <p className="text-xs leading-relaxed" style={{ color: c.textLight }}>{preset.termsAndConditions}</p>
                </div>
              )}

              {/* Signature */}
              {preset.showSignatureLine && (
                <div className="pt-6 border-t flex gap-16" style={{ borderColor: c.border }}>
                  <div>
                    <div className="border-b-2 w-56 mb-2" style={{ borderColor: c.border }} />
                    <div className="text-xs" style={{ color: c.textLight }}>Authorized Signature</div>
                  </div>
                  <div>
                    <div className="border-b-2 w-36 mb-2" style={{ borderColor: c.border }} />
                    <div className="text-xs" style={{ color: c.textLight }}>Date</div>
                  </div>
                </div>
              )}

              {/* Footer */}
              {preset.footerText && (
                <div className="pt-4 text-center border-t" style={{ borderColor: c.border, color: c.textLight, fontSize: `${preset.fontSize?.small || 8}pt` }}>
                  {preset.footerText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
