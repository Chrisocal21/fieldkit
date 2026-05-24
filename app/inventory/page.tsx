'use client'

import { useState, useEffect } from 'react'
import { InventoryItem, useInventoryStore } from '@/store/inventoryStore'
import EmptyState from '@/components/shared/EmptyState'
import ItemFormModal from '@/components/inventory/ItemFormModal'
import AdjustmentLog from '@/components/inventory/AdjustmentLog'
import QuickAdjustModal from '@/components/inventory/QuickAdjustModal'

export default function InventoryPage() {
  const allItems = useInventoryStore((state) => state.items)
  const adjustStock = useInventoryStore((state) => state.adjustStock)

  const [mounted, setMounted] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustDelta, setAdjustDelta] = useState(1)

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const items = mounted ? allItems : []

  const handleQuickAdjust = (item: InventoryItem, delta: number) => {
    setSelectedItem(item)
    setAdjustDelta(delta)
    setIsAdjustOpen(true)
  }

  const handleConfirmAdjust = (delta: number, reason: string) => {
    if (selectedItem) {
      adjustStock(selectedItem.id, delta, reason)
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedItem(null)
  }

  if (items.length === 0) {
    return (
      <>
        <EmptyState
          title="No inventory items"
          description="Track consumable materials and supplies. Add your first item to get started."
          action={{
            label: 'Add Item',
            onClick: () => setIsFormOpen(true),
          }}
        />
        <ItemFormModal isOpen={isFormOpen} onClose={handleCloseForm} />
      </>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track consumable materials and supplies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLogOpen(true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg
              className="w-4 h-4 inline mr-1"
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
            History
          </button>
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsFormOpen(true)
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isLowStock = item.currentStock <= item.lowStockThreshold

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header with low stock badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  {item.category && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.category}
                    </p>
                  )}
                </div>
                {isLowStock && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 ml-2">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Stock Level */}
              <div className="flex items-baseline gap-1 mb-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.currentStock}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.unit}</p>
              </div>

              {/* Quick Adjust Controls */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => handleQuickAdjust(item, -1)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={item.currentStock <= 0}
                >
                  <svg
                    className="w-4 h-4 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => handleQuickAdjust(item, 1)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <svg
                    className="w-4 h-4 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Storage location badge */}
              {item.storageLocation && item.storageLocation !== 'personal' ? (
                <div className="flex items-center gap-1 mb-3 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded px-2 py-1 w-fit max-w-full truncate">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="truncate">{item.storageLocationLabel || 'Project'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mb-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded px-2 py-1 w-fit">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Personal
                </div>
              )}

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span>Alert at {item.lowStockThreshold}</span>
                <button
                  onClick={() => handleEditItem(item)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      <ItemFormModal
        item={selectedItem && !isAdjustOpen ? selectedItem : undefined}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
      <AdjustmentLog isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
      <QuickAdjustModal
        item={selectedItem}
        isOpen={isAdjustOpen}
        onClose={() => {
          setIsAdjustOpen(false)
          setSelectedItem(null)
        }}
        onConfirm={handleConfirmAdjust}
        defaultDelta={adjustDelta}
      />
    </div>
  )
}
