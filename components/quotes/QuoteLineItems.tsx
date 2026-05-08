'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { QuoteLineItem } from '@/store/quoteStore'

interface QuoteLineItemsProps {
  items: QuoteLineItem[]
  onChange: (items: QuoteLineItem[]) => void
}

export default function QuoteLineItems({ items, onChange }: QuoteLineItemsProps) {
  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      id: nanoid(),
      quoteId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      type: 'material',
      sortOrder: items.length,
    }
    onChange([...items, newItem])
  }

  const updateLineItem = (id: string, updates: Partial<QuoteLineItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const removeLineItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const calculateLineTotal = (item: QuoteLineItem) => {
    return item.quantity * item.unitPrice
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Line Items
        </label>
        <button
          type="button"
          onClick={addLineItem}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          + Add Line
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No line items yet. Click "Add Line" to start.
          </p>
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50"
        >
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-12 sm:col-span-5">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Labour, Materials..."
                value={item.description}
                onChange={(e) =>
                  updateLineItem(item.id, { description: e.target.value })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-4 sm:col-span-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Qty</label>
              <input
                type="number"
                placeholder="1"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) =>
                  updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-4 sm:col-span-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Price ($)</label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-4 sm:col-span-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <select
                value={item.type}
                onChange={(e) =>
                  updateLineItem(item.id, {
                    type: e.target.value as 'material' | 'labor' | 'other',
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="material">Material</option>
                <option value="labor">Labor</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-span-12 sm:col-span-1 flex items-center justify-end sm:justify-center">
              <button
                type="button"
                onClick={() => removeLineItem(item.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-right text-sm text-gray-600 dark:text-gray-400">
            Total: ${calculateLineTotal(item).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}
