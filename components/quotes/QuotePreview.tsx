'use client'

import { Quote } from '@/store/quoteStore'

interface QuotePreviewProps {
  quote: Quote
}

export default function QuotePreview({ quote }: QuotePreviewProps) {
  const subtotal = quote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const tax = subtotal * quote.taxRate
  const total = subtotal + tax

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            QUOTE
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            #{quote.quoteNumber}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Valid until: {new Date(quote.expiryDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
          Client
        </h2>
        <p className="text-base font-medium text-gray-900 dark:text-white">
          {quote.clientName}
        </p>
        {quote.clientEmail && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {quote.clientEmail}
          </p>
        )}
        {quote.clientPhone && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {quote.clientPhone}
          </p>
        )}
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              <th className="text-left py-2 text-sm font-semibold text-gray-900 dark:text-white">
                Description
              </th>
              <th className="text-right py-2 text-sm font-semibold text-gray-900 dark:text-white w-20">
                Qty
              </th>
              <th className="text-right py-2 text-sm font-semibold text-gray-900 dark:text-white w-24">
                Price
              </th>
              <th className="text-right py-2 text-sm font-semibold text-gray-900 dark:text-white w-28">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, index) => (
              <tr
                key={item.id}
                className={
                  index !== quote.lineItems.length - 1
                    ? 'border-b border-gray-200 dark:border-gray-700'
                    : ''
                }
              >
                <td className="py-3 text-sm text-gray-900 dark:text-white">
                  <div>{item.description}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {item.type}
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-900 dark:text-white text-right">
                  {item.quantity}
                </td>
                <td className="py-3 text-sm text-gray-900 dark:text-white text-right">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
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
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Tax ({(quote.taxRate * 100).toFixed(1)}%):
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-gray-300 dark:border-gray-600">
            <span className="text-gray-900 dark:text-white">TOTAL:</span>
            <span className="text-gray-900 dark:text-white">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Notes / Terms
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {quote.notes}
          </p>
        </div>
      )}
    </div>
  )
}
