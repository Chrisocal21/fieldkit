'use client'

import { Quote } from '@/store/quoteStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface QuoteCardProps {
  quote: Quote
  onEdit?: () => void
  onDelete?: () => void
  onSend?: () => void
  deleteConfirm?: boolean
}

export function QuoteCard({ quote, onEdit, onDelete, onSend, deleteConfirm }: QuoteCardProps) {
  // Calculate totals (mirrors QuotePreview logic)
  const regularItems = quote.lineItems.filter(i => i.type !== 'discount' && i.type !== 'deposit')
  const discountAmt = quote.lineItems.filter(i => i.type === 'discount').reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const depositAmt = quote.lineItems.filter(i => i.type === 'deposit').reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const subtotal = regularItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxable = Math.max(0, subtotal - discountAmt)
  const tax = taxable * quote.taxRate
  const total = taxable + tax + (quote.roundingAdjustment ?? 0)
  const amountDue = total - depositAmt

  const isExpired = quote.expiryDate && quote.expiryDate < Date.now()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            Quote #{quote.quoteNumber}
          </h3>
          {quote.expiryDate && (
            <p className={`text-xs mt-1 ${
              isExpired 
                ? 'text-red-600 dark:text-red-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {isExpired ? 'Expired' : 'Expires'}: {new Date(quote.expiryDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <StatusBadge status={quote.status} />
      </div>

      <div className="mb-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {quote.lineItems.filter(i => i.type !== 'discount' && i.type !== 'deposit').length} item{regularItems.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        {discountAmt > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Discount</span>
            <span className="text-rose-600 dark:text-rose-400">-${discountAmt.toFixed(2)}</span>
          </div>
        )}
        {quote.taxRate > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Tax ({(quote.taxRate * 100).toFixed(0)}%)
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              ${tax.toFixed(2)}
            </span>
          </div>
        )}
        {depositAmt > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Deposit</span>
            <span className="text-blue-600 dark:text-blue-400">-${depositAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold pt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-900 dark:text-white">{depositAmt > 0 ? 'Amount Due' : 'Total'}</span>
          <span className="text-gray-900 dark:text-white">${amountDue.toFixed(2)}</span>
        </div>
      </div>

      {/* Notes Preview */}
      {quote.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {quote.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Edit
          </button>
        )}
        {onSend && quote.status === 'Draft' && (
          <button
            onClick={onSend}
            className="flex-1 px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Send
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              deleteConfirm
                ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                : 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            {deleteConfirm ? 'Confirm?' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}
