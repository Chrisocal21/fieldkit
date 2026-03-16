'use client'

import { useState, useEffect } from 'react'
import { InventoryItem } from '@/store/inventoryStore'

interface QuickAdjustModalProps {
  item: InventoryItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (delta: number, reason: string) => void
  defaultDelta?: number
}

export default function QuickAdjustModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  defaultDelta = 1,
}: QuickAdjustModalProps) {
  const [delta, setDelta] = useState(defaultDelta)
  const [reason, setReason] = useState('')

  useEffect(() => {
    setDelta(defaultDelta)
    setReason('')
  }, [isOpen, defaultDelta])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(delta, reason || (delta > 0 ? 'Added to stock' : 'Removed from stock'))
    onClose()
  }

  if (!isOpen || !item) return null

  const isIncrease = delta > 0
  const newStock = item.currentStock + delta

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isIncrease ? 'Add to Stock' : 'Remove from Stock'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Item Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current stock: {item.currentStock} {item.unit}
              </p>
            </div>

            {/* Quantity Adjustment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity to {isIncrease ? 'add' : 'remove'} *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDelta(Math.max(isIncrease ? 1 : -item.currentStock, delta - 1))}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  required
                  value={Math.abs(delta)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    setDelta(isIncrease ? Math.abs(val) : -Math.abs(val))
                  }}
                  min="0.01"
                  step="0.01"
                  className="flex-1 px-4 py-2 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setDelta(delta + (isIncrease ? 1 : -1))}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. Delivery, Pickup, Job site request"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['Delivery', 'Pickup', 'Job site request', 'Restock', 'Used for job', 'Damaged'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setReason(suggestion)}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* New Stock Preview */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">New stock level:</span>
                <span
                  className={`font-semibold ${
                    newStock <= item.lowStockThreshold
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {newStock} {item.unit}
                  {newStock <= item.lowStockThreshold && ' ⚠️'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 rounded-md text-white ${
                  isIncrease
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isIncrease ? 'Add' : 'Remove'} {Math.abs(delta)} {item.unit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
