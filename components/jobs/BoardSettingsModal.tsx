'use client'

import { useState } from 'react'
import { useBoardSettingsStore, BoardColumn } from '@/store/boardSettingsStore'

interface BoardSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BoardSettingsModal({ isOpen, onClose }: BoardSettingsModalProps) {
  const columns = useBoardSettingsStore((state) => state.columns)
  const addColumn = useBoardSettingsStore((state) => state.addColumn)
  const updateColumn = useBoardSettingsStore((state) => state.updateColumn)
  const deleteColumn = useBoardSettingsStore((state) => state.deleteColumn)
  const reorderColumns = useBoardSettingsStore((state) => state.reorderColumns)

  const [newColumnLabel, setNewColumnLabel] = useState('')
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null)
  const [draggedColumn, setDraggedColumn] = useState<BoardColumn | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAddColumn = () => {
    if (newColumnLabel.trim()) {
      addColumn(newColumnLabel.trim())
      setNewColumnLabel('')
    }
  }

  const handleUpdateColumn = (column: BoardColumn, label: string) => {
    updateColumn(column.id, { label, status: label })
    setEditingColumn(null)
  }

  const handleDeleteColumn = (id: string) => {
    if (confirm('Delete this column? Jobs in this column will need to be reassigned.')) {
      deleteColumn(id)
    }
  }

  const handleDragStart = (e: React.DragEvent, column: BoardColumn) => {
    setDraggedColumn(column)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (!draggedColumn) return

    const sortedColumns = [...columns].sort((a, b) => a.order - b.order)
    const draggedIndex = sortedColumns.findIndex((col) => col.id === draggedColumn.id)

    if (draggedIndex !== dropIndex) {
      const reordered = [...sortedColumns]
      reordered.splice(draggedIndex, 1)
      reordered.splice(dropIndex, 0, draggedColumn)
      reorderColumns(reordered)
    }

    setDraggedColumn(null)
    setDragOverIndex(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Customize Board Columns
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Add New Column */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add New Column
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColumnLabel}
                  onChange={(e) => setNewColumnLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                  placeholder="Column name (e.g., On Hold, Invoiced)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleAddColumn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Existing Columns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Columns ({columns.length})
              </label>
              <div className="space-y-2">
                {columns.sort((a, b) => a.order - b.order).map((column, index) => (
                  <div
                    key={column.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 flex items-center gap-3 transition-all ${
                      draggedColumn?.id === column.id ? 'opacity-50' : ''
                    } ${
                      dragOverIndex === index && draggedColumn?.id !== column.id
                        ? 'border-blue-500 border-2'
                        : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <div className="text-gray-400 cursor-move">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>

                    {/* Column Label */}
                    {editingColumn?.id === column.id ? (
                      <input
                        type="text"
                        defaultValue={column.label}
                        autoFocus
                        onBlur={(e) => handleUpdateColumn(column, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateColumn(column, e.currentTarget.value)
                          }
                        }}
                        className="flex-1 px-2 py-1 border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    ) : (
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {column.label}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingColumn(column)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      {columns.length > 1 && (
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
