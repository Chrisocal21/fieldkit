'use client'

import { useInventoryStore } from '@/store/inventoryStore'

interface AdjustmentLogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdjustmentLog({ isOpen, onClose }: AdjustmentLogProps) {
  const adjustments = useInventoryStore((state) => state.adjustments)
  const items = useInventoryStore((state) => state.items)

  if (!isOpen) return null

  // Sort adjustments by date (newest first)
  const sortedAdjustments = [...adjustments].sort((a, b) => b.adjustedAt - a.adjustedAt)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Adjustment History
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {sortedAdjustments.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">No adjustments recorded yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Stock changes will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedAdjustments.map((adjustment) => {
                  const item = items.find((i) => i.id === adjustment.itemId)
                  const isIncrease = adjustment.delta > 0

                  return (
                    <div
                      key={adjustment.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {item?.name || 'Unknown Item'}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isIncrease
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {isIncrease ? '+' : ''}
                              {adjustment.delta} {item?.unit || 'units'}
                            </span>
                          </div>
                          
                          {adjustment.reason && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {adjustment.reason}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(adjustment.adjustedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
