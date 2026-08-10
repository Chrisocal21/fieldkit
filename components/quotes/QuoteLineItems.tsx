'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { QuoteLineItem } from '@/store/quoteStore'
import { useInventoryStore } from '@/store/inventoryStore'

const PRESET_TAGS = ['Labor', 'Material', 'Parts', 'Travel', 'Equipment', 'Call-out']

interface QuoteLineItemsProps {
  items: QuoteLineItem[]
  onChange: (items: QuoteLineItem[]) => void
}

export default function QuoteLineItems({ items, onChange }: QuoteLineItemsProps) {
  const inventoryItems = useInventoryStore((state) => state.items)
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})

  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      id: nanoid(),
      quoteId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      type: 'material',
      tags: [],
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

  const toggleTag = (item: QuoteLineItem, tag: string) => {
    const current = item.tags ?? []
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]
    updateLineItem(item.id, { tags: next })
  }

  const addCustomTag = (item: QuoteLineItem) => {
    const val = (tagInputs[item.id] ?? '').trim()
    if (!val) return
    const current = item.tags ?? []
    if (!current.includes(val)) updateLineItem(item.id, { tags: [...current, val] })
    setTagInputs(prev => ({ ...prev, [item.id]: '' }))
  }

  const removeTag = (item: QuoteLineItem, tag: string) => {
    updateLineItem(item.id, { tags: (item.tags ?? []).filter(t => t !== tag) })
  }

  const toggleSpecialType = (item: QuoteLineItem, special: 'discount' | 'deposit') => {
    updateLineItem(item.id, { type: item.type === special ? 'material' : special })
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
        <button type="button" onClick={addLineItem} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">+ Add Line</button>
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
          className={`border rounded-lg p-3 ${
            item.type === 'discount'
              ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/50'
              : item.type === 'deposit'
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700/50'
              : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
          }`}
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
              {/* Inventory picker — visible on material rows */}
              {item.type === 'material' && inventoryItems.length > 0 && (
                <select
                  value={item.inventoryItemId ?? ''}
                  onChange={(e) => {
                    const inv = inventoryItems.find(i => i.id === e.target.value)
                    if (inv) {
                      updateLineItem(item.id, {
                        inventoryItemId: inv.id,
                        description: item.description || inv.name,
                      })
                    } else {
                      updateLineItem(item.id, { inventoryItemId: undefined })
                    }
                  }}
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  <option value="">From inventory…</option>
                  {(() => {
                    const personal = inventoryItems.filter(i => (i.storageType ?? 'personal') === 'personal')
                    const project = inventoryItems.filter(i => i.storageType === 'project')
                    const property = inventoryItems.filter(i => i.storageType === 'property')
                    return (
                      <>
                        {personal.length > 0 && (
                          <optgroup label="🏠 Personal">
                            {personal.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit})</option>)}
                          </optgroup>
                        )}
                        {project.length > 0 && (
                          <optgroup label="📋 Project">
                            {project.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit}) — {i.storageLocationLabel}</option>)}
                          </optgroup>
                        )}
                        {property.length > 0 && (
                          <optgroup label="📍 Property">
                            {property.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit}) — {i.storageLocationLabel}</option>)}
                          </optgroup>
                        )}
                      </>
                    )
                  })()}
                </select>
              )}
            </div>

            <div className="col-span-4 sm:col-span-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Qty</label>
              <input
                type="number"
                placeholder="1"
                min="0"
                step="0.01"
                value={item.quantity}
                onFocus={(e) => e.target.select()}
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
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12 sm:col-span-3 flex items-end justify-end">
              <button
                type="button"
                onClick={() => removeLineItem(item.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 pb-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tags row */}
          {item.type !== 'discount' && item.type !== 'deposit' && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {/* Active custom tags */}
              {(item.tags ?? []).filter(t => !PRESET_TAGS.includes(t)).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  {tag}
                  <button type="button" onClick={() => removeTag(item, tag)} className="hover:text-blue-900 dark:hover:text-blue-100">&times;</button>
                </span>
              ))}
              {/* Preset tag toggles */}
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(item, tag)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                    (item.tags ?? []).includes(tag)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {/* Custom tag input */}
              <input
                type="text"
                placeholder="+ custom"
                value={tagInputs[item.id] ?? ''}
                onChange={e => setTagInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(item) } }}
                onBlur={() => addCustomTag(item)}
                className="w-20 px-2 py-0.5 text-xs border border-dashed border-gray-300 dark:border-gray-600 rounded-full bg-transparent text-gray-600 dark:text-gray-400 placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
          )}

          {/* Special type toggles + line total */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => toggleSpecialType(item, 'discount')}
                className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                  item.type === 'discount'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-amber-400 hover:text-amber-600'
                }`}
              >
                Discount
              </button>
              <button
                type="button"
                onClick={() => toggleSpecialType(item, 'deposit')}
                className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                  item.type === 'deposit'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-green-500 hover:text-green-600'
                }`}
              >
                Deposit
              </button>
            </div>

            {/* Line total */}
            <div className="text-sm font-medium">
              {item.type === 'discount' ? (
                <span className="text-amber-600 dark:text-amber-400">−${calculateLineTotal(item).toFixed(2)}</span>
              ) : item.type === 'deposit' ? (
                <span className="text-green-600 dark:text-green-400">−${calculateLineTotal(item).toFixed(2)}</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">${calculateLineTotal(item).toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
