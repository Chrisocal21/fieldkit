'use client'

import { Quote } from '@/store/quoteStore'
import { useBrandingStore, BrandingPreset } from '@/store/brandingStore'
import { useState } from 'react'

interface QuotePreviewProps {
  quote: Quote
  presetId?: string
}

export default function QuotePreview({ quote, presetId }: QuotePreviewProps) {
  const { getPresetById, getDefaultPreset, presets } = useBrandingStore()
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    presetId || getDefaultPreset().id
  )
  
  const preset = getPresetById(selectedPresetId) || getDefaultPreset()
  
  const subtotal = quote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const tax = subtotal * quote.taxRate
  const total = subtotal + tax

  return (
    <div className="space-y-4">
      {/* Preset Selector */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview Style:
        </label>
        <select
          value={selectedPresetId}
          onChange={(e) => setSelectedPresetId(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.isDefault ? '(Default)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Document Preview */}
      <div
        className="border rounded-lg p-6 sm:p-8 max-w-4xl mx-auto"
        style={{
          backgroundColor: preset.colors.background,
          borderColor: preset.colors.border,
        }}
      >
        {/* Logo */}
        {preset.logoUrl && (
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

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              className="font-bold mb-2"
              style={{
                fontSize: `${preset.fontSize.title}px`,
                color: preset.colors.primary,
              }}
            >
              QUOTE
            </h1>
            <p
              className="text-sm"
              style={{ color: preset.colors.textLight }}
            >
              #{quote.quoteNumber}
            </p>
            <p
              className="text-sm"
              style={{ color: preset.colors.textLight }}
            >
              {new Date(quote.createdAt).toLocaleDateString()}
            </p>
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
              <p
                className="text-sm mt-2"
                style={{ color: preset.colors.textLight }}
              >
                Valid until: {new Date(quote.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Business Info */}
        {(preset.businessName || preset.businessAddress || preset.businessPhone || preset.businessEmail) && (
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
              {quote.lineItems.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottomWidth: preset.showBorders && index !== quote.lineItems.length - 1 ? '1px' : '0',
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
                    <div
                      className="text-xs capitalize"
                      style={{ color: preset.colors.textLight }}
                    >
                      {item.type}
                    </div>
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
              Notes / Terms
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

        {/* Footer */}
        {preset.footerText && (
          <div className="mt-8 pt-6" style={{ borderTopWidth: '1px', borderColor: preset.colors.border }}>
            <p
              className="whitespace-pre-wrap"
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
