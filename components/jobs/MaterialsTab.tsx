'use client'

import { useState } from 'react'
import { useMaterialCostStore, JobMaterial } from '@/store/materialCostStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { useJobStore } from '@/store/jobStore'

interface MaterialsTabProps {
  jobId: string
}

export default function MaterialsTab({ jobId }: MaterialsTabProps) {
  const materials = useMaterialCostStore((state) => state.getJobMaterialsByJobId(jobId))
  const calculateJobMaterialCost = useMaterialCostStore((state) => state.calculateJobMaterialCost)
  const addJobMaterial = useMaterialCostStore((state) => state.addJobMaterial)
  const deleteJobMaterial = useMaterialCostStore((state) => state.deleteJobMaterial)
  const updateJobMaterial = useMaterialCostStore((state) => state.updateJobMaterial)
  const inventoryItems = useInventoryStore((state) => state.items)
  const job = useJobStore((state) => state.jobs.find(j => j.id === jobId))

  // Material-type line items from sent/accepted quotes — read-only, from billing
  const quoteMaterials = (job?.quotes || [])
    .filter(q => q.status === 'Sent' || q.status === 'Accepted')
    .flatMap(q =>
      q.lineItems
        .filter(li => li.type === 'material')
        .map(li => ({ ...li, quoteNumber: q.quoteNumber, quoteId: q.id }))
    )

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<JobMaterial | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const totalMaterialCost = calculateJobMaterialCost(jobId)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const materialData = {
      jobId,
      description: formData.get('description') as string,
      quantity: parseFloat(formData.get('quantity') as string),
      unitCost: parseFloat(formData.get('unitCost') as string),
      notes: (formData.get('notes') as string) || undefined,
      inventoryItemId: (formData.get('inventoryItemId') as string) || undefined
    }

    if (editingMaterial) {
      updateJobMaterial(editingMaterial.id, materialData)
    } else {
      addJobMaterial(materialData)
    }

    setShowAddModal(false)
    setEditingMaterial(null)
  }

  const handleEdit = (material: JobMaterial) => {
    setEditingMaterial(material)
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      deleteJobMaterial(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Materials Used</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track actual material costs for this job
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMaterial(null)
            setShowAddModal(true)
          }}
          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
        >
          Add Material
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Material Cost</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalMaterialCost.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Items Used</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {materials.length}
            </p>
          </div>
        </div>
      </div>

      {/* Quote Materials — auto-populated from sent quotes */}
      {quoteMaterials.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">From Quotes</p>
          <div className="space-y-2">
            {quoteMaterials.map((item) => (
              <div key={item.id} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.quantity} × ${item.unitPrice.toFixed(2)} = ${(item.quantity * item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">Quote #{item.quoteNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manually Added Materials */}
      {materials.length === 0 && quoteMaterials.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No materials recorded yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Track materials used to calculate accurate job costs</p>
        </div>
      ) : materials.length > 0 ? (
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {material.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {material.quantity} × ${material.unitCost.toFixed(2)} = ${material.totalCost.toFixed(2)}
                  </p>
                  {material.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {material.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => handleEdit(material)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className={`text-sm px-2 py-1 rounded transition-colors ${
                      deleteConfirmId === material.id
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'text-red-400 hover:text-red-600 dark:hover:text-red-300'
                    }`}
                  >
                    {deleteConfirmId === material.id ? 'Confirm?' : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Added {new Date(material.usedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add/Edit Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingMaterial ? 'Edit Material' : 'Add Material'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  defaultValue={editingMaterial?.description}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Material name or description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    step="0.01"
                    min="0.01"
                    required
                    defaultValue={editingMaterial?.quantity}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Cost *
                  </label>
                  <input
                    type="number"
                    name="unitCost"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editingMaterial?.unitCost}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link to Inventory Item
                  <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">(auto-deducts stock)</span>
                </label>
                <select
                  name="inventoryItemId"
                  defaultValue={editingMaterial?.inventoryItemId || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">None — manual entry</option>
                  {(() => {
                    const personal = inventoryItems.filter(i => (i.storageType ?? 'personal') === 'personal')
                    const project = inventoryItems.filter(i => i.storageType === 'project')
                    const property = inventoryItems.filter(i => i.storageType === 'property')
                    return (
                      <>
                        {personal.length > 0 && (
                          <optgroup label="🏠 Personal Storage">
                            {personal.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit})</option>)}
                          </optgroup>
                        )}
                        {project.length > 0 && (
                          <optgroup label="📋 Project Storage">
                            {project.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit}) — {i.storageLocationLabel}</option>)}
                          </optgroup>
                        )}
                        {property.length > 0 && (
                          <optgroup label="📍 Property Storage">
                            {property.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit}) — {i.storageLocationLabel}</option>)}
                          </optgroup>
                        )}
                      </>
                    )
                  })()}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={editingMaterial?.notes}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brand, supplier, or other details"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingMaterial(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg"
                >
                  {editingMaterial ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
