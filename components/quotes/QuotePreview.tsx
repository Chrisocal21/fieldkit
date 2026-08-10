'use client'

import { Quote } from '@/store/quoteStore'
import { useBrandingStore, BrandingPreset } from '@/store/brandingStore'
import { useState, useEffect } from 'react'
import BrandingModal from '@/components/branding/BrandingModal'

interface QuotePreviewProps {
  quote: Quote
  presetId?: string
  /** 'invoice' swaps the document title to the branding preset's invoice label instead of its quote label. */
  mode?: 'quote' | 'invoice'
  /** Hides the preset selector + "Customize" row — used when this is embedded in a context (like Branding Studio) that already provides its own preset controls. */
  hideControls?: boolean
}

export default function QuotePreview({ quote, presetId, mode = 'quote', hideControls = false }: QuotePreviewProps) {
  const { getPresetById, getDefaultPreset, presets } = useBrandingStore()
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    presetId || getDefaultPreset().id
  )
  const [brandingOpen, setBrandingOpen] = useState(false)

  // Sync when the Branding Studio switches which preset to preview
  useEffect(() => {
    if (presetId) setSelectedPresetId(presetId)
  }, [presetId])

  const preset = getPresetById(selectedPresetId) || getDefaultPreset()
  const docLabel = mode === 'invoice' ? (preset.invoiceLabel || 'INVOICE') : (preset.quoteLabel || 'QUOTE')

  const regularItems = quote.lineItems.filter(i => i.type !== 'discount' && i.type !== 'deposit')
  const discountItems = quote.lineItems.filter(i => i.type === 'discount')
  const depositItems = quote.lineItems.filter(i => i.type === 'deposit')
  const subtotal = regularItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountTotal = discountItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const depositTotal = depositItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const taxableAmount = Math.max(0, subtotal - discountTotal)
  const tax = taxableAmount * quote.taxRate
  const roundingAdjustment = quote.roundingAdjustment ?? 0
  const total = taxableAmount + tax + roundingAdjustment
  const amountDue = total - depositTotal

  return (
    <div className="space-y-4">
      {!hideControls && (
        <>
          {/* Preset Selector + Customize Style */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              Preview Style:
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => setBrandingOpen(true)}
              title="Customize branding style"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Customize
            </button>
          </div>

          <BrandingModal isOpen={brandingOpen} onClose={() => setBrandingOpen(false)} />
        </>
      )}

      {/* Document Preview */}
      <div
        className="border rounded-lg p-6 sm:p-8 max-w-4xl mx-auto"
        style={{
          backgroundColor: preset.colors.background,
          borderColor: preset.colors.border,
        }}
      >
        {/* Logo */}
        {preset.logoUrl && (preset.headerStyle || 'standard') !== 'banner' && (
          <div
            className={`mb-6 flex ${
              preset.logoPosition === 'center'
                ? 'justify-center'
                : preset.logoPosition === 'right'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <img
              src={preset.logoUrl}
              alt="Logo"
              style={{ width: `${preset.logoWidth}px` }}
              className="object-contain"
            />
          </div>
        )}

        {/* Header — Banner style */}
        {(preset.headerStyle === 'banner') && (
          <div className="rounded-lg px-6 py-4 mb-6 flex justify-between items-center" style={{ backgroundColor: preset.colors.primary }}>
            <div>
              {preset.logoUrl
                ? <img src={preset.logoUrl} alt="Logo" className="h-10 object-contain" />
                : <span className="text-white font-bold text-xl">{preset.businessName || ''}</span>
              }
              {preset.businessAddress && <p className="text-white/70 text-xs mt-0.5">{preset.businessAddress}</p>}
            </div>
            <div className="text-right">
              {preset.businessEmail && <p className="text-white/60 text-xs">{preset.businessEmail}</p>}
              <p className="text-white font-bold mt-1" style={{ fontSize: `${preset.fontSize.title}px` }}>
                {docLabel}
              </p>
              <p className="text-white/60 text-xs mt-0.5">#{quote.quoteNumber}</p>
              <p className="text-white/60 text-xs">{new Date(quote.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Header — Accent Bar style */}
        {(preset.headerStyle === 'accent-bar') && (
          <div className="flex mb-6 rounded-lg overflow-hidden" style={{ border: `1px solid ${preset.colors.border}` }}>
            <div className="w-2 flex-shrink-0" style={{ backgroundColor: preset.colors.primary }} />
            <div className="flex-1 px-5 py-4 flex justify-between items-start">
              <div>
                {preset.logoUrl
                  ? <img src={preset.logoUrl} alt="Logo" style={{ width: `${preset.logoWidth}px` }} className="object-contain mb-1" />
                  : <p className="font-bold text-lg" style={{ color: preset.colors.primary }}>{preset.businessName || ''}</p>
                }
                {preset.businessAddress && <p className="text-xs" style={{ color: preset.colors.textLight }}>{preset.businessAddress}</p>}
                {preset.businessPhone && <p className="text-xs" style={{ color: preset.colors.textLight }}>{preset.businessPhone}</p>}
                {preset.businessEmail && <p className="text-xs" style={{ color: preset.colors.textLight }}>{preset.businessEmail}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ fontSize: `${preset.fontSize.title}px`, color: preset.colors.primary }}>
                  {docLabel}
                </p>
                <p className="text-sm mt-1" style={{ color: preset.colors.textLight }}>#{quote.quoteNumber}</p>
                <p className="text-sm" style={{ color: preset.colors.textLight }}>{new Date(quote.createdAt).toLocaleDateString()}</p>
                {quote.expiryDate && (
                  <p className="text-sm" style={{ color: preset.colors.textLight }}>Valid until: {new Date(quote.expiryDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header — Standard style (default) */}
        {(!preset.headerStyle || preset.headerStyle === 'standard') && (
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1
                className="font-bold mb-2"
                style={{
                  fontSize: `${preset.fontSize.title}px`,
                  color: preset.colors.primary,
                }}
              >
                {docLabel}
              </h1>
              <p className="text-sm" style={{ color: preset.colors.textLight }}>#{quote.quoteNumber}</p>
              <p className="text-sm" style={{ color: preset.colors.textLight }}>{new Date(quote.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  quote.status === 'Accepted'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : quote.status === 'Declined'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : quote.status === 'Sent'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {quote.status}
              </span>
              {quote.expiryDate && (
                <p className="text-sm mt-2" style={{ color: preset.colors.textLight }}>
                  Valid until: {new Date(quote.expiryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status badge for non-standard headers */}
        {preset.headerStyle && preset.headerStyle !== 'standard' && (
          <div className="flex justify-end mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                quote.status === 'Accepted'
                  ? 'bg-green-100 text-green-800'
                  : quote.status === 'Declined'
                  ? 'bg-red-100 text-red-800'
                  : quote.status === 'Sent'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {quote.status}
            </span>
          </div>
        )}

        {/* Intro message */}
        {preset.introMessage && (
          <div className="mb-6 px-4 py-3 rounded-lg" style={{ backgroundColor: preset.colors.primary + '10', borderLeft: `3px solid ${preset.colors.primary}` }}>
            <p className="text-sm italic" style={{ color: preset.colors.textLight }}>{preset.introMessage}</p>
          </div>
        )}

        {/* Business Info — only for Standard headers; Banner and Accent Bar
            headers already show business identity themselves, so this would
            otherwise duplicate it. */}
        {(!preset.headerStyle || preset.headerStyle === 'standard') &&
          (preset.businessName || preset.businessAddress || preset.businessPhone || preset.businessEmail) && (
          <div className="mb-6">
            <h2
              className="text-sm font-semibold uppercase mb-2"
              style={{
                fontSize: `${preset.fontSize.heading}px`,
                color: preset.colors.secondary,
              }}
            >
              From
            </h2>
            {preset.businessName && (
              <p
                className="font-medium"
                style={{
                  fontSize: `${preset.fontSize.body}px`,
                  color: preset.colors.text,
                }}
              >
                {preset.businessName}
              </p>
            )}
            {preset.businessAddress && (
              <p
                className="text-sm"
                style={{ color: preset.colors.textLight }}
              >
                {preset.businessAddress}
              </p>
            )}
            {preset.businessPhone && (
              <p
                className="text-sm"
                style={{ color: preset.colors.textLight }}
              >
                {preset.businessPhone}
              </p>
            )}
            {preset.businessEmail && (
              <p
                className="text-sm"
                style={{ color: preset.colors.textLight }}
              >
                {preset.businessEmail}
              </p>
            )}
          </div>
        )}

        {/* Client Info */}
        <div className="mb-8">
          <h2
            className="text-sm font-semibold uppercase mb-2"
            style={{
              fontSize: `${preset.fontSize.heading}px`,
              color: preset.colors.secondary,
            }}
          >
            To
          </h2>
          <p
            className="font-medium"
            style={{
              fontSize: `${preset.fontSize.body}px`,
              color: preset.colors.text,
            }}
          >
            {quote.clientName}
          </p>
          {quote.clientEmail && (
            <p
              className="text-sm"
              style={{ color: preset.colors.textLight }}
            >
              {quote.clientEmail}
            </p>
          )}
          {quote.clientPhone && (
            <p
              className="text-sm"
              style={{ color: preset.colors.textLight }}
            >
              {quote.clientPhone}
            </p>
          )}
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <h3
            className="font-semibold uppercase mb-3"
            style={{
              fontSize: `${preset.fontSize.heading}px`,
              color: preset.colors.secondary,
            }}
          >
            Items
          </h3>
          <table className="w-full">
            <thead>
              <tr
                style={{
                  borderBottomWidth: preset.showBorders ? '2px' : '0',
                  borderColor: preset.colors.border,
                }}
              >
                <th
                  className="text-left py-2 font-semibold"
                  style={{
                    fontSize: `${preset.fontSize.small}px`,
                    color: preset.colors.text,
                  }}
                >
                  Description
                </th>
                <th
                  className="text-right py-2 font-semibold w-20"
                  style={{
                    fontSize: `${preset.fontSize.small}px`,
                    color: preset.colors.text,
                  }}
                >
                  Qty
                </th>
                <th
                  className="text-right py-2 font-semibold w-24"
                  style={{
                    fontSize: `${preset.fontSize.small}px`,
                    color: preset.colors.text,
                  }}
                >
                  Price
                </th>
                <th
                  className="text-right py-2 font-semibold w-28"
                  style={{
                    fontSize: `${preset.fontSize.small}px`,
                    color: preset.colors.text,
                  }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.filter(i => i.type !== 'discount' && i.type !== 'deposit').map((item, index, arr) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottomWidth: preset.showBorders && index !== arr.length - 1 ? '1px' : '0',
                    borderColor: preset.colors.border,
                  }}
                >
                  <td
                    className="py-3"
                    style={{
                      fontSize: `${preset.fontSize.body}px`,
                      color: preset.colors.text,
                    }}
                  >
                    <div>{item.description}</div>
                    {(item.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(item.tags ?? []).map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: preset.colors.border, color: preset.colors.textLight }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td
                    className="py-3 text-right"
                    style={{
                      fontSize: `${preset.fontSize.body}px`,
                      color: preset.colors.text,
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className="py-3 text-right"
                    style={{
                      fontSize: `${preset.fontSize.body}px`,
                      color: preset.colors.text,
                    }}
                  >
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td
                    className="py-3 text-right font-medium"
                    style={{
                      fontSize: `${preset.fontSize.body}px`,
                      color: preset.colors.text,
                    }}
                  >
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span
                style={{
                  fontSize: `${preset.fontSize.body}px`,
                  color: preset.colors.textLight,
                }}
              >
                Subtotal:
              </span>
              <span
                className="font-medium"
                style={{
                  fontSize: `${preset.fontSize.body}px`,
                  color: preset.colors.text,
                }}
              >
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between">
                <span style={{ fontSize: `${preset.fontSize.body}px`, color: '#d97706' }}>Discount:</span>
                <span className="font-medium" style={{ fontSize: `${preset.fontSize.body}px`, color: '#d97706' }}>−${discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span
                style={{
                  fontSize: `${preset.fontSize.body}px`,
                  color: preset.colors.textLight,
                }}
              >
                Tax ({(quote.taxRate * 100).toFixed(1)}%):
              </span>
              <span
                className="font-medium"
                style={{
                  fontSize: `${preset.fontSize.body}px`,
                  color: preset.colors.text,
                }}
              >
                ${tax.toFixed(2)}
              </span>
            </div>
            {roundingAdjustment > 0 && (
              <div className="flex justify-between">
                <span
                  style={{
                    fontSize: `${preset.fontSize.body}px`,
                    color: preset.colors.textLight,
                  }}
                >
                  Rounding:
                </span>
                <span
                  className="font-medium"
                  style={{
                    fontSize: `${preset.fontSize.body}px`,
                    color: preset.colors.text,
                  }}
                >
                  +${roundingAdjustment.toFixed(2)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between font-bold pt-2"
              style={{
                borderTopWidth: preset.showBorders ? '2px' : '0',
                borderColor: preset.colors.border,
              }}
            >
              <span
                style={{
                  fontSize: `${preset.fontSize.heading}px`,
                  color: preset.accentColor,
                }}
              >
                TOTAL:
              </span>
              <span
                style={{
                  fontSize: `${preset.fontSize.heading}px`,
                  color: preset.accentColor,
                }}
              >
                ${total.toFixed(2)}
              </span>
            </div>
            {depositTotal > 0 && (
              <>
                <div className="flex justify-between">
                  <span style={{ fontSize: `${preset.fontSize.body}px`, color: '#16a34a' }}>Deposit received:</span>
                  <span className="font-medium" style={{ fontSize: `${preset.fontSize.body}px`, color: '#16a34a' }}>−${depositTotal.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between font-bold pt-2"
                  style={{
                    borderTopWidth: preset.showBorders ? '2px' : '0',
                    borderColor: preset.colors.border,
                  }}
                >
                  <span style={{ fontSize: `${preset.fontSize.heading}px`, color: preset.accentColor }}>AMOUNT DUE:</span>
                  <span style={{ fontSize: `${preset.fontSize.heading}px`, color: preset.accentColor }}>${amountDue.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div
            className="pt-6"
            style={{
              borderTopWidth: preset.showBorders ? '1px' : '0',
              borderColor: preset.colors.border,
            }}
          >
            <h3
              className="font-semibold uppercase mb-2"
              style={{
                fontSize: `${preset.fontSize.heading}px`,
                color: preset.colors.secondary,
              }}
            >
              Notes
            </h3>
            <p
              className="whitespace-pre-wrap"
              style={{
                fontSize: `${preset.fontSize.small}px`,
                color: preset.colors.textLight,
              }}
            >
              {quote.notes}
            </p>
          </div>
        )}

        {/* Terms & Conditions */}
        {preset.termsAndConditions && (
          <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${preset.colors.border}` }}>
            <h3
              className="font-semibold uppercase mb-2"
              style={{ fontSize: `${preset.fontSize.heading}px`, color: preset.colors.secondary }}
            >
              Terms &amp; Conditions
            </h3>
            <p
              className="whitespace-pre-wrap leading-relaxed"
              style={{ fontSize: `${preset.fontSize.small}px`, color: preset.colors.textLight }}
            >
              {preset.termsAndConditions}
            </p>
          </div>
        )}

        {/* Signature Line */}
        {preset.showSignatureLine && (
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b-2 pb-1 mb-1" style={{ borderColor: preset.colors.border }} />
              <p style={{ fontSize: `${preset.fontSize.small}px`, color: preset.colors.textLight }}>Authorized signature</p>
            </div>
            <div>
              <div className="border-b-2 pb-1 mb-1" style={{ borderColor: preset.colors.border }} />
              <p style={{ fontSize: `${preset.fontSize.small}px`, color: preset.colors.textLight }}>Date</p>
            </div>
          </div>
        )}

        {/* Footer / tagline */}
        {preset.footerText && (
          <div className="mt-8 pt-6" style={{ borderTopWidth: '1px', borderColor: preset.colors.border }}>
            <p
              className="whitespace-pre-wrap text-center"
              style={{
                fontSize: `${preset.fontSize.small}px`,
                color: preset.colors.textLight,
              }}
            >
              {preset.footerText}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
