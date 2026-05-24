'use client'

import { useState, useEffect } from 'react'
import { InventoryItem, useInventoryStore } from '@/store/inventoryStore'
import { useJobStore } from '@/store/jobStore'
import { useClientStore } from '@/store/clientStore'

interface ItemFormModalProps {
  item?: InventoryItem
  isOpen: boolean
  onClose: () => void
}

export default function ItemFormModal({ item, isOpen, onClose }: ItemFormModalProps) {
  const addItem = useInventoryStore((state) => state.addItem)
  const updateItem = useInventoryStore((state) => state.updateItem)
  const jobs = useJobStore((state) => state.jobs.filter(j => !j.archived))
  const clients = useClientStore((state) => state.clients)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'units',
    currentStock: 0,
    lowStockThreshold: 5,
    notes: '',
    storageType: 'personal' as 'personal' | 'project' | 'property',
    storageLocation: '',
    storageLocationLabel: 'Personal Storage',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        unit: item.unit,
        currentStock: item.currentStock,
        lowStockThreshold: item.lowStockThreshold,
        notes: item.notes,
        storageType: item.storageType ?? (item.storageLocation && item.storageLocation !== 'personal' ? 'project' : 'personal'),
        storageLocation: item.storageLocation === 'personal' ? '' : (item.storageLocation ?? ''),
        storageLocationLabel: item.storageLocationLabel ?? 'Personal Storage',
      })
    } else {
      setFormData({
        name: '',
        category: '',
        unit: 'units',
        currentStock: 0,
        lowStockThreshold: 5,
        notes: '',
        storageType: 'personal',
        storageLocation: '',
        storageLocationLabel: 'Personal Storage',
      })
    }
  }, [item, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (item) {
      updateItem(item.id, formData)
    } else {
      addItem(formData)
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {item ? 'Edit Item' : 'Add Inventory Item'}
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
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. Walnut Wood Sheets"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. Wood, Acrylic, Consumables"
              />
            </div>

            {/* Current Stock & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="sheets, oz, units"
                />
              </div>
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Low Stock Alert Threshold *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You'll see a low stock badge when inventory falls to this level
              </p>
            </div>

            {/* Storage Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Storage Location
              </label>
              {/* 3-way segmented control */}
              <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden mb-2">
                {(['personal', 'project', 'property'] as const).map((type, i) => {
                  const labels = { personal: 'Personal', project: 'Project', property: 'Property' }
                  const icons = {
                    personal: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
                    project: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                    property: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
                  }
                  const isActive = formData.storageType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        if (type === 'personal') {
                          setFormData({ ...formData, storageType: 'personal', storageLocation: '', storageLocationLabel: 'Personal Storage' })
                        } else if (type === 'project') {
                          const first = jobs[0]
                          setFormData({ ...formData, storageType: 'project', storageLocation: first?.id ?? '', storageLocationLabel: first?.title ?? '' })
                        } else {
                          const first = clients[0]
                          setFormData({ ...formData, storageType: 'property', storageLocation: first?.id ?? '', storageLocationLabel: first?.name ?? '' })
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                        i > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''
                      } ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[type]} />
                      </svg>
                      {labels[type]}
                    </button>
                  )
                })}
              </div>

              {/* Sub-picker based on type */}
              {formData.storageType === 'project' && (
                jobs.length === 0
                  ? <p className="text-xs text-gray-500 dark:text-gray-400">No active jobs. Create a job first.</p>
                  : <select
                      value={formData.storageLocation}
                      onChange={(e) => {
                        const job = jobs.find(j => j.id === e.target.value)
                        setFormData({ ...formData, storageLocation: e.target.value, storageLocationLabel: job?.title ?? '' })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
                    </select>
              )}

              {formData.storageType === 'property' && (
                clients.length === 0
                  ? <p className="text-xs text-gray-500 dark:text-gray-400">No clients found. Add a client first.</p>
                  : <select
                      value={formData.storageLocation}
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value)
                        setFormData({ ...formData, storageLocation: e.target.value, storageLocationLabel: client?.name ?? '' })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.address ? ` — ${c.address}` : ''}</option>)}
                    </select>
              )}

              {formData.storageType === 'property' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Materials left at this client&apos;s property from a previous job
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Size, supplier info, usage notes..."
              />
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {item ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
